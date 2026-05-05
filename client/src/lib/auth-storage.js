const TOKEN_KEY = "sbms.auth.token";
const USER_KEY = "sbms.auth.user";

const getStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
};

const safeParse = (value) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const getToken = () => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  return storage.getItem(TOKEN_KEY);
};

const setToken = (token) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  if (!token) {
    storage.removeItem(TOKEN_KEY);
    return;
  }

  storage.setItem(TOKEN_KEY, token);
};

const getUser = () => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  return safeParse(storage.getItem(USER_KEY));
};

const setUser = (user) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  if (!user) {
    storage.removeItem(USER_KEY);
    return;
  }

  storage.setItem(USER_KEY, JSON.stringify(user));
};

const clear = () => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(TOKEN_KEY);
  storage.removeItem(USER_KEY);
};

export const authStorage = {
  getToken,
  setToken,
  getUser,
  setUser,
  clear,
};
