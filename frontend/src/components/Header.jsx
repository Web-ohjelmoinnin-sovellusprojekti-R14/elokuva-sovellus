import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import LoginModal from "./modals/LoginModal";
import RegisterModal from "./modals/RegisterModal";
import { Link } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";

function Header() {
  const spinImage = (e) => {
    e.currentTarget.style.transition = "transform 0.6s ease-in-out";
    e.currentTarget.style.transform = "rotate(-720deg)";
  };

  const resetSpin = (e) => {
    e.currentTarget.style.transform = "rotate(0deg)";
  };

  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);

  return (
    <>
      <LoginModal isOpen={openLogin} onClose={() => setOpenLogin(false)} />
      <RegisterModal
        isOpen={openRegister}
        onClose={() => setOpenRegister(false)}
      />

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
            <span className="logo-text">{t("best_films")}</span>
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
                  {t("sign_in")}
                </button>
                <button
                  onClick={() => setOpenRegister(true)}
                  className="btn btn-light btn-sm"
                >
                  {t("sign_up")}
                </button>
              </>
            ) : (
              <>
                {user && (
                  <Link
                    to="/my-reviews"
                    className="hello-user-link text-white me-2 noBack"
                  >
                    {t("hello")} {user.username}
                  </Link>
                )}
                <button onClick={logout} className="btn btn-danger btn-sm">
                  {t("log_out")}
                </button>
              </>
            )}
            <Link to="/my-groups" className="btn btn-outline-light btn-sm">
              {t("groups")}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
