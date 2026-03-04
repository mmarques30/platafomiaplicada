import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type AdminViewMode = "visitante" | "academy" | "skills" | "business_parceria" | "business_sistemas" | null;

interface AdminViewContextType {
  viewAs: AdminViewMode;
  setViewAs: (mode: AdminViewMode, userId?: string, userName?: string) => void;
  isViewingAs: boolean;
  resetView: () => void;
  impersonatedUserId: string | null;
  impersonatedUserName: string | null;
}

const AdminViewContext = createContext<AdminViewContextType | undefined>(undefined);

export function AdminViewProvider({ children }: { children: ReactNode }) {
  const [viewAs, setViewAsState] = useState<AdminViewMode>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin_view_as") as AdminViewMode || null;
    }
    return null;
  });

  const [impersonatedUserId, setImpersonatedUserId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin_view_user_id") || null;
    }
    return null;
  });

  const [impersonatedUserName, setImpersonatedUserName] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin_view_user_name") || null;
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

  useEffect(() => {
    if (impersonatedUserId) {
      localStorage.setItem("admin_view_user_id", impersonatedUserId);
    } else {
      localStorage.removeItem("admin_view_user_id");
    }
  }, [impersonatedUserId]);

  useEffect(() => {
    if (impersonatedUserName) {
      localStorage.setItem("admin_view_user_name", impersonatedUserName);
    } else {
      localStorage.removeItem("admin_view_user_name");
    }
  }, [impersonatedUserName]);

  const setViewAs = (mode: AdminViewMode, userId?: string, userName?: string) => {
    setViewAsState(mode);
    if (userId) {
      setImpersonatedUserId(userId);
    } else {
      setImpersonatedUserId(null);
    }
    if (userName) {
      setImpersonatedUserName(userName);
    } else {
      setImpersonatedUserName(null);
    }
  };

  const resetView = () => {
    setViewAsState(null);
    setImpersonatedUserId(null);
    setImpersonatedUserName(null);
    localStorage.removeItem("admin_view_as");
    localStorage.removeItem("admin_view_user_id");
    localStorage.removeItem("admin_view_user_name");
  };

  return (
    <AdminViewContext.Provider
      value={{
        viewAs,
        setViewAs,
        isViewingAs: viewAs !== null,
        resetView,
        impersonatedUserId,
        impersonatedUserName,
      }}
    >
      {children}
    </AdminViewContext.Provider>
  );
}

// Safe hook that doesn't throw when outside provider
export function useAdminViewContext(): AdminViewContextType {
  const context = useContext(AdminViewContext);
  
  // Return default values if outside provider (safe fallback)
  if (context === undefined) {
    return {
      viewAs: null,
      setViewAs: () => {},
      isViewingAs: false,
      resetView: () => {},
      impersonatedUserId: null,
      impersonatedUserName: null,
    };
  }
  
  return context;
}
