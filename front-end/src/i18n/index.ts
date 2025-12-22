import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enCommon from './en/common.json';
import ukCommon from './uk/common.json';

export const AVAILABLE_LANGUAGES = ['en', 'uk'];

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'en',
    lng: localStorage.getItem('lang') || 'en',

    ns: ['common'],
    defaultNS: 'common',

    resources: {
      en: {
        common: enCommon,
      },
      uk: {
        common: ukCommon,
      },
    },

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
