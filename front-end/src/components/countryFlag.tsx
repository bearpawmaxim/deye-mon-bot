import { FC } from "react";
import ReactCountryFlag from "react-country-flag";
import { useTranslation } from "react-i18next";
import { getCountryByLang } from "../utils"


type CountryFlagProps = {
  language?: string;
};

export const CountryFlag: FC<CountryFlagProps> = ({ language }) => {
  const { i18n } = useTranslation();
  return <ReactCountryFlag countryCode={getCountryByLang(language ?? i18n.language)} svg/>
}