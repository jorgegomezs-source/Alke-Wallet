# Alke-Wallet

Proyecto de Modulo #2

A partir de la version main,
Intenta
Habilitar la función de autocompletar en la búsqueda de contactos en sendmoney.html.
↪ 📂 Interacciones con jQuery: ○ Animaciones y transiciones en menu.html para mejorar la UX. ○ Autocompletar en el campo "Buscar Contacto" en sendmoney.html.

10-01-2025
Modifica sendmoney.html; scriptsendmoney.js; styles.css -- Funciona autocompletar y seleccion de destinatario en enviar dinero deja de funcionar la opcion de enviar dinero

10-01-2025
Modifica boton que abre el modal boton de enviar dinero funcional

button type="button"
class="btn btn-primary"
id="openSendMoneyModalBtn"
disabled>
Enviar dinero
button

Modificado
button type="button"
class="btn btn-primary"
id="openSendMoneyModalBtn"
data-bs-toggle="modal"
data-bs-target="#exampleModal2">
Enviar dinero
button

10-01-2025

Fusiona branch con main
Go for merge

10-01-2025
Crea new branch feature/invitar
Modifica login.html y script.js agrega opción "mostrar contraseña"

10-01-2025
Renombra login.html a index.html
No requiere otros cambios
Sitio funciona

10-01-2025
Renombre herf de imagenes from /assets... to assets... para que la página de GitHub las muestre

12-01-2025
Resumen de cambios

Archivos: sendmoney.html, scriptsendmoney.js
Agregar contacto: Añadido modal funcional para crear contactos y botón Agregar contacto.
Persistencia: Los contactos se guardan en localStorage bajo la clave contacts.
Carga dinámica: La lista de contactos (#contactList) y el datalist se rellenan desde localStorage; si está vacío se crean 3 contactos por defecto (Mario, Angélica, Antonio).
Orden: Nuevos contactos se insertan al inicio (más recientes primero) y se guardan en ese orden.
Selección automática: Al guardar un contacto se selecciona automáticamente en la lista y se habilita el flujo de envío.
Validaciones: Validación de CBU ajustada (acepta 8–22 dígitos para pruebas); campos marcados como inválidos si falta información.
Robustez: Corregida recursión en addContactToList, añadidos chequeos defensivos, logs de depuración y manejo seguro del cierre del modal (Bootstrap + fallback).
UI: Eliminado el formulario inline; la adición se hace via modal exclusivamente.
Flujo de envío: Integración con saldo y transacciones existente — al enviar se actualiza balance y se guarda la transacción.
Prueba recomendada: abrir sendmoney.html, usar “Agregar contacto”, verificar que el contacto aparece primero en la lista, que queda seleccionado y que persiste tras recargar.
