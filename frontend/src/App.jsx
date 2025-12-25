import React from "react";
import Header from "./components/Header";
import SubHeader from "./components//SubHeader";
import "./styles.css";

import { Routes, Route } from "react-router-dom";

import NowInCinemaPage from "./pages/NowInCinemaPage";
import HomePage from "./pages/HomePage";
import SearchResultsPage from "./pages/SearchResultsPage";
import FilmsByTypePages from "./pages/FilmsByTypePage";
import AdvancedSearchResultsPage from "./pages/AdvancedSearchResultsPage";
import TitleDetails from "./pages/TitleDetails";
import MusicPlayer from "./components/MusicPlayer";
import LanguageSwitcher from "./components/LanguageSwitcher";
import Footer from "./components/Footer";
import UserReviewsPage from "./pages/UserReviewsPage";
import MyGroupsPage from "./pages/MyGroupsPage";
import GroupDetailsPage from "./pages/GroupDetailsPage";

function App() {
  return (
    <div className="app-wrapper">
      <div className="background-particles">
        {[...Array(40)].map((_, i) => {
          const size = Math.random() * 5 + 4;
          return (
            <div
              key={i}
              className="particle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          );
        })}
      </div>

      {/*<MusicPlayer />*/}
      <LanguageSwitcher />

      <div className="d-flex flex-column">
        <header>
          <Header />
          <SubHeader />
        </header>

        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/now-in-cinema" element={<NowInCinemaPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/type" element={<FilmsByTypePages />} />
            <Route
              path="/advanced-search"
              element={<AdvancedSearchResultsPage />}
            />
            <Route path="/title/:id/:mediaType" element={<TitleDetails />} />
            <Route path="/my-reviews" element={<UserReviewsPage />} />
            <Route path="/my-groups" element={<MyGroupsPage />} />
            <Route path="/group/:id" element={<GroupDetailsPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
