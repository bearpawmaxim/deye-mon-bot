import { createContext, ReactNode, useContext, useState } from "react";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { MantineColor } from "@mantine/core";

export type PageHeaderButton = {
  text: string;
  disabled: boolean;
  color: MantineColor;
  icon?: IconName;
  onClick: () => void;
};

export type PageHeaderContentContextType = {
  headerButtons: PageHeaderButton[];
  headerText?: string;
  setHeaderButtons: (buttons: PageHeaderButton[]) => void;
  updateButtonAttributes: (index: number, newAttributes: Record<string, unknown>) => void;
  setHeaderText: (caption: string) => void;
  resetHeaderText: () => void;
};

const PageHeaderContentContext = createContext<PageHeaderContentContextType>({
  headerButtons: [],
  setHeaderButtons: () => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateButtonAttributes: (_0, _1) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setHeaderText: (_) => {},
  resetHeaderText: () => {},
});

type PageHeaderContentProviderProps = {
  children?: ReactNode;
};

export const PageHeaderContentProvider = ({ children }: PageHeaderContentProviderProps) => {
  const [headerButtons, setHeaderButtons] = useState<PageHeaderButton[]>([]);
  const [headerText, setHeaderText] = useState<string | undefined>();
  const resetHeaderText = () => setHeaderText('');

  const updateButtonAttributes = (index: number, newAttributes: Record<string, unknown>) => {
    setHeaderButtons((prevButtons) =>
      prevButtons.map((button, i) =>
        i === index ? { ...button, ...newAttributes } : button
      )
    );
  };

  return (
    <PageHeaderContentContext.Provider value={{
        headerButtons,
        headerText,
        setHeaderButtons,
        updateButtonAttributes,
        setHeaderText,
        resetHeaderText,
      }}>
      {children}
    </PageHeaderContentContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHeaderContent = () => useContext(PageHeaderContentContext);
