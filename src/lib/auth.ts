export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const setAuthToken = (token: string) => {
  localStorage.setItem("token", token);
};

export const removeAuthToken = () => {
  localStorage.removeItem("token");
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: any = {
    ...options.headers,
    "Accept": "application/json",
    "Content-Type": "application/json",
  };

  // Si on a un token Bearer, on l'ajoute
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, { 
    ...options, 
    headers,
    credentials: 'include' // TRÈS IMPORTANT : Autorise l'envoi des cookies de session
  });
};
