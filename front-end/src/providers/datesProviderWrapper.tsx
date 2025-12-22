import { DatesProvider } from '@mantine/dates';
import { useTranslation } from 'react-i18next';
import 'dayjs/locale/uk';
import 'dayjs/locale/en';
import localeData from 'dayjs/plugin/localeData';
import dayjs from 'dayjs';

const localeMap: Record<string, string> = {
  en: 'en',
  uk: 'uk',
};

export const DatesProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation();
  const currentLocale = localeMap[i18n.language] ?? 'en';

  dayjs.extend(localeData);
  dayjs.locale(currentLocale);

  return (
    <DatesProvider settings={{ locale: currentLocale }}>
      {children}
    </DatesProvider>
  );
}
