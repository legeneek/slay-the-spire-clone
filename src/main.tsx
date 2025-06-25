import React from "react";
import ReactDOM from "react-dom/client";
import App from "./ui/app";
import "./ui/index.css"; // We'll create this for basic styling

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="bg">
      <App />
    </div>
  </React.StrictMode>
);
