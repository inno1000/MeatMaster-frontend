import axios from 'axios';
import Session from '@/helpers/session';
import ErrorHandler from '@/helpers/errorHandler';

//MAJ baseURL 2
const httpClient = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL

    // baseURL: 'http://127.0.0.1:8000/api/'
    // baseURL: 'https://map-backend-dev.sygalin.com/api/'
});

httpClient.interceptors.request.use(
    (config) => {
        // const token = Session.get('accessToken');

        const token = Session.get('accessToken');
        // const periode = localStorage.getItem('periode')

        // config.headers.ContentType = 'application/x-www-form-urlencoded'
        //
        if (token) {
            // eslint-disable-next-line no-param-reassign
            config.headers.Authorization = `Bearer ${token}`;
        }

        // config.headers.periode = periode
        // config.headers.debut = periode !== null ? JSON.parse(periode).Debut : null
        // config.headers.fin = periode !== null ? JSON.parse(periode).Fin : null
        return config;
    },
    (err) => Promise.reject(err)
);

httpClient.interceptors.response.use(
    (response) => response,
    (error) => ErrorHandler(error)
);

/**
 * Object contenant les requêtes Http
 * @type {{}}
 */

const Http = {};

/**
 * Envoi des requêtes par la méthode GET
 * @param uri
 * @param params
 * @param fullResponse
 * @returns {Promise<AxiosResponse<any> | any>}
 */
Http.get = (uri, params = {}, fullResponse = false) =>
    httpClient
        .get(uri, { params })
        .catch((error) => {
            ErrorHandler(error);
        })
        .then((response) => (fullResponse ? response : response.data));

/**
 * Envoi des requêtes par la méthode POST. Pour savoir comment envoyer des fichiers, uilisez l'exemple suivant:
 *
 * const formData = new FormData();
 * const imagefile = document.querySelector('#file');
 * formData.append("image", imagefile.files[0]);
 * axios.post('upload/file', formData, {
 *     headers: {
 *       'Content-Type': 'multipart/form-data'
 *     }
 * })
 * @param {string} uri
 * @param {object|FormData} body
 * @param {boolean} fullResponse
 * @returns {Promise<AxiosResponse<any> | any>}
 */
Http.post = (uri, body, fullResponse = false) =>
    httpClient.post(uri, body).then((response) => (fullResponse ? response : response && response.data));

/**
 * Envoi des requêtes par la méthode PUT
 * @param uri
 * @param body
 * @param fullResponse
 * @returns {Promise<AxiosResponse<any> | any>}
 */
Http.put = (uri, body, fullResponse = false) =>
    httpClient
        .put(uri, body)
        .catch((error) => {
            ErrorHandler(error);
        })
        .then((response) => (fullResponse ? response : response.data));

/**
 * Envoi des requêtes par la méthode DELETE
 * @param uri
 * @param fullResponse
 * @returns {Promise<AxiosResponse<any> | any>}
 */
Http.delete = (uri, fullResponse = false) =>
    httpClient
        .delete(uri)
        .catch((error) => {
            ErrorHandler(error);
        })
        .then((response) => (fullResponse ? response : response.data));

export default Http;
