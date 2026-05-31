import { createContext, useContext, useState } from "react";
import resources from "../data/i18n";

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLang] = useState("vi");
  const t = (key) => {
    const [ns, k] = key.split(":");
    return resources[lang][ns][k] || key;
  };
  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
