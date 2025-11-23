import React from "react";
import Header from "./components/Header";
import SubHeader from "./components//SubHeader";
import "./styles.css";

import { Routes, Route } from "react-router-dom";

import NowInCinemaPage from "./pages/NowInCinemaPage";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <>
      {/* On every page */}
      <Header />
      <SubHeader />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/now-in-cinema" element={<NowInCinemaPage />} />
      </Routes>
    </>
  );
}

export default App;
