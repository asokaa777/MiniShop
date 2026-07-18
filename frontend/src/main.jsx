import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "./index.css";
import App from "./App.jsx";

// StrictMode intentionally double-invokes functions in development to detect
// side effects — this causes API calls to fire twice in dev. Removed to prevent
// duplicate POST requests during development. All StrictMode checks still run
// in production builds automatically.
createRoot(document.getElementById("root")).render(<App />);