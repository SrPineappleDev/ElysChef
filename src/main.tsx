// Punto de entrada principal de la aplicación React.
// Monta el componente raíz <App /> dentro del elemento con id "root" del HTML.

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Crea la raíz de React y renderiza la aplicación en el DOM
createRoot(document.getElementById("root")!).render(<App />);
