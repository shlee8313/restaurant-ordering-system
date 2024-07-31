import { create } from "zustand";

const useAuthStore = create((set) => ({
  // User state
  userToken: null,
  user: null,

  // Restaurant state
  restaurant: null,
  restaurantToken: null,

  // Actions for user
  setUserToken: (token) => set({ userToken: token }),
  setUser: (user) => set({ user }),
  logoutUser: () => set({ userToken: null, user: null }),

  // Actions for restaurant
  setRestaurant: (restaurant) => {
    localStorage.setItem("restaurant", JSON.stringify(restaurant));
    set({ restaurant });
  },
  setRestaurantToken: (token) => {
    localStorage.setItem("restaurantToken", token);
    set({ restaurantToken: token });
  },
  logoutRestaurant: () => {
    localStorage.removeItem("restaurant");
    localStorage.removeItem("restaurantToken");
    set({ restaurant: null, restaurantToken: null });
  },

  // Full logout for both user and restaurant
  fullLogout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("restaurant");
    localStorage.removeItem("restaurantToken");
    set({ userToken: null, user: null, restaurant: null, restaurantToken: null });
  },

  // Initialize state from localStorage if available
  initializeState: () => {
    try {
      const storedRestaurant = localStorage.getItem("restaurant");
      const storedRestaurantToken = localStorage.getItem("restaurantToken");
      const storedUserToken = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("user");

      if (storedRestaurant) {
        set({ restaurant: JSON.parse(storedRestaurant) });
      }

      if (storedRestaurantToken) {
        set({ restaurantToken: storedRestaurantToken });
      }

      if (storedUserToken) {
        set({ userToken: storedUserToken });
      }

      if (storedUser) {
        set({ user: JSON.parse(storedUser) });
      }
    } catch (error) {
      console.error("Failed to initialize state from localStorage:", error);
    }
  },
}));

// Initialize state when the store is created
useAuthStore.getState().initializeState();

export default useAuthStore;
