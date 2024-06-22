import { defineStore } from 'pinia';
import { router } from '@/router';
import { fetchWrapper } from '@/utils/helpers/fetch-wrapper';
import toastMessage from "@/helpers/toast";

const baseUrl = `${import.meta.env.VITE_API_URL}/auth`;

export const useAuthStore = defineStore({
  id: 'auth',
  state: () => ({
    // initialize state from local storage to enable user to stay logged in
    /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')): null,
    returnUrl: null
  }),
  actions: {
    async login(email: string, password: string) {
      const login = await fetchWrapper.post(`${baseUrl}/login`, { email, password });

      console.log( login.accessToken)

      if (login && typeof login === 'object' && 'accessToken' in login) {
        localStorage.setItem('user', JSON.stringify({token: login.accessToken}));

        this.user = {token: login.accessToken};

        const user = await fetchWrapper.get(`${baseUrl}/user`);

        user.token = login.accessToken

        console.log(JSON.stringify(user))
        // update pinia state
        this.user = user;

        // store user details and jwt in local storage to keep user logged in between page refreshes
        localStorage.setItem('user', JSON.stringify(user));
        // redirect to previous url or default to home page

        toastMessage("Connexion réussie")

        await router.push(this.returnUrl || '/dashboard/default');

      }
    },
    logout() {
      this.user = null;
      localStorage.removeItem('user');
      router.push('/auth/login');
    }
  }
});
