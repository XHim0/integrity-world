(function () {
  'use strict';

  const el = id => document.getElementById(id);
  const title = el('title'), form = el('auth-form'), usernameInput = el('auth-username'), password = el('auth-password');
  const avatars = [...document.querySelectorAll('[data-avatar]')];
  const controls = [...title.querySelectorAll('button, input'), el('b-account')].filter(Boolean);
  let authAction = 'login', stage = 'auth', avatar = 'male', identity = '';
  let busy = false, restoring = true, generation = 0, lastStatus = '';

  function status(message, failed = false, connectionError = false) {
    const node = stage === 'character' ? el('identity-name') : el('auth-status');
    node.textContent = stage === 'character' ? `${identity}${message ? ' · ' + message : ''}` : message;
    node.classList.toggle('error', failed);
    node.setAttribute('role', 'status');
    const localPreview = location.protocol === 'file:' || ['127.0.0.1', 'localhost'].includes(location.hostname) && location.port !== '8766';
    el('auth-service-link').classList.toggle('hide', !(stage === 'auth' && connectionError && localPreview));
  }

  function resetValidation() {
    usernameInput.removeAttribute('aria-invalid');
    password.removeAttribute('aria-invalid');
  }

  function invalidField(field, message) {
    field.setAttribute('aria-invalid', 'true');
    status(message, true);
    field.focus();
    return false;
  }

  function validateCredentials(username, secret) {
    if (!username) return invalidField(usernameInput, '請輸入帳號名稱。');
    if (authAction === 'register' && !/^[A-Za-z0-9_\u3400-\u4DBF\u4E00-\u9FFF]{3,24}$/.test(username)) {
      return invalidField(usernameInput, el('auth-username-help').textContent);
    }
    if (!secret) return invalidField(password, '請輸入帳號密碼。');
    if (authAction === 'register' && (secret.length < 8 || secret.length > 128 ||
        !/[A-Za-z]/.test(secret) || !/[0-9]/.test(secret) || !/[\p{P}\p{S}]/u.test(secret))) {
      return invalidField(password, '密碼格式不符，請依欄位下方規則設定。');
    }
    return true;
  }

  function lock(value) {
    busy = value;
    controls.forEach(control => { control.disabled = value; });
    form.setAttribute('aria-busy', String(value));
    el('character-entry').setAttribute('aria-busy', String(value));
  }

  function accountLabel() {
    const button = el('b-account');
    if (button) button.textContent = saveMode === 'account' ? '儲存並登出' : '返回登入';
  }

  function chooseAvatar(value) {
    avatar = value === 'female' ? 'female' : 'male';
    avatars.forEach(button => {
      const selected = button.dataset.avatar === avatar;
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('sel', selected);
    });
  }

  function showCharacters(message = '', failed = false) {
    stage = 'character';
    el('auth-entry').classList.add('hide');
    el('character-entry').classList.remove('hide');
    chooseAvatar(S.avatar);
    accountLabel();
    status(message, failed);
    el('enter-world').focus();
  }

  function showAuth(message = '', failed = false) {
    stage = 'auth';
    password.value = '';
    resetValidation();
    el('character-entry').classList.add('hide');
    el('auth-entry').classList.remove('hide');
    status(message, failed);
  }

  function selectAccount(result) {
    if (!result?.user) throw new Error('未取得帳號工作階段，請重新登入。');
    saveMode = 'account';
    saveAccountId = result.user.id;
    S = loadState(result.save);
    identity = `帳號：${result.user.username}`;
    showCharacters();
  }

  function selectGuest() {
    if (busy || mode !== 'title') return;
    generation++;
    password.value = '';
    saveMode = 'guest';
    saveAccountId = null;
    S = guestState();
    identity = '訪客 · 進度只保存在此瀏覽器';
    showCharacters();
  }

  function selectTab(action) {
    if (busy) return;
    generation++;
    authAction = action;
    for (const name of ['login', 'register']) {
      el('auth-' + name).classList.toggle('sel', action === name);
      el('auth-' + name).setAttribute('aria-pressed', String(action === name));
    }
    const registering = action === 'register';
    password.value = '';
    resetValidation();
    usernameInput.placeholder = registering ? '建立帳號名稱（3–24 個字元）' : '請輸入帳號名稱';
    password.placeholder = registering ? '建立帳號密碼（8–128 個字元）' : '請輸入帳號密碼';
    password.autocomplete = registering ? 'new-password' : 'current-password';
    for (const field of [usernameInput, password]) {
      const helpId = field.id + '-help';
      el(helpId).classList.toggle('hide', !registering);
      field.setAttribute('aria-describedby', registering ? `${helpId} auth-status` : 'auth-status');
    }
    el('auth-submit').textContent = registering ? '建立帳號並登入' : '登入帳號';
    status(registering ? '建立帳號後，進度會保存在目前連線的遊戲伺服器。' : '輸入帳號名稱與帳號密碼以讀取調查進度。');
  }

  async function submit(event) {
    event.preventDefault();
    if (busy || stage !== 'auth' || mode !== 'title') return;
    const token = ++generation;
    const username = usernameInput.value.trim(), secret = password.value;
    resetValidation();
    if (!validateCredentials(username, secret)) return;
    password.value = '';
    lastStatus = '';
    lock(true);
    status(authAction === 'register' ? '正在建立帳號…' : '正在登入…');
    try {
      const result = await ACCOUNT[authAction](username, secret);
      if (token === generation) selectAccount(result);
    } catch (failure) {
      if (token === generation) {
        if (failure.message === '帳號名稱或密碼錯誤') {
          usernameInput.setAttribute('aria-invalid', 'true');
          password.setAttribute('aria-invalid', 'true');
        }
        status(failure.message || '帳號操作失敗，請重試。', true, failure.code === 'service_unavailable');
      }
    } finally {
      password.value = '';
      lock(false);
      if (stage === 'character') el('enter-world').focus();
      else password.focus();
    }
  }

  function stopGameplay() {
    mode = 'title';
    Object.keys(keys).forEach(key => { keys[key] = 0; });
    lightOn = false;
    closeDialog();
    closeUI();
    title.classList.remove('hide');
  }

  async function returnToTitle() {
    if (busy || mode === 'title') return;
    generation++;
    stopGameplay();
    password.value = '';
    if (saveMode === 'guest') {
      save();
      showAuth('訪客進度保留於此瀏覽器。可登入帳號或繼續使用訪客模式。');
      el('auth-username').focus();
      return;
    }
    lock(true);
    lastStatus = '';
    showAuth('正在儲存帳號進度並登出…');
    try {
      if (ACCOUNT.user?.id !== saveAccountId || ACCOUNT.mode !== 'account') {
        throw new Error('帳號工作階段已失效或變更，無法確認儲存及登出。');
      }
      const result = await ACCOUNT.saveProgress(S);
      if (!result?.user || result.user.id !== saveAccountId) {
        throw new Error(lastStatus || '帳號進度未確認儲存；尚未執行登出。');
      }
      const loggedOut = await ACCOUNT.logout();
      if (loggedOut?.user !== null) throw new Error('伺服器未確認登出，請重試。');
      showAuth('已儲存並登出。請登入帳號或選擇訪客模式。');
    } catch (failure) {
      showCharacters(`${failure.message || '登出失敗。'} 進度仍保留於本頁；可繼續調查，或返回登入另選訪客。`, true);
    } finally {
      lock(false);
      if (stage === 'character') el('enter-world').focus();
      else el('auth-username').focus();
    }
  }

  ACCOUNT.onStatus = message => {
    lastStatus = message;
    if (message === '帳號進度已儲存。' || busy || restoring || saveMode !== 'account') return;
    status(message, true);
    if (mode !== 'title') toast(message);
  };

  el('auth-login').onclick = () => selectTab('login');
  el('auth-register').onclick = () => selectTab('register');
  form.addEventListener('submit', submit);
  form.addEventListener('input', () => {
    generation++;
    resetValidation();
    if (el('auth-status').classList.contains('error')) status('');
  });
  el('b-start').onclick = selectGuest;
  el('change-account').onclick = () => {
    if (busy || stage !== 'character') return;
    generation++;
    showAuth('請登入帳號或選擇訪客模式；切換身分不會把帳號進度寫入訪客存檔。');
    el('auth-username').focus();
  };
  avatars.forEach(button => {
    button.onclick = () => { if (!busy && stage === 'character') chooseAvatar(button.dataset.avatar); };
    const canvas = el('avatar-' + button.dataset.avatar), context = canvas.getContext('2d');
    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(charSprite(avatarLook(button.dataset.avatar), 0, 0), 0, 0, canvas.width, canvas.height);
  });
  el('enter-world').onclick = () => {
    if (busy || stage !== 'character' || mode !== 'title') return;
    generation++;
    S.avatar = avatar;
    save();
    stage = 'game';
    document.activeElement?.blur();
    start();
  };
  if (el('b-account')) el('b-account').onclick = returnToTitle;

  accountLabel();
  const restoreToken = generation;
  ACCOUNT.restore().then(result => {
    if (restoreToken !== generation || mode !== 'title' || stage !== 'auth') return;
    if (result.user) selectAccount(result);
    else status('可登入帳號、建立帳號，或以訪客身分開始調查。');
  }).catch(failure => {
    if (restoreToken === generation && mode === 'title' && stage === 'auth') {
      status(failure.message || '帳號服務無法連線，仍可使用訪客模式。', true, failure.code === 'service_unavailable');
    }
  }).finally(() => { restoring = false; });
})();
