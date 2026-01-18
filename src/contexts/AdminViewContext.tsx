import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type AdminViewMode = "visitante" | "academy" | "skills" | "business" | null;

interface AdminViewContextType {
  viewAs: AdminViewMode;
  setViewAs: (mode: AdminViewMode) => void;
  isViewingAs: boolean;
  resetView: () => void;
}

const AdminViewContext = createContext<AdminViewContextType | undefined>(undefined);

export function AdminViewProvider({ children }: { children: ReactNode }) {
  const [viewAs, setViewAsState] = useState<AdminViewMode>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin_view_as") as AdminViewMode || null;
    }
    return null;
  });

  useEffect(() => {
    if (viewAs) {
      localStorage.setItem("admin_view_as", viewAs);
    } else {
      localStorage.removeItem("admin_view_as");
    }
  }, [viewAs]);

  const setViewAs = (mode: AdminViewMode) => {
    setViewAsState(mode);
  };

  const resetView = () => {
    setViewAsState(null);
  };

  return (
    <AdminViewContext.Provider
      value={{
        viewAs,
        setViewAs,
        isViewingAs: viewAs !== null,
        resetView,
      }}
    >
      {children}
    </AdminViewContext.Provider>
  );
}

export function useAdminViewContext() {
  const context = useContext(AdminViewContext);
  if (context === undefined) {
    throw new Error("useAdminViewContext must be used within an AdminViewProvider");
  }
  return context;
}
