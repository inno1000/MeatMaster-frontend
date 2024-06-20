// import 'izitoast/dist/css/iziToast.min.css'

import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const toastMessage = (message, type = 'success') => {
    toast(message !== null ? message : 'Empty', {
        autoClose: 5000,
        position: toast.POSITION.TOP_RIGHT,
        theme: 'colored',
        type: type
    });
};

// const toast = {
//   // error: (message, title = 'Error') => iZtoast.error({
//   //   title,
//   //   message,
//   //   titleColor: '#fff',
//   //   position: 'topCenter',
//   //   messageColor: '#fff',
//   //   backgroundColor: '#ff4c51',
//   //   messageSize: '16px',
//   // }),
//   // success: (message, title = 'Success') => iZtoast.success({
//   //   title,
//   //   message,
//   //   position: 'topCenter',
//   // }),
//   // warning: (message, title = 'Warning') => iZtoast.warning({
//   //   title,
//   //   message,
//   //   position: 'topCenter',
//   // }),
//   // info: (message, title = 'Information') => iZtoast.info({
//   //   title,
//   //   message,
//   //   position: 'Center',
//   //   timeout: 8000,
//   // }),
//   test: (message, title = 'Information') => toast(message !== null ? message : 'Empty', {
//     autoClose: 5000,
//     position: toast.POSITION.TOP_RIGHT,
//     theme: 'colored',
//     type: 'success',
//   }),
// }

// export default toast
export default toastMessage;
