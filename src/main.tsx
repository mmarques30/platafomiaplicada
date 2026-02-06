import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Proteção global contra crashes por promise rejections não tratadas
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  event.preventDefault();
});

createRoot(document.getElementById("root")!).render(<App />);
