import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import it from "./locales/it/translation.json";
import en from "./locales/en/translation.json";

// Fase 1: struttura + moduli principali tradotti (titoli, spiegazioni UHI,
// sicurezza, metodologia, UI del selettore layer). I testi di dettaglio più
// lunghi (case study, note tecniche nei pannelli di dettaglio) restano in
// italiano per ora — vedi README, Roadmap.
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      it: { translation: it },
      en: { translation: en },
    },
    fallbackLng: "it",
    interpolation: { escapeValue: false },
  });

export default i18n;
