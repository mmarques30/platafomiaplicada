

# Plano: Separação de Ambientes com Seleção Pós-Login

## Visão Geral

Criar uma tela de seleção de ambiente que aparece **sempre após o login**, permitindo ao usuário escolher entre 4 ambientes distintos: **Gratuito**, **Academy**, **Skills** e **Business**. Cada ambiente terá experiência visual e funcional diferenciada. Um botão fixo no header permitirá alternar entre ambientes a qualquer momento.

```text
┌─────────────────────────────────────────────────────────────────┐
│                        FLUXO ATUAL                               │
│   Login → Dashboard (mistura Academy/Skills/Business)            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        NOVO FLUXO                                │
│   Login → Seleção de Ambiente → Dashboard do Ambiente            │
│                    ↑                                             │
│              Botão no Header ────────────────────────────────────│
└─────────────────────────────────────────────────────────────────┘
```

---

## Estrutura dos 4 Ambientes

| Ambiente | Quem Acessa | Descrição |
|----------|-------------|-----------|
| **Gratuito** | Visitantes (is_visitante=true) | Conteúdos marcados visivel_visitantes, comunidade, CTA para upgrade |
| **Academy** | Usuários com plano academy | Trilhas completas, diagnóstico, evolução individual |
| **Skills** | Usuários com plano skills | Academy + área de capacitação corporativa |
| **Business** | Usuários com plano business | Academy + mentoria 1:1, roadmap, entregas |

### Regras de Acesso

- **Visitante**: Só vê opção "Gratuito"
- **Academy**: Vê "Academy" (Skills e Business ficam bloqueados/grayed out)
- **Skills**: Vê "Academy" + "Skills"
- **Business**: Vê "Academy" + "Business"
- **Admin**: Vê todos os 4 ambientes para simulação

---

## Componentes a Criar

### 1. Nova Página: `EnvironmentSelector.tsx`

Tela elegante com cards dos 4 ambientes. Mostra apenas os ambientes disponíveis para o usuário.

```text
┌─────────────────────────────────────────────────────────────────┐
│                    Selecione seu Ambiente                        │
│                                                                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│   │   GRATUITO   │  │   ACADEMY    │  │   SKILLS     │   ...    │
│   │   🎁         │  │   🎓         │  │   💼         │          │
│   │   Explore    │  │   Trilhas +  │  │   Equipe +   │          │
│   │   grátis     │  │   Evolução   │  │   Academy    │          │
│   └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│   Planos indisponíveis aparecem desabilitados com "Upgrade"      │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Novo Context: `EnvironmentContext.tsx`

Gerencia o ambiente selecionado atualmente e persiste na sessão.

```typescript
type Environment = "gratuito" | "academy" | "skills" | "business";

interface EnvironmentContextType {
  currentEnvironment: Environment | null;
  setEnvironment: (env: Environment) => void;
  availableEnvironments: Environment[];
  isEnvironmentSelected: boolean;
}
```

### 3. Novo Componente: `EnvironmentSwitcher.tsx`

Botão fixo no header que exibe o ambiente atual e permite trocar.

```text
┌──────────────────────────────────────────────────────────────────┐
│  [Logo]  Busca...                        🎓 Academy ▾  [Avatar]  │
│                                              │                    │
│                                              ├─ Gratuito          │
│                                              ├─ Academy ✓         │
│                                              ├─ Skills 🔒         │
│                                              └─ Business 🔒       │
└──────────────────────────────────────────────────────────────────┘
```

---

## Modificações em Arquivos Existentes

### `Auth.tsx`
- Após login bem-sucedido, redirecionar para `/selecionar-ambiente` em vez de `/`

### `App.tsx`
- Adicionar nova rota `/selecionar-ambiente` com `EnvironmentSelector`
- Envolver rotas protegidas com `EnvironmentProvider`

### `MainLayout.tsx`
- Verificar se ambiente foi selecionado, senão redirecionar para seleção
- Renderizar conteúdo baseado no `currentEnvironment`

### `TopHeader.tsx`
- Adicionar componente `EnvironmentSwitcher` ao lado do avatar

### `AppSidebar.tsx`
- Filtrar menus baseado no `currentEnvironment` em vez de `effectivePlan`
- Simplificar lógica removendo dependência direta de plano

### `useUserPlan.tsx` / `useEffectivePlan`
- Adaptar para considerar o ambiente selecionado além do plano real
- Função `getAvailableEnvironments(plan)` para retornar ambientes permitidos

---

## Novo Fluxo de Autenticação

```text
1. Usuário faz login em /auth
2. Auth.tsx detecta sucesso
3. Redireciona para /selecionar-ambiente
4. EnvironmentSelector.tsx:
   - Carrega planos do usuário (useUserPlan)
   - Mostra ambientes disponíveis
   - Usuário clica em um ambiente
   - Salva no EnvironmentContext
   - Redireciona para dashboard do ambiente (/)
