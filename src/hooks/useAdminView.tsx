import { useAdminViewContext, AdminViewMode } from "@/contexts/AdminViewContext";

interface UseAdminViewReturn {
  viewAs: AdminViewMode;
  setViewAs: (mode: AdminViewMode, userId?: string, userName?: string) => void;
  isViewingAs: boolean;
  resetView: () => void;
  canUseViewAs: boolean;
  impersonatedUserId: string | null;
  impersonatedUserName: string | null;
}

export function useAdminView(isAdmin: boolean): UseAdminViewReturn {
  const context = useAdminViewContext();

  // Só permite uso se for admin
  if (!isAdmin) {
    return {
      viewAs: null,
      setViewAs: () => {},
      isViewingAs: false,
      resetView: () => {},
      canUseViewAs: false,
      impersonatedUserId: null,
      impersonatedUserName: null,
    };
  }

  return {
    ...context,
    canUseViewAs: true,
  };
}
