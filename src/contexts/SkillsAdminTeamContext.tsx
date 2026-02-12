import { createContext, useContext, useState, ReactNode } from "react";

interface SkillsAdminTeamContextType {
  selectedEquipeId: string | null;
  setSelectedEquipeId: (id: string | null) => void;
}

const SkillsAdminTeamContext = createContext<SkillsAdminTeamContextType | null>(null);

export function SkillsAdminTeamProvider({ children }: { children: ReactNode }) {
  const [selectedEquipeId, setSelectedEquipeId] = useState<string | null>(null);

  return (
    <SkillsAdminTeamContext.Provider value={{ selectedEquipeId, setSelectedEquipeId }}>
      {children}
    </SkillsAdminTeamContext.Provider>
  );
}

export function useSkillsAdminTeam() {
  const ctx = useContext(SkillsAdminTeamContext);
  return ctx ?? { selectedEquipeId: null, setSelectedEquipeId: () => {} };
}
