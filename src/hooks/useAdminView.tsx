import { useAdminViewContext, AdminViewMode } from "@/contexts/AdminViewContext";

interface UseAdminViewReturn {
  viewAs: AdminViewMode;
  setViewAs: (mode: AdminViewMode) => void;
  isViewingAs: boolean;
  resetView: () => void;
  canUseViewAs: boolean;
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
    };
  }

  return {
    ...context,
    canUseViewAs: true,
  };
}
