import { useStorage } from 'vue3-storage';

const storage = useStorage();

const Storage = {};

/**
 * Enregitrer une valeur dans la sessions
 * @param key - Clé
 * @param value - Valeur
 * @param async - Si l'enregistrement doit se faire de façon asynchrone ou pas
 */
Storage.set = (key, value, async = true) => {
    if (!async) {
        storage.setStorageSync(key, value);
    } else {
        storage
            .setStorage({
                key: `${key}`,
                data: value
            })
            .then((successCallback) => {
                console.log(successCallback.errMsg);
            })
            .catch((failCallback) => {
                console.log(failCallback.errMsg);
            });
    }
};

/**
 * Enregistrer plusieurs valeurs dans les sessions, en fournissant un objet javascript
 * @param data - Object de données. Exemple: {key1: value1, key2: value2, key3: value3}
 * @param async - Si l'enregistrement doit se faire de façon asynchrone ou pas
 */
Storage.setMany = (data, async = false) => {
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const key in data) {
        this.set(key, data[key], async);
    }
};

/**
 * Retourne la valeur associée à une clé passée en paramètre
 * @param key - Clé
 * @param async - Si l'enregistrement doit se faire de façon asynchrone ou pas
 * @returns {Promise<GetStorageSuccessCallbackResult<any>>|undefined|any}
 */
Storage.get = (key, async = false) => {
    if (storage.hasKey(key)) {
        if (!async) {
            return storage.getStorageSync(key);
        }

        return storage.getStorage(key);
    }

    return undefined;
};

/**
 * Permet de savoir si oui ou non la clé existe en stockage
 * @param key - Clé
 * @returns {boolean}
 */
Storage.isSet = (key) => storage.hasKey(key);

/**
 * Efface une valeur du stockage à partir de sa clé
 * @param key - Clé
 * @param async
 */
Storage.unset = (key, async = false) => {
    if (storage.hasKey(key)) {
        if (!async) {
            storage.removeStorageSync(key);
        } else {
            storage.removeStorage({
                key: `${key}`
            });
        }
    } else {
        console.log(`Key ${key} does not exists`);
    }
};

/**
 * Vide le stockage
 */
Storage.clear = () => {
    storage.clearStorageSync();
};

export default Storage;
