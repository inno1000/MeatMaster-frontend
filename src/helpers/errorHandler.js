import axios from 'axios';
import Session from '@/helpers/session';
import toastMessage from './toast';

// eslint-disable-next-line consistent-return
function errorResponseHandler(error) {
    // check for errorHandle config
    // eslint-disable-next-line no-prototype-builtins
    console.log(error.config);
    // if (error.config.hasOwnProperty('errorHandle') && error.config.errorHandle === false) {
    //     return Promise.reject(error);
    // }
    if (Object.prototype.hasOwnProperty.call(error.config, 'errorHandle') && error.config.errorHandle === false) {
        return Promise.reject(error);
    }

    if (error.response !== undefined) {
        const dataError = {
            statusCode: null,
            data: null,
            message: null
        };
        console.log('ErrorHandler');
        console.log(error.response.data);
        const resp = error.response;
        switch (resp.status) {
            case 422:
                // eslint-disable-next-line no-case-declarations

                dataError.message = 'des erreurs sont survenues lors de la tentative de connexion';

                // dataError.message = resp.data.message
                break;
            case 401:
                dataError.statusCode = resp.status;
                dataError.data = resp.data;
                dataError.message = resp.data.message;

                if (dataError.message === 'Unauthenticated.') {
                    Session.unset('accessToken');
                    Session.unset('userData');
                    localStorage.removeItem('accessToken');
                    window.location.reload();
                    toastMessage('Vous avez été déconnecté', 'error');
                }
                break;
            case 400:
                dataError.statusCode = resp.status;
                dataError.data = resp.data;
                dataError.message = resp.data.message;
                break;
            case 404:
                dataError.statusCode = resp.status;
                dataError.data = resp.data;
                dataError.message = 'Request Not Found';
                break;
            case 500:
                dataError.statusCode = resp.status;
                dataError.data = resp.data;
                dataError.message = resp.data.message;
                break;
            default:
                dataError.data = error.data;
                dataError.message = 'Votre connexion internet est instable';
                break;
        }
        toastMessage(dataError.message, 'error');

        // return dataError
    } else if (error.request) {
        toastMessage('Connexion Internet instable !', 'error');
    }
}

// apply interceptor on response
axios.interceptors.response.use((response) => response, errorResponseHandler);

export default errorResponseHandler;
