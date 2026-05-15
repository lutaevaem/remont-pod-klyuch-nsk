document.addEventListener('DOMContentLoaded', async () => {
  const loginShell = document.querySelector('#admin-login');
  const appShell = document.querySelector('#admin-app');
  const loginForm = document.querySelector('#admin-login-form');
  const loginStatus = document.querySelector('#login-status');
  const logoutButton = document.querySelector('#logout-button');
  const userNote = document.querySelector('#admin-user-note');

  function setLoginStatus(message, type = '') {
    if (!loginStatus) return;
    loginStatus.textContent = message;
    loginStatus.className = `login-status ${type}`.trim();
  }

  function getClient() {
    const config = window.SUPABASE_CONFIG;
    if (!config || !window.supabase) return null;
    if (!window.adminSupabaseClient) {
      window.adminSupabaseClient = window.supabase.createClient(config.url, config.publishableKey);
    }
    return window.adminSupabaseClient;
  }

  function showLogin() {
    if (loginShell) loginShell.hidden = false;
    if (appShell) appShell.hidden = true;
  }

  function showApp(user) {
    if (loginShell) loginShell.hidden = true;
    if (appShell) appShell.hidden = false;
    if (userNote) userNote.textContent = user?.email ? `Вы вошли как ${user.email}.` : 'Вы вошли как администратор сайта.';
    window.dispatchEvent(new CustomEvent('admin:authenticated', { detail: { user } }));
  }

  const client = getClient();
  if (!client) {
    showLogin();
    setLoginStatus('Не удалось подключить Supabase. Обновите страницу.', 'error');
    return;
  }

  const { data } = await client.auth.getSession();
  if (data?.session?.user) showApp(data.session.user);
  else showLogin();

  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const email = formData.get('email');
    const password = formData.get('password');
    setLoginStatus('Проверяем доступ...');
    const { data: signInData, error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginStatus(`Не удалось войти: ${error.message}`, 'error');
      return;
    }
    setLoginStatus('Вход выполнен.', 'success');
    showApp(signInData.user);
  });

  logoutButton?.addEventListener('click', async () => {
    await client.auth.signOut();
    showLogin();
    setLoginStatus('Вы вышли из админки. Для работы войдите снова.');
  });

  client.auth.onAuthStateChange((_event, session) => {
    if (session?.user) showApp(session.user);
    else showLogin();
  });
});
