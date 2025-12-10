import PopularSection from "../components/PopularSection";
import MoviesSection from "../components/MoviesSection";
import SeriesSection from "../components/SeriesSection";
import CartoonsSection from "../components/CartoonsSection";
import AnimeSection from "../components/AnimeSection";
 
import LoadingScreen from "../components/LoadingScreen";
import React, { useState, useEffect } from "react";

export default function HomePage() {

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => { setIsLoading(false); }, 2700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <LoadingScreen isLoading={isLoading} />
      <PopularSection />
      <MoviesSection />
      <SeriesSection />
      <CartoonsSection />
      <AnimeSection />
    </>
  );
}