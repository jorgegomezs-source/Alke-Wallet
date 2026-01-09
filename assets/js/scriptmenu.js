// Recupera el saldo actual desde localStorage, o usa el saldo por defecto si no está establecido
let currentBalance = localStorage.getItem("accountBalance");

// Validación si el saldo existe y es un número
if (currentBalance === null || isNaN(currentBalance)) {
    currentBalance = 60000; // Saldo por defecto
    localStorage.setItem("accountBalance", currentBalance);
}

document.addEventListener("DOMContentLoaded", function() {
    // Actualiza el saldo en la página
    const balanceElement = document.getElementById("accountBalance");
    if (balanceElement) {
        balanceElement.textContent = "$" + parseFloat(currentBalance).toLocaleString('es-CL');
    }
});

//Ventana de confirmacion
function MensajeDepositar() {
  return confirm("Redirigiendo a la página de depósito");
}

function MensajeEnviar() {
  return confirm("Redirigiendo a la página de enviar dinero");
}

function MensajeMovimientos() {
  return confirm("Redirigiendo a la página de movimientos");
}
