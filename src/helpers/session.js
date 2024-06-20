import Storage from '@/helpers/storage';

const Session = {};

const sessionNamespace = 'map';

Session.set = (key, value) => {
    Storage.set(sessionNamespace + key, value);
};

Session.setMany = (data) => {
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const key in data) {
        Session.set(sessionNamespace + key, data[key]);
    }
};

Session.get = (key) => Storage.get(sessionNamespace + key);

Session.all = () => {
    const arrayStorage = Object.entries({ ...localStorage }).filter((pair) => Storage.isSet(pair[0]) && pair[0].includes(sessionNamespace));

    return Object.fromEntries(arrayStorage);
};

Session.unset = (key) => {
    Storage.unset(sessionNamespace + key);
};

export default Session;
