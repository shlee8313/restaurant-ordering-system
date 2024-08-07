import { create } from "zustand";

const isServer = typeof window === "undefined";

const getLocalStorageItem = (key) => {
  if (isServer) return null;
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return null;
  }
};

const setLocalStorageItem = (key, value) => {
  if (isServer) return;
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error);
  }
};

const removeLocalStorageItem = (key) => {
  if (isServer) return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
};

const useAuthStore = create((set) => ({
  userToken: null,
  user: null,
  restaurant: null,
  restaurantToken: null,

  setUserToken: (token) => {
    setLocalStorageItem("authToken", token);
    set({ userToken: token });
  },
  setUser: (user) => {
    setLocalStorageItem("user", JSON.stringify(user));
    set({ user });
  },
  logoutUser: () => {
    removeLocalStorageItem("authToken");
    removeLocalStorageItem("user");
    set({ userToken: null, user: null });
  },

  setRestaurant: (restaurant) => {
    setLocalStorageItem("restaurant", JSON.stringify(restaurant));
    set({ restaurant });
  },
  setRestaurantToken: (token) => {
    setLocalStorageItem("restaurantToken", token);
    set({ restaurantToken: token });
  },
  logoutRestaurant: () => {
    removeLocalStorageItem("restaurant");
    removeLocalStorageItem("restaurantToken");
    set({ restaurant: null, restaurantToken: null });
  },

  fullLogout: () => {
    removeLocalStorageItem("authToken");
    removeLocalStorageItem("user");
    removeLocalStorageItem("restaurant");
    removeLocalStorageItem("restaurantToken");
    set({ userToken: null, user: null, restaurant: null, restaurantToken: null });
  },

  initializeState: () => {
    if (isServer) return;

    const storedRestaurant = getLocalStorageItem("restaurant");
    const storedRestaurantToken = getLocalStorageItem("restaurantToken");
    const storedUserToken = getLocalStorageItem("authToken");
    const storedUser = getLocalStorageItem("user");

    set({
      restaurant: storedRestaurant ? JSON.parse(storedRestaurant) : null,
      restaurantToken: storedRestaurantToken || null,
      userToken: storedUserToken || null,
      user: storedUser ? JSON.parse(storedUser) : null,
    });
  },
}));

// 클라이언트 사이드에서만 initializeState 실행
if (!isServer) {
  useAuthStore.getState().initializeState();
}

export default useAuthStore;
