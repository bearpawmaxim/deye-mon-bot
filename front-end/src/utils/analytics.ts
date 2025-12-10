import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = 'G-NQYBB8Q68G';

let isInitialized = false;

export const initGA = () => {
  if (!isInitialized && GA_MEASUREMENT_ID) {
    ReactGA.initialize(GA_MEASUREMENT_ID);
    isInitialized = true;
  }
};

export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (isInitialized) {
    ReactGA.send({ hitType: 'pageview', page: pagePath, title: pageTitle });
  }
};

