import { useEffect, useState, useCallback } from "react";
import { translations } from "../translations";

export const genreMap = {
  "Action": "28",
  "Adventure": "12",
  "Comedy": "35",
  "Crime": "80",
  "Drama": "18",
  "Fantasy": "14",
  "History": "36",
  "Horror": "27",
  "Mystery": "9648",
  "Romance": "10749",
  "Sci-Fi": "878",
  "Thriller": "53",
  "War": "10752",
  "Western": "37",
  "Musical": "10402",
  "Action & Adventure": "10759",
  "Sci-Fi & Fantasy": "10765",
  "War & Politics": "10768",
  "Documentary": "99",
  "Reality": "10764",
  "Animation": "16",
  "Family": "10751"
};

const genreKeys = Object.fromEntries(
  Object.keys(genreMap).map(name => [
    name,
    "genre_" + name.toLowerCase().replace(/ & /g, "_").replace(/ /g, "_")
  ])
);

export function useTranslation() {
  const [lang, setLang] = useState(localStorage.getItem("language") || "en");

  useEffect(() => {
    const handler = () => setLang(localStorage.getItem("language") || "en");
    window.addEventListener("languageChanged", handler);
    return () => window.removeEventListener("languageChanged", handler);
  }, []);

  const t = (key) => {
    if (key.startsWith("genre_")) {
      return translations[lang]?.[key] || translations.en[key] || key.replace("genre_", "").replace(/_/g, " ");
    }
    return translations[lang]?.[key] || translations.en[key] || key;
  };

  const tg = (englishName) => {
    const key = genreKeys[englishName];
    return key ? t(key) : englishName;
  };

  const getGenreId = (englishName) => genreMap[englishName];

const languageMap = {
  "ru": "ru-RU",
  "en": "en-US",
  "fi": "fi-FI",
};

const getTmdbLanguage = useCallback(() => {
  return languageMap[lang] || "en-US";
}, [lang]);

  return { t, tg, getGenreId, lang, getTmdbLanguage };
}