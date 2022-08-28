import React from "react";
import ReactDOM from "react-dom/client";
import {
  HashRouter,
  Routes,
  Route,
} from "react-router-dom";
import App from "./App";
import Player from './page/Player/index';
import "./style.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/player" element={<Player />} />
    </Routes>
  </HashRouter>
);
