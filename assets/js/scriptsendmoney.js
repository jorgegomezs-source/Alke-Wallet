document.addEventListener("DOMContentLoaded", function () {
  /* ----------  Utilidades  ---------- */
  function formatCurrency(n) {
    return '$' + Number(n).toLocaleString();
  }

  /* ----------  Referencias DOM  ---------- */
  const searchInput        = document.getElementById('searchContact');
  const datalist           = document.getElementById('contactOptions');
  const hiddenContact      = document.getElementById('selectedContactHidden');
  const openBtn            = document.getElementById('openSendMoneyModalBtn');
  const contactList        = document.getElementById('contactList');
  const saveContactBtn     = document.getElementById('saveContactBtn');
  const saveContactInlineBtn = document.getElementById('saveContactInlineBtn');
  const toggleAddContactBtn  = document.getElementById('toggleAddContactBtn');
  const cancelAddContactInlineBtn = document.getElementById('cancelAddContactInlineBtn');

  let selectedContact = null;   // <li> activo

  /* ----------  Autocompletado  ---------- */
  function repopulateDatalist() {
    datalist.innerHTML = '';
    const items = contactList.querySelectorAll('.list-group-item');
    items.forEach((li, idx) => {
      const name = li.querySelector('.contact-name')?.textContent || '';
      const details = li.querySelector('.contact-details')?.textContent || '';
      const opt = document.createElement('option');
      opt.value = name;
      opt.dataset.details = details;
      opt.dataset.liIdx   = idx;
      datalist.appendChild(opt);
    });
  }

  searchInput.addEventListener('input', () => {
    const val = searchInput.value.trim();
    const opt = Array.from(datalist.options).find(o => o.value === val);
    if (!opt) {                       // texto libre → sin selección
      hiddenContact.value = '';
      openBtn.disabled    = true;
      selectedContact     = null;
      return;
    }
    const items = contactList.querySelectorAll('.list-group-item');
    const li    = items[opt.dataset.liIdx];
    selectContact(li);                // marca activo + sincroniza estados
  });

  /* ----------  Selección de contacto  ---------- */
  function selectContact(li) {
    // limpia activos
    contactList.querySelectorAll('.list-group-item').forEach(c => c.classList.remove('active'));
    li.classList.add('active');
    selectedContact = li;

    // sincroniza input y hidden
    searchInput.value     = li.querySelector('.contact-name').textContent;
    hiddenContact.value   = li.querySelector('.contact-details').textContent;
    openBtn.disabled      = false;
  }

  /* ----------  Agregar contacto (modal + inline)  ---------- */
  function addContactToList(name, cbu, alias, bank) {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.innerHTML = `
      <div class="contact-info">
        <span class="contact-name">${name}</span>
        <span class="contact-details">CBU: ${cbu}, Alias: ${alias}, Banco: ${bank}</span>
      </div>`;
    li.addEventListener('click', () => selectContact(li));
    contactList.appendChild(li);
    repopulateDatalist();   // <-- importante
  }

  /* validaciones */
  function validateCBU(cbu) { return /^\d{22}$/.test(cbu); }

  function validateContactFields(suffix = '') {
    const nameEl  = document.getElementById(`contactName${suffix}`);
    const cbuEl   = document.getElementById(`contactCBU${suffix}`);
    const aliasEl = document.getElementById(`contactAlias${suffix}`);
    const bankEl  = document.getElementById(`contactBank${suffix}`);

    let valid = true;
    const name  = (nameEl?.value  || '').trim();
    let cbu     = (cbuEl?.value   || '').replace(/\D/g,'');
    const alias = (aliasEl?.value || '').trim();
    const bank  = (bankEl?.value  || '').trim();

    if(!name)  { nameEl.classList.add('is-invalid');  valid=false; } else nameEl.classList.remove('is-invalid');
    if(!validateCBU(cbu)) { cbuEl.classList.add('is-invalid'); valid=false; } else { cbuEl.classList.remove('is-invalid'); cbuEl.value=cbu; }
    if(!alias) { aliasEl.classList.add('is-invalid'); valid=false; } else aliasEl.classList.remove('is-invalid');
    if(!bank)  { bankEl.classList.add('is-invalid');  valid=false; } else bankEl.classList.remove('is-invalid');

    return valid;
  }

  /* limpia validación al escribir */
  document.addEventListener('input', e => {
    if(e.target.matches('#addContactForm input, #addContactInlineForm input')) e.target.classList.remove('is-invalid');
  });

  /* guardar desde modal */
  saveContactBtn?.addEventListener('click', () => {
    if(!validateContactFields('')) return;
    const name  = document.getElementById('contactName').value.trim();
    const cbu   = document.getElementById('contactCBU').value.replace(/\D/g,'');
    const alias = document.getElementById('contactAlias').value.trim();
    const bank  = document.getElementById('contactBank').value.trim();
    addContactToList(name, cbu, alias, bank);
    alert('Contacto agregado exitosamente');
    document.getElementById('addContactForm').reset();
    bootstrap.Modal.getInstance(document.getElementById('exampleModal'))?.hide();
  });

  /* inline toggle / cancel / save */
  toggleAddContactBtn?.addEventListener('click', () => {
    $('#addContactInline').slideToggle();
    $('#addContactInlineForm input').removeClass('is-invalid');
  });
  cancelAddContactInlineBtn?.addEventListener('click', () => {
    $('#addContactInline').slideUp();
    document.getElementById('addContactInlineForm')?.reset();
    $('#addContactInlineForm input').removeClass('is-invalid');
  });
  saveContactInlineBtn?.addEventListener('click', () => {
    if(!validateContactFields('Inline')) return;
    const name  = document.getElementById('contactNameInline').value.trim();
    const cbu   = document.getElementById('contactCBUInline').value.replace(/\D/g,'');
    const alias = document.getElementById('contactAliasInline').value.trim();
    const bank  = document.getElementById('contactBankInline').value.trim();
    addContactToList(name, cbu, alias, bank);
    alert('Contacto agregado exitosamente');
    document.getElementById('addContactInlineForm').reset();
    $('#addContactInline').slideUp();
  });

  /* click en contactos ya existentes (HTML estático) */
  contactList.querySelectorAll('.list-group-item').forEach(li => li.addEventListener('click', () => selectContact(li)));

  /* ----------  Envío de dinero  ---------- */
  const confirmSendBtn = document.getElementById('confirmSendBtn');

  function showSendAlert(msg, type='success', auto=true, ms=3000){
    const html = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
                    ${msg}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                  </div>`;
    $('#sendAlertContainer').html(html);
    if(auto) setTimeout(()=> $('#sendAlertContainer').html(''), ms);
  }

  /* saldo */
  $(document).ready(() => {
    let balance = parseFloat(localStorage.getItem('accountBalance')) || 60000;
    $('#currentBalance, #modalCurrentBalance').text(formatCurrency(balance));
    $('#exampleModal2').on('show.bs.modal', () => {
      let b = parseFloat(localStorage.getItem('accountBalance')) || 60000;
      $('#modalCurrentBalance').text(formatCurrency(b));
    });
  });

  confirmSendBtn?.addEventListener('click', () => {
    if(!selectedContact){
      showSendAlert('Por favor seleccione un contacto.', 'danger');
      bootstrap.Modal.getInstance(document.getElementById('exampleModal2'))?.hide();
      return;
    }
    const amount = parseFloat(document.getElementById('sendAmount').value);
    if(isNaN(amount) || amount <= 0){
      showSendAlert('Ingrese un monto válido.', 'danger'); return;
    }
    let balance = parseFloat(localStorage.getItem('accountBalance')) || 60000;
    if(amount > balance){
      showSendAlert('Saldo insuficiente.', 'danger'); return;
    }
    const newBalance = balance - amount;
    localStorage.setItem('accountBalance', newBalance);
    $('#currentBalance, #modalCurrentBalance').text(formatCurrency(newBalance));

    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    transactions.push({
      description: `Transferencia a ${selectedContact.querySelector('.contact-name').textContent}`,
      amount: -amount,
      date: new Date().toISOString()
    });
    localStorage.setItem('transactions', JSON.stringify(transactions));

    showSendAlert(`Transferencia exitosa de ${formatCurrency(amount)}.`, 'success', true, 2000);
    setTimeout(()=> window.location.href='menu.html', 2000);
  });

  /* inicializa datalist con contactos precargados */
  repopulateDatalist();
});