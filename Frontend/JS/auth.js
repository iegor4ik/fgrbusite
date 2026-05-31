const loginForm = document.getElementById('loginForm');

loginForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const username = formData.get('username')?.toString().trim();
  const password = formData.get('password')?.toString();

  if (username === 'root' && password === 'fgrwusite2026') {
    window.location.href = 'admin.html';
  } else {
    alert('Невірний логін або пароль');
  }
});
