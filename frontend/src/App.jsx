import React from "react";
import Header from "./components/Header";
import SubHeader from "./components//SubHeader";
import MoviesSection from "./components/MoviesSection";
import PopularSection from "./components/PopularSection";
import "./styles.css";

function App() {
  return (
    <div>
      <Header />
      <SubHeader />
      <PopularSection />
      <MoviesSection />
    </div>
  );
}

export default App;
