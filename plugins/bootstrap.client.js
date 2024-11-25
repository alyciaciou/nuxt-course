// plugins/bootstrap.client.js
// import * as bootstrap from 'bootstrap';
// const { Dropdown, Collapse, Modal } = bootstrap;

// export default defineNuxtPlugin(_nuxtApp => {
//   return {
//     provide: {
//       bootstrap: {
//         dropdown: element => new Dropdown(element),
//         collapse: element => new Collapse(element),
//         modal: element => new Modal(element)
//       }
//     }
//   };
// });


import * as bootstrap from 'bootstrap'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('bootstrap', { ...bootstrap })
})