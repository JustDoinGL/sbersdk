import { createContext, useContext } from "react";
import { NameProducts } from "./1_widgets/test-form";

type NameProductsValue = ReturnType<typeof NameProducts>;

const NameProductsContext = createContext<NameProductsValue | null>(null);

export const useNameProductsContext = () => {
  const ctx = useContext(NameProductsContext);
  if (!ctx) {
    throw new Error("useNameProductsContext must be used inside Provider");
  }
  return ctx;
};

export { NameProductsContext };


import { FC, ReactNode } from "react";
import { NameProductsContext } from "./NameProductsContext";
import { NameProducts } from "./1_widgets/test-form";

export const NameProductsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const data = NameProducts();
  return <NameProductsContext.Provider value={data}>{children}</NameProductsContext.Provider>;
};