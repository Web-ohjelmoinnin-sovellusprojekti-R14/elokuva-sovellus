import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import LoginModal from "./modals/LoginModal";
import RegisterModal from "./modals/RegisterModal";
import { Link } from "react-router-dom";

function Header() {
  const spinImage = (e) => {
    e.currentTarget.style.transition = "transform 0.6s ease-in-out";
    e.currentTarget.style.transform = "rotate(-720deg)";
  };

  const resetSpin = (e) => {
    e.currentTarget.style.transform = "rotate(0deg)";
  };

  const { user, logout } = useAuth();
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);

  return (
    <>
      <LoginModal isOpen={openLogin} onClose={() => setOpenLogin(false)} />
      <RegisterModal isOpen={openRegister} onClose={() => setOpenRegister(false)} />

    <header className="site-header bg-dark">
      <div className="container header-inner">

        <div className="header-left">
          <Link to="/">
            <img
              src={`${process.env.PUBLIC_URL}/images/logoMain.png`}
              className="site-logo"
              alt="Logo"
              loading="lazy"
              onMouseOver={spinImage}
              onMouseOut={resetSpin}
            />
          </Link>
          <span className="logo-text">Best films are here</span>
        </div>

        <div className="header-center">
          <img
            src={`${process.env.PUBLIC_URL}/images/mainTitle.png`}
            className="site-title-img"
            alt="Site Title"
          />
        </div>

        <div className="header-right">
          {!user ? (
            <>
              <button
                onClick={() => setOpenLogin(true)}
                className="btn btn-outline-light btn-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => setOpenRegister(true)}
                className="btn btn-light btn-sm"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
            {user && (
              <Link to="/my-reviews" className="hello-user-link text-white me-2 noBack">
                Hello, {user.username}
              </Link>
            )}
              <button
                onClick={logout}
                className="btn btn-danger btn-sm"
              >
                Log Out
              </button>
            </>
          )}
          <a href="#groups" className="btn btn-outline-light btn-sm">
            Groups
          </a>
        </div>

      </div>
    </header>
    </>
  );
}

export default Header; 