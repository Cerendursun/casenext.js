import Cookies from 'js-cookie';

const AUTH_COOKIE = 'girisYapildi';
const AUTH_USERNAME = 'kullaniciAdi';

export const authService = {
  login: (username: string, password: string): boolean => {
    // Basit doğrulama (gerçek uygulamada API'ye istek atılmalı)
    if (username && password) {
      Cookies.set(AUTH_COOKIE, 'true', { expires: 7 }); // 7 gün
      Cookies.set(AUTH_USERNAME, username, { expires: 7 });
      return true;
    }
    return false;
  },

  logout: (): void => {
    Cookies.remove(AUTH_COOKIE);
    Cookies.remove(AUTH_USERNAME);
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return Cookies.get(AUTH_COOKIE) === 'true';
  },

  getUsername: (): string | undefined => {
    if (typeof window === 'undefined') return undefined;
    return Cookies.get(AUTH_USERNAME);
  },
};


