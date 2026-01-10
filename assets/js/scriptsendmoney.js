document.addEventListener("DOMContentLoaded", function () {
  function formatCurrency(n) {
    return '$' + Number(n).toLocaleString();
  }

  // --------- Agregar Contacto (modal + inline) ---------
  const saveContactBtn = document.getElementById("saveContactBtn");
  const saveContactInlineBtn = document.getElementById("saveContactInlineBtn");
  const toggleAddContactBtn = document.getElementById("toggleAddContactBtn");
  const cancelAddContactInlineBtn = document.getElementById("cancelAddContactInlineBtn");
  const contactList = document.getElementById("contactList");

  // Reusable add contact function
  function addContactToList(name, cbu, alias, bank) {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.innerHTML = `
      <div class="contact-info">
        <span class="contact-name">${name}</span>
        <span class="contact-details">CBU: ${cbu}, Alias: ${alias}, Banco: ${bank}</span>
      </div>
    `;
    // Agrega un click event al nuevo contacto para la selección
    li.addEventListener("click", function() {
        selectContact(li);
    });

    contactList.appendChild(li);
  }

  // ---- Validation helpers ----
  function validateCBU(cbu) {
    return /^\d{22}$/.test(cbu);
  }

  function validateContactFields(suffix = '') {
    const nameEl = document.getElementById(`contactName${suffix}`);
    const cbuEl = document.getElementById(`contactCBU${suffix}`);
    const aliasEl = document.getElementById(`contactAlias${suffix}`);
    const bankEl = document.getElementById(`contactBank${suffix}`);

    let valid = true;

    const name = (nameEl && nameEl.value || '').trim();
    let cbu = (cbuEl && cbuEl.value || '').replace(/\D/g, '');
    const alias = (aliasEl && aliasEl.value || '').trim();
    const bank = (bankEl && bankEl.value || '').trim();

    if (!name) {
      nameEl.classList.add('is-invalid');
      valid = false;
    } else {
      nameEl.classList.remove('is-invalid');
    }

    if (!validateCBU(cbu)) {
      cbuEl.classList.add('is-invalid');
      valid = false;
    } else {
      cbuEl.classList.remove('is-invalid');
      // normalize the input to digits only
      cbuEl.value = cbu;
    }

    if (!alias) {
      aliasEl.classList.add('is-invalid');
      valid = false;
    } else {
      aliasEl.classList.remove('is-invalid');
    }

    if (!bank) {
      bankEl.classList.add('is-invalid');
      valid = false;
    } else {
      bankEl.classList.remove('is-invalid');
    }

    return valid;
  }

  // Clear validation on input
  document.addEventListener('input', function(e) {
    if (e.target && e.target.matches('#addContactForm input, #addContactInlineForm input')) {
      e.target.classList.remove('is-invalid');
    }
  });

  if (saveContactBtn) {
    saveContactBtn.addEventListener("click", function () {
      if (!validateContactFields('')) {
        return;
      }

      const name = document.getElementById("contactName").value.trim();
      const cbu = document.getElementById("contactCBU").value.replace(/\D/g, '');
      const alias = document.getElementById("contactAlias").value.trim();
      const bank = document.getElementById("contactBank").value.trim();

      addContactToList(name, cbu, alias, bank);

      alert("Contacto agregado exitosamente");
      document.getElementById("addContactForm").reset();
      // Cierra el modal programáticamente - asumiendo que bootstrap es global
      const modalEl = document.getElementById('exampleModal');
      const modal = bootstrap.Modal.getInstance(modalEl);
      if(modal){
          modal.hide();
      }

    });
  }

  // Toggle inline form
  if (toggleAddContactBtn) {
    toggleAddContactBtn.addEventListener("click", function() {
      // Use jQuery slide toggle for smooth UX
      $('#addContactInline').slideToggle();
      // Clear validation when showing
      $('#addContactInlineForm input').removeClass('is-invalid');
    });
  }

  // Cancel inline form
  if (cancelAddContactInlineBtn) {
    cancelAddContactInlineBtn.addEventListener("click", function() {
      $('#addContactInline').slideUp();
      const formInline = document.getElementById('addContactInlineForm');
      if (formInline) formInline.reset();
      // Clear validation
      $('#addContactInlineForm input').removeClass('is-invalid');
    });
  }

  // Save inline contact
  if (saveContactInlineBtn) {
    saveContactInlineBtn.addEventListener("click", function() {
      if (!validateContactFields('Inline')) {
        return;
      }

      const name = document.getElementById("contactNameInline").value.trim();
      const cbu = document.getElementById("contactCBUInline").value.replace(/\D/g, '');
      const alias = document.getElementById("contactAliasInline").value.trim();
      const bank = document.getElementById("contactBankInline").value.trim();

      addContactToList(name, cbu, alias, bank);
      alert("Contacto agregado exitosamente");
      document.getElementById("addContactInlineForm").reset();
      $('#addContactInline').slideUp();
    });
  }

  // --------- Seleccionar Contacto ---------
  // Agrega un listener a los elementos existentes
  const existingItems = contactList.querySelectorAll(".list-group-item");
  existingItems.forEach(item => {
      item.addEventListener("click", function() {
          selectContact(item);
      });
  });

  // --------- Búsqueda en la agenda de transferencias ---------
  const searchInput = document.getElementById('searchContact');

  function filterContacts(query) {
    const q = (query || '').trim().toLowerCase();
    const items = contactList.querySelectorAll('.list-group-item');
    let visible = 0;

    items.forEach(item => {
      // Ignorar el elemento de "no resultados" si existe
      if (item.id === 'noContactsFound') return;
      const name = (item.querySelector('.contact-name') && item.querySelector('.contact-name').textContent || '').toLowerCase();
      const details = (item.querySelector('.contact-details') && item.querySelector('.contact-details').textContent || '').toLowerCase();

      if (!q || name.includes(q) || details.includes(q)) {
        item.style.display = '';
        visible++;
      } else {
        item.style.display = 'none';
      }
    });

    const noEl = document.getElementById('noContactsFound');
    if (visible === 0) {
      if (!noEl) {
        const li = document.createElement('li');
        li.className = 'list-group-item text-muted';
        li.id = 'noContactsFound';
        li.textContent = 'No se encontraron contactos.';
        contactList.appendChild(li);
      }
    } else {
      if (noEl) noEl.remove();
    }

    // Si el contacto seleccionado quedó oculto por el filtro, limpiar la selección y ocultar el botón
    if (selectedContact) {
      if (selectedContact.style.display === 'none') {
        selectedContact.classList.remove('active');
        selectedContact = null;
        const openBtn = document.getElementById('openSendMoneyModalBtn');
        if (openBtn) openBtn.classList.add('d-none');
      }
    }
  }

  if (searchInput) {
    // Filtrar en tiempo real mientras el usuario escribe
    searchInput.addEventListener('input', function() {
      filterContacts(this.value);
    });

    // Permitir búsqueda al enviar el campo si está dentro de un formulario
    const form = searchInput.closest('form');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        filterContacts(searchInput.value);
      });
    }
  }

  let selectedContact = null;

  function selectContact(element) {
      const openBtn = document.getElementById('openSendMoneyModalBtn');

      // Toggle if clicking the already-selected contact
      if (element.classList.contains('active')) {
        element.classList.remove('active');
        selectedContact = null;
        if (openBtn) openBtn.classList.add('d-none');
        return;
      }

      // Remueve la clase active de todos
      const allContacts = contactList.querySelectorAll(".list-group-item");
      allContacts.forEach(c => c.classList.remove("active"));
      
      // Agrega la clase active al seleccionado
      element.classList.add("active");
      selectedContact = element;

      // Mostrar el botón de enviar dinero
      if (openBtn) openBtn.classList.remove('d-none');
  }

  // --------- Enviar Dinero Logica ---------
  // Mostrar saldo actual usando jQuery (obtenido de localStorage)
  $(document).ready(function() {
    let currentBalance = parseFloat(localStorage.getItem("accountBalance"));
    if (isNaN(currentBalance)) {
      currentBalance = 60000; // saldo por defecto
    }
    $('#currentBalance').text(formatCurrency(currentBalance));
    $('#modalCurrentBalance').text(formatCurrency(currentBalance));

    // actualizar el balance cada vez que se abre el modal de enviar
    $('#exampleModal2').on('show.bs.modal', function () {
      let curr = parseFloat(localStorage.getItem("accountBalance"));
      if (isNaN(curr)) curr = 60000;
      $('#modalCurrentBalance').text(formatCurrency(curr));
    });
  });

  function showSendAlert(message, type = 'success', autoDismiss = true, dismissMs = 3000) {
    const alertHtml = ` <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`;
    $('#sendAlertContainer').html(alertHtml);
    if (autoDismiss) {
      setTimeout(() => $('#sendAlertContainer').html(''), dismissMs);
    }
  }

  const confirmSendBtn = document.getElementById("confirmSendBtn");
  if (confirmSendBtn) {
      confirmSendBtn.addEventListener("click", function() {
        if (!selectedContact) {
            showSendAlert("Por favor, seleccione un contacto de la lista primero.", 'danger');
             // Cierra el modal si está abierto para que el usuario pueda seleccionar
             const modalEl = document.getElementById('exampleModal2');
             const modal = bootstrap.Modal.getInstance(modalEl);
             if(modal){
                 modal.hide();
             }
            return;
        }

        const amountInput = document.getElementById("sendAmount");
        const amount = parseFloat(amountInput.value);

        if (isNaN(amount) || amount <= 0) {
            showSendAlert("Por favor, ingrese un monto válido.", 'danger');
            return;
        }

        // Verifica el saldo
        let currentBalance = parseFloat(localStorage.getItem("accountBalance"));
        if (isNaN(currentBalance)) {
            currentBalance = 60000; // Saldo por defecto
        }

        if (amount > currentBalance) {
            showSendAlert("Saldo insuficiente para realizar esta transferencia.", 'danger');
            return;
        }

        // Deduct and Save
        const newBalance = currentBalance - amount;
        localStorage.setItem("accountBalance", newBalance);

        // Actualizar displays de saldo en la página (si jQuery está disponible)
        if (typeof $ !== 'undefined') {
          $('#currentBalance').text(formatCurrency(newBalance));
          $('#modalCurrentBalance').text(formatCurrency(newBalance));
        }

        // Registra la transacción
        const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
        transactions.push({
            description: `Transferencia a ${selectedContact.querySelector('.contact-name').textContent}`,
            amount: -amount,
            date: new Date().toISOString()
        });
        localStorage.setItem("transactions", JSON.stringify(transactions));

        // Mostrar mensaje de confirmación y redirigir después de 2s
        showSendAlert(`Transferencia exitosa de ${formatCurrency(amount)} a ${selectedContact.querySelector('.contact-name').textContent}. Nuevo saldo: ${formatCurrency(newBalance)}`, 'success', true, 2000);
        setTimeout(() => {
          window.location.href = "menu.html";
        }, 2000);
      });
  }
});