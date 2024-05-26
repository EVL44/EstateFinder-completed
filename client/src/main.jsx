import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.scss";
import { AuthContextProvider } from "./context/AuthContext.jsx";
import { SocketContextProvider } from "./context/SocketContext.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/ReactToastify.css";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthContextProvider>
      <SocketContextProvider>
        <ToastContainer/>
          <App />
      </SocketContextProvider>
    </AuthContextProvider>
  </React.StrictMode>
);
