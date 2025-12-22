import { Menu } from "@mantine/core";
import i18n, { AVAILABLE_LANGUAGES } from "../i18n";
import { FC } from "react";
import { CountryFlag } from "./countryFlag";

type LangPickerProps = {
  iconPosition?: 'left' | 'right';
};

export const LangPicker: FC<LangPickerProps> = ({ iconPosition }) => {
  const onLangChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return <>
    {AVAILABLE_LANGUAGES.map(lng => <Menu.Item
        key={lng}
        onClick={onLangChange.bind(this, lng)}
        leftSection={iconPosition === 'left' ? <CountryFlag language={lng} /> : null}
        rightSection={(!iconPosition || iconPosition === 'right') ? <CountryFlag language={lng} /> : null}
      >
        {i18n.t(`lang.${lng}`)}
      </Menu.Item>)}
  </>
};