5. MainLayout.tsx:
   - Verifica se currentEnvironment está definido
   - Se não, redireciona para /selecionar-ambiente
   - Se sim, renderiza conteúdo filtrado
6. TopHeader.tsx:
   - Exibe EnvironmentSwitcher permitindo trocar a qualquer momento
```

---

## Arquivos a Criar

| Arquivo | Propósito |
|---------|-----------|
| `src/pages/EnvironmentSelector.tsx` | Página de seleção de ambiente |
| `src/contexts/EnvironmentContext.tsx` | Context para gerenciar ambiente atual |
| `src/components/layout/EnvironmentSwitcher.tsx` | Dropdown no header para trocar ambiente |
| `src/hooks/useEnvironment.tsx` | Hook para acessar o contexto de ambiente |

## Arquivos a Modificar

| Arquivo | Mudanças |
|---------|----------|
| `src/App.tsx` | Adicionar rota /selecionar-ambiente, wrap com EnvironmentProvider |
| `src/pages/Auth.tsx` | Redirecionar para /selecionar-ambiente após login |
| `src/components/layout/MainLayout.tsx` | Verificar ambiente selecionado |
| `src/components/layout/TopHeader.tsx` | Adicionar EnvironmentSwitcher |
| `src/components/layout/AppSidebar.tsx` | Filtrar menus por ambiente |
| `src/hooks/useUserPlan.tsx` | Adicionar getAvailableEnvironments |

---

## Design Visual

### Cards de Ambiente

Cada card terá:
- Ícone representativo
- Nome do ambiente
- Breve descrição
- Estado: disponível, selecionado, ou bloqueado

### Cores por Ambiente

| Ambiente | Cor Principal | Ícone |
|----------|---------------|-------|
| Gratuito | Cinza/Verde suave | Gift / Sparkles |
| Academy | Verde (#9EB038) | GraduationCap |
| Skills | Azul | Users / Briefcase |
| Business | Dourado/Premium | Crown / Building |

### EnvironmentSwitcher (Header)

- Pill/Badge mostrando ambiente atual com ícone
- Dropdown ao clicar
- Ambientes bloqueados aparecem com cadeado e link "Fazer upgrade"

---

## Seção Técnica

### Context Implementation

```typescript
// EnvironmentContext.tsx
const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const [currentEnvironment, setCurrentEnvironment] = useState<Environment | null>(() => {
    return sessionStorage.getItem("selected_environment") as Environment | null;
  });
  
  const { plan, isVisitante } = useUserPlan();
  
  const availableEnvironments = useMemo(() => {
    if (isVisitante) return ["gratuito"];
    if (plan === "business") return ["gratuito", "academy", "business"];
    if (plan === "skills") return ["gratuito", "academy", "skills"];
    if (plan === "academy") return ["gratuito", "academy"];
    return ["gratuito"];
  }, [plan, isVisitante]);
  
  const setEnvironment = (env: Environment) => {
    setCurrentEnvironment(env);
    sessionStorage.setItem("selected_environment", env);
  };
  
  // Limpar ambiente ao fazer logout
  useEffect(() => {
    const handleLogout = () => sessionStorage.removeItem("selected_environment");
    window.addEventListener("logout", handleLogout);
    return () => window.removeEventListener("logout", handleLogout);
  }, []);
  
  return (
    <EnvironmentContext.Provider value={{
      currentEnvironment,
      setEnvironment,
      availableEnvironments,
      isEnvironmentSelected: currentEnvironment !== null
    }}>
      {children}
    </EnvironmentContext.Provider>
  );
}
```

### Route Guard

```typescript
// Em MainLayout.tsx
const { currentEnvironment, isEnvironmentSelected } = useEnvironment();

useEffect(() => {
  if (!isEnvironmentSelected && !isLoading) {
    navigate("/selecionar-ambiente", { replace: true });
  }
}, [isEnvironmentSelected, isLoading]);
```

### Logout Cleanup

```typescript
// Em useAuth.tsx - função signOut
const signOut = async () => {
  sessionStorage.removeItem("selected_environment");
  await supabase.auth.signOut();
  queryClient.clear();
  navigate("/auth");
};
```

---

## Comportamento Esperado

| Cenário | Resultado |
|---------|-----------|
| Visitante faz login | Vê apenas "Gratuito", seleciona e vai para /trilhas |
| Academy faz login | Vê "Gratuito" + "Academy", Skills/Business bloqueados |
| Business faz login | Vê "Gratuito" + "Academy" + "Business", Skills bloqueado |
| Usuário clica em ambiente bloqueado | Modal/link para página de upgrade |
| Usuário muda ambiente via header | Sidebar e conteúdo atualizam imediatamente |
| Usuário faz logout | Session limpa, próximo login mostra seleção novamente |
| Admin faz login | Vê todos os 4 ambientes para teste/simulação |

---

## Integração com Sistema de Simulação Existente

O `AdminViewContext` existente pode ser mantido para simulação detalhada de usuários específicos. O novo `EnvironmentContext` é para o fluxo normal de usuários alternando entre seus ambientes disponíveis.

