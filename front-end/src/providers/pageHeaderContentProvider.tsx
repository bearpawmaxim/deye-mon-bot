import { createContext, ReactNode, useContext, useState } from "react";
import { SemanticCOLORS, SemanticICONS } from "semantic-ui-react";

export type PageHeaderButton = {
  text: string;
  disabled: boolean;
  color: SemanticCOLORS;
  icon?: SemanticICONS;
  onClick: () => void;
};  
  
export type PageHeaderContentContextType = {
  headerButtons: PageHeaderButton[];
  headerText?: string;
  setHeaderButtons: (buttons: PageHeaderButton[]) => void;
  updateButtonAttributes: (index: number, newAttributes: Record<string, unknown>) => void;
  setHeaderText: (caption: string) => void;
};

const PageHeaderContentContext = createContext<PageHeaderContentContextType>({
  headerButtons: [],
  setHeaderButtons: () => {},
  updateButtonAttributes: (_0, _1) => {},
  setHeaderText: (_) => {},
});

type PageHeaderContentProviderProps = {
  children?: ReactNode;
}

export const PageHeaderContentProvider = ({ children }: PageHeaderContentProviderProps) => {
  const [headerButtons, setHeaderButtons] = useState<PageHeaderButton[]>([]);
  const [headerText, setHeaderText] = useState<string | undefined>();

  const updateButtonAttributes = (index: number, newAttributes: Record<string, unknown>) => {
    setHeaderButtons((prevButtons) =>
      prevButtons.map((button, i) =>
        i === index ? { ...button, ...newAttributes } : button
      )
    );
  };

  return (
    <PageHeaderContentContext.Provider value={{ headerButtons, headerText, setHeaderButtons, updateButtonAttributes, setHeaderText }}>
      {children}
    </PageHeaderContentContext.Provider>
  );
};

export const useHeaderContent = () => useContext(PageHeaderContentContext);
