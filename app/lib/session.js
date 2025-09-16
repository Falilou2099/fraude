import Cookies from 'js-cookie';

const SESSION_COOKIE = 'component-dashboard-session';

export const setSession = (user) => {
  const sessionData = {
    id: user.id,
    username: user.username,
    name: user.name,
    loginTime: new Date().toISOString()
  };
  
  Cookies.set(SESSION_COOKIE, JSON.stringify(sessionData), { expires: 7 }); // 7 jours
};

export const getSession = () => {
  const sessionData = Cookies.get(SESSION_COOKIE);
  if (sessionData) {
    try {
      return JSON.parse(sessionData);
    } catch (error) {
      console.error('Erreur lors du parsing de la session:', error);
      clearSession();
    }
  }
  return null;
};

export const clearSession = () => {
  Cookies.remove(SESSION_COOKIE);
};

export const isAuthenticated = () => {
  return getSession() !== null;
};
