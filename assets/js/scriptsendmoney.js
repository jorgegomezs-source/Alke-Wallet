document.addEventListener("DOMContentLoaded", function () {
  console.log('scriptsendmoney: DOMContentLoaded');
  /* ----------  Utilidades  ---------- */
  function formatCurrency(n) {
    return '$' + Number(n).toLocaleString();
  }

  /* ----------  Referencias DOM  ---------- */
  const searchInput        = document.getElementById('searchContact');
  const datalist           = document.getElementById('contactOptions');
  const hiddenContact      = document.getElementById('selectedContactHidden');
  const openBtn            = document.getElementById('openSendMoneyModalBtn');
  let contactList          = document.getElementById('contactList');
  const saveContactBtn     = document.getElementById('saveContactBtn');
  if(!contactList){ console.warn('scriptsendmoney: #contactList not found, creating one'); contactList = document.createElement('ul'); contactList.id='contactList'; contactList.className='list-group'; document.querySelector('.col-md-6')?.appendChild(contactList); }
  const CONTACTS_KEY = 'contacts';

  let selectedContact = null;   // <li> activo

  /* ----------  Autocompletado  ---------- */
  function repopulateDatalist() {
    if(!datalist) return;
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
  function addContactToListDOM(name, cbu, alias, bank) {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.innerHTML = `
      <div class="contact-info">
        <span class="contact-name">${name}</span>
        <span class="contact-details">CBU: ${cbu}, Alias: ${alias}, Banco: ${bank}</span>
      </div>`;
    li.addEventListener('click', () => selectContact(li));
    // insertar al inicio de la lista para que los nuevos contactos queden primero
    contactList.insertBefore(li, contactList.firstChild);
    repopulateDatalist();   // <-- importante
  }

  /* ----------  Persistencia de contactos  ---------- */
  function getStoredContacts(){
    try{ return JSON.parse(localStorage.getItem(CONTACTS_KEY)) || []; }
    catch(e){ return []; }
  }
  function saveStoredContacts(arr){ localStorage.setItem(CONTACTS_KEY, JSON.stringify(arr)); }

  // addContactToList: wrapper that updates DOM and persists
  function addContactToList(name, cbu, alias, bank, persist = true){
    addContactToListDOM(name, cbu, alias, bank);
    if(persist){
      const stored = getStoredContacts();
      // guardar al inicio para mantener los más recientes primero
      stored.unshift({name, cbu, alias, bank});
      saveStoredContacts(stored);
    }
  }

  /* validaciones */
  // aceptar entre 8 y 22 dígitos para pruebas (CBU completo tiene 22 dígitos)
  function validateCBU(cbu) { return /^\d{8,22}$/.test(cbu); }

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
    if(e.target.matches('#addContactForm input')) e.target.classList.remove('is-invalid');
  });

  /* guardar desde modal */
  if(!saveContactBtn) console.warn('scriptsendmoney: #saveContactBtn no encontrado');
  saveContactBtn?.addEventListener('click', () => {
    if(!validateContactFields('')) return;
    const name  = document.getElementById('contactName').value.trim();
    const cbu   = document.getElementById('contactCBU').value.replace(/\D/g,'');
    const alias = document.getElementById('contactAlias').value.trim();
    const bank  = document.getElementById('contactBank').value.trim();
    addContactToList(name, cbu, alias, bank);
    // seleccionar el contacto recién añadido
    const items = contactList.querySelectorAll('.list-group-item');
    const newLi = items[items.length - 1];
    if(newLi) selectContact(newLi);
    showSendAlert('Contacto agregado exitosamente.', 'success', true, 2000);
    // obtener modal y formulario, resetear si existe
    const modalEl = document.getElementById('exampleModal');
    // intentar limpiar campos individualmente si el formulario no se encuentra
    const nameEl = document.getElementById('contactName');
    const cbuEl = document.getElementById('contactCBU');
    const aliasEl = document.getElementById('contactAlias');
    const bankEl = document.getElementById('contactBank');
    if(nameEl || cbuEl || aliasEl || bankEl){
      if(nameEl) nameEl.value='';
      if(cbuEl) cbuEl.value='';
      if(aliasEl) aliasEl.value='';
      if(bankEl) bankEl.value='';
    } else {
      console.warn('scriptsendmoney: no se encontraron inputs de addContactForm para limpiar', {modalEl});
    }
    // cerrar modal usando getInstance o creando uno si no existe
    try{
      const modalInst = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modalInst.hide();
    }catch(err){
      console.warn('scriptsendmoney: no se pudo cerrar modal con bootstrap:', err);
      // fallback: intentar quitar la clase show y el backdrop
      if(modalEl){ modalEl.classList.remove('show'); modalEl.style.display='none'; }
      const backdrops = document.querySelectorAll('.modal-backdrop'); backdrops.forEach(b=>b.remove());
    }
  });

  /* inline option removed */

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

  /* inicializa datalist con contactos precargados y los guardados */
  // cargar contactos guardados en localStorage; si no existen, crear defaults
  let storedContacts = getStoredContacts();
  console.log('scriptsendmoney: storedContacts before defaults', storedContacts);
  if(!storedContacts || storedContacts.length === 0){
    storedContacts = [
      { name: 'Mario Valenzuela', cbu: '123456789', alias: 'Marito', bank: 'ABC Bank' },
      { name: 'Angélica Rodriguez', cbu: '987654321', alias: 'Mery', bank: 'XYZ Bank' },
      { name: 'Antonio Vasquez', cbu: '787654323', alias: 'Toñito', bank: 'XYZ Bank' }
    ];
    saveStoredContacts(storedContacts);
  }
  console.log('scriptsendmoney: loading contacts', storedContacts);
  // insertarlos en orden correcto: recorremos de atrás hacia adelante
  for(let i = storedContacts.length - 1; i >= 0; i--){
    const c = storedContacts[i];
    addContactToList(c.name, c.cbu, c.alias, c.bank, false);
  }
  repopulateDatalist();
});