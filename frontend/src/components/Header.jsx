import React from "react";

function Header() {
  const spinImage = (e) => {
    e.currentTarget.style.transition = "transform 0.6s ease-in-out";
    e.currentTarget.style.transform = "rotate(-720deg)";
  };

  const resetSpin = (e) => {
    e.currentTarget.style.transform = "rotate(0deg)";
  };

  return (
    <header className="site-header bg-dark">
      <div className="container header-inner">

        <div className="header-left">
          <img
            src="images/logoMain.png"
            className="site-logo"
            alt="Logo"
            loading="lazy"
            onMouseOver={spinImage}
            onMouseOut={resetSpin}
          />
          <span className="logo-text">Best films are here</span>
        </div>

        <div className="header-center">
          <img
            src="images/mainTitle.png"
            className="site-title-img"
            alt="Site Title"
          />
        </div>

        <div className="header-right">
          <a href="#signin" className="btn btn-outline-light btn-sm">Sign In</a>
          <a href="#signup" className="btn btn-light btn-sm">Sign Up</a>
          <a href="#groups" className="btn btn-outline-light btn-sm">Groups</a>
        </div>
      </div>
    </header>
  );
}

export default Header;
