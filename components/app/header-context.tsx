"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Separator } from "@/components/ui/separator";
import { CardTitle } from "@/components/ui/card";

// --- Context & Provider ---

type HeaderContextType = {
  title: string;
  setTitle: (title: string) => void;
  action: ReactNode | null;
  setAction: (action: ReactNode | null) => void;
};

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("AutoBudget");
  const [action, setAction] = useState<ReactNode | null>(null);

  return (
    <HeaderContext.Provider value={{ title, setTitle, action, setAction }}>
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

export function HeaderAction() {
  const { action } = useHeader();

  if (!action) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Separator orientation="vertical" className="mr-2" />
      {action}
    </div>
  );
}

export function SetHeaderTitle({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  const { setTitle, setAction } = useHeader();

  useEffect(() => {
    // Timeout helps avoid "Cannot update a component while rendering a different component" error
    const timer = setTimeout(() => {
      setTitle(title);
      setAction(action || null);
    }, 0);
    return () => clearTimeout(timer);
  }, [title, action, setTitle, setAction]);

  return null;
}
