"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { CardTitle } from "@/components/ui/card";

// --- Context & Provider ---

type HeaderContextType = {
  title: string;
  setTitle: (title: string) => void;
};

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("AutoBudget");

  return (
    <HeaderContext.Provider value={{ title, setTitle }}>
      {children}
    </HeaderContext.Provider>
  );
}

function useHeader() {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error("useHeader must be used within a HeaderProvider");
  }
  return context;
}

// --- Components ---

export function HeaderTitle() {
  const { title } = useHeader();
  return <CardTitle className="pl-2">{title}</CardTitle>;
}

export function SetHeaderTitle({ title }: { title: string }) {
  const { setTitle } = useHeader();

  useEffect(() => {
    // Timeout helps avoid "Cannot update a component while rendering a different component" error
    const timer = setTimeout(() => setTitle(title), 0);
    return () => clearTimeout(timer);
  }, [title, setTitle]);

  return null;
}
