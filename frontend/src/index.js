import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

document.body.style.backgroundColor = '#2a2a49';
document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.minHeight = '100vh';