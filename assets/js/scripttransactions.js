document.addEventListener("DOMContentLoaded", function() {
    const transactionList = document.getElementById("transactionList");
    const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    const transactionFilter = document.getElementById('transactionFilter');

    function formatCurrency(n) {
        return '$' + Number(n).toLocaleString('es-CL');
    }

    // Tipo de transacción a partir
    function getTipoTransaccion(tipo) {
        switch (tipo) {
            case 'deposit': return 'Depósito';
            case 'transfer': return 'Transferencia';
            case 'received': return 'Transferencia (recibida)';
            case 'purchase': return 'Compra';
            default: return 'Otro';
        }
    }

    // Deposito o transferencia
    function inferTipo(tx) {
        const desc = (tx.description || '').toLowerCase();
        if (desc.includes('depósito') || desc.includes('deposito')) return 'deposit';
        if (desc.includes('transferencia') && (tx.amount < 0)) return 'transfer';
        if (desc.includes('transferencia') && (tx.amount >= 0)) return 'received';
        if (desc.includes('compra') || desc.includes('compra de')) return 'purchase';
        // Fallback based on amount
        if (tx.amount > 0) return 'deposit';
        if (tx.amount < 0) return 'transfer';
        return 'other';
    }

    // Show latest movements filtered by type
    function mostrarUltimosMovimientos(filtro = 'all') {
        transactionList.innerHTML = '';

        const items = (transactions.slice()).reverse(); // copy and reverse
        const filtered = items.filter(tx => {
            const tipo = tx.type || inferTipo(tx);
            if (filtro === 'all') return true;
            return tipo === filtro;
        });

        if (filtered.length === 0) {
            transactionList.innerHTML = '<li class="list-group-item text-center">No hay movimientos recientes.</li>';
            return;
        }

        filtered.forEach(tx => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';

            const tipo = tx.type || inferTipo(tx);
            const isNegative = tx.amount < 0;
            const amountClass = isNegative ? 'text-danger' : 'text-success';
            const amountPrefix = isNegative ? '-' : '+';

            li.innerHTML = `
                <div>
                  <small class="text-muted me-2">${getTipoTransaccion(tipo)}</small>
                  <span>${tx.description}</span>
                </div>
                <div>
                  <span class="${amountClass} fw-bold">${amountPrefix}${formatCurrency(Math.abs(tx.amount))}</span>
                </div>
            `;

            transactionList.appendChild(li);
        });
    }

    // Initialize
    mostrarUltimosMovimientos('all');

    if (transactionFilter) {
        transactionFilter.addEventListener('change', function() {
            mostrarUltimosMovimientos(this.value);
        });
    }
});
