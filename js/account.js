/* Same-origin account transport. Guest storage and applying game state belong to the game. */
(function () {
  'use strict';

  const DEBOUNCE_MS = 500;
  const MAX_SAVE_BYTES = 128 * 1024;
  // Local development keeps the Node service; the hosted site uses its Edge Function.
  const API = (location.protocol === 'https:' && !['127.0.0.1', 'localhost'].includes(location.hostname))
    ? '/functions/v1/app/api' : '/api';
  let generation = 0;
  let transitions = 0;
  let authQueue = Promise.resolve();
  let pending = null;
  let timer = null;
  let activeWrite = null;

  const ACCOUNT = {
    user: null,
    save: null,
    loadouts: null,
    mode: 'guest',
    available: false,
    onStatus: null,
    restore,
    register: (username, password) => changeSession(API + '/register', 'POST', { username, password }, '帳號已建立並登入。'),
    login: (username, password) => changeSession(API + '/login', 'POST', { username, password }, '已登入帳號。'),
    logout: () => changeSession(API + '/logout', 'POST', {}, '已登出，可繼續使用訪客模式。'),
    loadSave: () => changeSession(API + '/save', 'GET').then(result => result.save),
    saveProgress,
  };

  function notify(message) {
    if (typeof ACCOUNT.onStatus === 'function') {
      try { ACCOUNT.onStatus(message); } catch { /* UI callbacks must not break the queue. */ }
    }
  }

  function error(code, message, status = 0) {
    return Object.assign(new Error(message), { code, status });
  }

  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const isUserId = id => (Number.isSafeInteger(id) && id > 0)
    || (typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id));
  function isSession(value) {
    return isObject(value) && Object.hasOwn(value, 'user') && Object.hasOwn(value, 'save') &&
      (value.user === null || (isObject(value.user) && isUserId(value.user.id) && typeof value.user.username === 'string')) &&
      (value.save === null || isObject(value.save)) && (value.user !== null || value.save === null);
  }

  function unavailable() {
    ACCOUNT.available = false;
    return error('service_unavailable', '帳號服務無法連線；仍可使用訪客模式。');
  }

  async function request(url, method = 'GET', body, expectedUserId) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const headers = { Accept: 'application/json' };
    if (method !== 'GET') headers['Content-Type'] = 'application/json';
    if (expectedUserId !== undefined) headers['X-Account-Id'] = String(expectedUserId);
    try {
      let response;
      let value;
      try {
        response = await fetch(url, {
          method,
          credentials: 'same-origin',
          mode: 'same-origin',
          redirect: 'error',
          cache: 'no-store',
          headers,
          body: method === 'GET' ? undefined : JSON.stringify(body),
          signal: controller.signal,
        });
        if (!(response.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) throw unavailable();
        value = await response.json();
      } catch {
        throw unavailable();
      }
      if (!response.ok) {
        if (!isObject(value) || typeof value.error !== 'string' || typeof value.message !== 'string') throw unavailable();
        ACCOUNT.available = true;
        throw error(value.error, value.message, response.status);
      }
      if (!isSession(value)) throw unavailable();
      ACCOUNT.available = true;
      return value;
    } finally {
      clearTimeout(timeout);
    }
  }

  function clearIdentity() {
    ACCOUNT.user = null;
    ACCOUNT.save = null;
    ACCOUNT.loadouts = null;
    ACCOUNT.mode = 'guest';
  }

  function apply(result) {
    ACCOUNT.user = result.user;
    ACCOUNT.save = result.save;
    ACCOUNT.loadouts = result.user ? result.loadouts || null : null;
    ACCOUNT.mode = result.user ? 'account' : 'guest';
  }

  function discardPending() {
    clearTimeout(timer);
    timer = null;
    if (pending) pending.resolve(null);
    pending = null;
  }

  // A principal change invalidates queued snapshots immediately. Requests that can
  // change the session cookie wait for any dispatched save, then run in order.
  function changeSession(url, method, body, successMessage) {
    const version = ++generation;
    transitions++;
    discardPending();
    clearIdentity();
    const operation = authQueue.then(async () => {
      if (activeWrite) await activeWrite.promise;
      const result = await request(url, method, body);
      if (version !== generation) throw error('operation_superseded', '此帳號操作已由較新的操作取代。');
      apply(result);
      if (successMessage) notify(successMessage);
      return result;
    }).catch(failure => {
      if (version === generation) {
        clearIdentity();
        notify(failure.message);
      }
      throw failure;
    }).finally(() => { transitions--; });
    authQueue = operation.catch(() => {});
    return operation;
  }

  function restore() {
    return changeSession(API + '/session', 'GET').then(result => {
      notify(result.user ? `已恢復帳號：${result.user.username}` : '目前使用訪客模式。');
      return result;
    });
  }

  function schedule() {
    clearTimeout(timer);
    timer = null;
    if (!pending || transitions || activeWrite) return;
    timer = setTimeout(flush, Math.max(0, pending.due - Date.now()));
  }

  function flush() {
    timer = null;
    if (!pending || transitions || activeWrite) return;
    const item = pending;
    pending = null;
    if (item.generation !== generation || ACCOUNT.mode !== 'account' || !ACCOUNT.available) {
      item.resolve(null);
      return;
    }
    const write = { promise: null };
    activeWrite = write;
    write.promise = (async () => {
      try {
        const result = await request(API + '/save', 'PUT', { save: item.snapshot }, item.userId);
        if (item.generation !== generation) return null;
        if (!result.user || result.user.id !== item.userId) {
          throw error('session_changed', '帳號工作階段已變更，請重新載入帳號存檔。');
        }
        // A newer local snapshot remains queued; only confirmed data is exposed.
        apply(result);
        notify('帳號進度已儲存。');
        return result;
      } catch (failure) {
        if (item.generation === generation) {
          // Do not replay this write or a queued snapshot after an error. A
          // network failure also disables writes until an explicit restore/login.
          discardPending();
          if (failure.status === 401 || failure.code === 'session_changed') {
            generation++;
            clearIdentity();
          }
          notify(`進度未確認儲存：${failure.message}`);
        }
        return null;
      }
    })().then(result => {
      item.resolve(result);
      return result;
    }).finally(() => {
      if (activeWrite === write) activeWrite = null;
      schedule();
    });
  }

  // Resolves with {user, save} when confirmed, or null if guest, superseded,
  // cancelled, or failed. Background failures go to onStatus, never an unhandled
  // rejection. Authentication and restore/load operations instead reject errors.
  function saveProgress(save) {
    if (transitions || ACCOUNT.mode !== 'account' || !ACCOUNT.user || !ACCOUNT.available) return Promise.resolve(null);
    let snapshot;
    try {
      if (save !== null && !isObject(save)) throw error('invalid_save', '存檔須為 JSON 物件或 null。');
      const text = JSON.stringify(save);
      if (typeof text !== 'string') throw error('invalid_save', '存檔內容無法序列化。');
      if (new TextEncoder().encode(text).byteLength > MAX_SAVE_BYTES) throw error('save_too_large', '存檔不可超過 128 KiB。');
      snapshot = JSON.parse(text);
      if (snapshot !== null && !isObject(snapshot)) throw error('invalid_save', '存檔須為 JSON 物件或 null。');
    } catch (failure) {
      discardPending();
      notify(failure.code ? failure.message : '存檔格式無效，未傳送進度。');
      return Promise.resolve(null);
    }
    // Replacing the pending promise bounds memory even when the game saves on
    // every frame. Clone now so later game mutations cannot alter the snapshot.
    discardPending();
    const promise = new Promise(resolve => {
      pending = { snapshot, resolve, userId: ACCOUNT.user.id, generation, due: Date.now() + DEBOUNCE_MS };
    });
    schedule();
    return promise;
  }

  globalThis.ACCOUNT = ACCOUNT;
})();
