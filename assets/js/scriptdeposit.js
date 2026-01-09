function formatCurrency(n) {
    return '$' + Number(n).toLocaleString();
}

function showAlert(message, type = 'success', autoDismiss = true, dismissMs = 4000) {
    const alertHtml = ` <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`;
    $('#alert-container').html(alertHtml);
    if (autoDismiss) {
        setTimeout(() => $('#alert-container').html(''), dismissMs);
    }
}

$(document).ready(function() {
    let currentBalance = parseFloat(localStorage.getItem("accountBalance"));
    if (isNaN(currentBalance)) {
        currentBalance = 60000;
    }
    $('#currentBalance').text(formatCurrency(currentBalance));
    $('#depositCurrentBalance').text(formatCurrency(currentBalance));
});

document.addEventListener("DOMContentLoaded", function() {
    const depositForm = document.getElementById("depositForm");

    if (depositForm) {
        depositForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const depositAmountInput = document.getElementById("depositAmount");
            const depositAmount = parseFloat(depositAmountInput.value);

            if (isNaN(depositAmount) || depositAmount <= 0) {
                showAlert("Por favor, ingrese un monto válido mayor a 0.", 'danger');
                $('#depositSuccessLegend').hide();
                return;
            }

            // Recupera el saldo actual
            let currentBalance = parseFloat(localStorage.getItem("accountBalance"));
            if (isNaN(currentBalance)) {
                currentBalance = 60000;
            }

            // Actualiza el saldo
            const newBalance = currentBalance + depositAmount;
            localStorage.setItem("accountBalance", newBalance);

            // Actualiza displays en la página si jQuery está disponible
            if (typeof $ !== 'undefined') {
                $('#currentBalance').text(formatCurrency(newBalance));
                $('#depositCurrentBalance').text(formatCurrency(newBalance));
            }

            // Registra la transacción
            const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
            transactions.push({
                description: "Depósito",
                amount: depositAmount,
                date: new Date().toISOString()
            });
            localStorage.setItem("transactions", JSON.stringify(transactions));

            // Muestra alerta de éxito y la leyenda con el monto depositado
            showAlert(`Depósito exitoso. Nuevo saldo: ${formatCurrency(newBalance)}`, 'success', true, 2000);
            $('#depositedAmount').text(formatCurrency(depositAmount));
            $('#depositSuccessLegend').show();

            // Redirige a la página principal tras 2 segundos
            setTimeout(() => {
                window.location.href = "menu.html";
            }, 2000);
        });
    }
});
