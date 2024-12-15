import { createContext, ReactNode, useContext, useState } from "react";
import { SemanticCOLORS, SemanticICONS } from "semantic-ui-react";

export type PageHeaderButton = {
  text: string;
  disabled: boolean;
  color: SemanticCOLORS;
  icon?: SemanticICONS;
  onClick: () => void;
};  
  
export type PageHeaderButtonsContextType = {
  headerButtons: PageHeaderButton[];
  setHeaderButtons: (buttons: PageHeaderButton[]) => void;
  updateButtonAttributes: (index: number, newAttributes: Record<string, unknown>) => void;
};

const PageHeaderButtonsContext = createContext<PageHeaderButtonsContextType>({
  headerButtons: [],
  setHeaderButtons: () => {},
  updateButtonAttributes: (_0, _1) => {},
});

type PageHeaderButtonsProviderProps = {
  children?: ReactNode;
}

export const PageHeaderButtonsProvider = ({ children }: PageHeaderButtonsProviderProps) => {
  const [headerButtons, setHeaderButtons] = useState<PageHeaderButton[]>([]);

  const updateButtonAttributes = (index: number, newAttributes: Record<string, unknown>) => {
    setHeaderButtons((prevButtons) =>
      prevButtons.map((button, i) =>
        i === index ? { ...button, ...newAttributes } : button
      )
    );
  };

  return (
    <PageHeaderButtonsContext.Provider value={{ headerButtons, setHeaderButtons, updateButtonAttributes }}>
      {children}
    </PageHeaderButtonsContext.Provider>
  );
};

export const useHeaderButtons = () => useContext(PageHeaderButtonsContext);
