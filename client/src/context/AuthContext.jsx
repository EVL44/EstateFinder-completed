import { createContext, useEffect, useState, useCallback } from "react";
import apiRequest from "../lib/apiRequest";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const updateUser = (data) => {
    console.log("Updating user:", data);
    setCurrentUser(data);
    if (data) {
      localStorage.setItem("user", JSON.stringify(data));
    } else {
      localStorage.removeItem("user");
    }
  };

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await apiRequest.get("/auth/currentUser");
      const userData = response.data;
      updateUser(userData);
    } catch (err) {
      if (err.response && err.response.status === 401) {
       
        updateUser(null);
      } else {
        console.error("Failed to fetch current user:", err);
      }
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, updateUser, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
