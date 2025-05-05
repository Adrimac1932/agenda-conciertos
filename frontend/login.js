// login.js
const VALID_USER = 'admin';
const VALID_PASS = 'admin';

window.login = function(event) {
  event.preventDefault();
  const user = document.getElementById('user').value;
  const pass = document.getElementById('pass').value;

  if (user === VALID_USER && pass === VALID_PASS) {
    // guardamos estado en sessionStorage
    sessionStorage.setItem('loggedIn', 'true');
    // redirigimos al listado
    window.location = 'index.html';
  } else {
    alert('Credenciales inválidas');
  }
};
