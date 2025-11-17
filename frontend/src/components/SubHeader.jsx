import React from "react";

function SubHeader() {
  return (
    <section className="sub-header container">
      <div className="categories">
        <a href="#films" className="category">Films</a>
        <a href="#series" className="category">Series</a>
        <a href="#cartoons" className="category">Cartoons</a>
        <a href="#anime" className="category">Anime</a>
        <a href="#cinema" className="category">In cinemas</a>
      </div>

      <div className="search-box">
        <img src="images/searchMain.png" alt="Search" className="search-icon" />
        <input type="text" placeholder="Search..." className="search-input" />
      </div>
    </section>
  );
}

export default SubHeader;
