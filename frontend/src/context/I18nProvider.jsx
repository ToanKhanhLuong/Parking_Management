import { createContext, useContext, useState, useEffect } from "react";
import resources from "../data/i18n";

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem("lang") || "vi");
  
  const setLang = (newLang) => {
    localStorage.setItem("lang", newLang);
    window.location.reload();
  };

  const t = (key) => {
    if (!key) return "";
    
    // 1. Nếu có dấu hai chấm, dịch theo namespace của i18n chuẩn
    if (key.includes(':')) {
      const [ns, k] = key.split(":");
      return resources[lang]?.[ns]?.[k] || key;
    }
    
    // 2. Dịch phẳng trực tiếp (Flat translate) cho các chuỗi tiếng Việt cứng
    if (lang === 'en' && resources.en[key]) {
      return resources.en[key];
    }
    if (lang === 'vi' && resources.vi[key]) {
      return resources.vi[key];
    }
    
    return key;
  };

  // Automated DOM translation when lang is 'en'
  useEffect(() => {
    if (lang !== 'en') return;

    const dictionary = resources.en;

    const translateNode = (node) => {
      if (!node) return;
      if (node.nodeType === Node.TEXT_NODE) {
        const originalText = node.nodeValue;
        const trimmed = originalText.trim();
        if (trimmed && dictionary[trimmed]) {
          const replaced = originalText.replace(trimmed, dictionary[trimmed]);
          if (node.nodeValue !== replaced) {
            node.nodeValue = replaced;
          }
        }
      } else {
        if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
          // Translate placeholder attribute if present
          if (node.placeholder && typeof node.placeholder === 'string') {
            const trimmedPl = node.placeholder.trim();
            if (dictionary[trimmedPl]) {
              node.placeholder = dictionary[trimmedPl];
            }
          }
          // Translate title attribute if present
          if (node.title && typeof node.title === 'string') {
            const trimmedTitle = node.title.trim();
            if (dictionary[trimmedTitle]) {
              node.title = dictionary[trimmedTitle];
            }
          }
          for (let child of node.childNodes) {
            translateNode(child);
          }
        }
      }
    };

    // Initial pass
    translateNode(document.body);

    // Watch for dynamic elements
    const observer = new MutationObserver((mutations) => {
      for (let mutation of mutations) {
        for (let addedNode of mutation.addedNodes) {
          translateNode(addedNode);
        }
        if (mutation.type === 'characterData') {
          const originalText = mutation.target.nodeValue;
          const trimmed = originalText.trim();
          if (trimmed && dictionary[trimmed]) {
            const replaced = originalText.replace(trimmed, dictionary[trimmed]);
            if (mutation.target.nodeValue !== replaced) {
              observer.disconnect();
              mutation.target.nodeValue = replaced;
              observer.observe(document.body, { childList: true, subtree: true, characterData: true });
            }
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => {
      observer.disconnect();
    };
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
