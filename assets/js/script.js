$(document).ready(function () {
  //Utiliza $('#loginForm').submit(...) 
  $('#loginForm').submit(function (event) {
    event.preventDefault();

    // Los selectores de jQuery para obtener los valores directamente con $('#email').val() y $('#password').val()
    const email = $('#email').val();
    const password = $('#password').val();

    // Credenciales por defecto
    const validEmail = "user@example.com";
    const validPassword = "123456";

    function showAlert(message, type = 'success', autoDismiss = true, dismissMs = 4000) {
      const alertHtml = ` <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`;
      $('#loginAlertContainer').html(alertHtml);
      if (autoDismiss) {
        setTimeout(() => $('#loginAlertContainer').html(''), dismissMs);
      }
    }

    if (email === validEmail && password === validPassword) {
      showAlert('¡Inicio de sesión exitoso!', 'success', false);
      // Redirigir ligeramente después de mostrar la alerta
      setTimeout(() => {
        window.location.href = 'menu.html';
      }, 800);
    } else {
      showAlert('Credenciales incorrectas. Por favor, inténtelo de nuevo.', 'danger');
    }
  });
});

/* ===== Mostrar / ocultar contraseña ===== */
$('#togglePwd').on('click', function () {
  const $input = $('#password');
  const $icon  = $('#eyeIcon');

  if ($input.attr('type') === 'password') {
    $input.attr('type', 'text');
    $icon.removeClass('bi-eye').addClass('bi-eye-slash');
  } else {
    $input.attr('type', 'password');
    $icon.removeClass('bi-eye-slash').addClass('bi-eye');
  }
});


