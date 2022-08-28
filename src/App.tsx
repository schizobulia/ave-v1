import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import HomePage from './page/Home/index';
import "./App.css";

function App() {

  return (
    <div className="container">
      <HomePage></HomePage>
    </div>
  );
}

export default App;
