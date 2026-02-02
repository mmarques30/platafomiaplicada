

# Plano: Menu Específico para Business IAplicada

## Objetivo
Criar uma experiência de menu lateral simplificada para usuários `business_iaplicada`, focada apenas no acompanhamento do projeto (já que neste modelo a IAplicada constrói e o cliente acompanha).

## Menu Desejado para Business IAplicada

```text
├── Central                    ← Página inicial
├── Bibliotecas               
│   ├── Prompts                ← Apenas prompts
│   └── Ferramentas            ← Apenas ferramentas
└── Meu Progresso
    ├── Visão Geral            ← /mentoria (já existe)
    ├── Roadmap                ← /mentoria?tab=roadmap (já existe)
    └── Entregas               ← /mentoria/entregas (a criar menu)
```

## O que NÃO deve aparecer para Business IAplicada
- "Aprender" (toda a seção - trilhas, calendário, central de conteúdo)
- "IA Copie e Use" (da biblioteca)
- "Métodos" (da biblioteca)
- "Evolução Aprendizado" (do Meu Progresso)
- "Comunidade" (toda a seção)

---

## Alterações Necessárias

### 1. Banco de Dados: Novo menu "Entregas"

Inserir novo submenu para "Entregas" em Meu Progresso (apenas para `business_iaplicada`):

```sql
INSERT INTO menu_config (
  menu_key, label, tipo, url, icon, visivel, editavel, ordem, 
  parent_key, planos_permitidos
) VALUES (
  'meu_progresso_entregas',
  'Entregas',
  'sidebar',
  '/mentoria/entregas',
  'Package',
  true,
  true,
  33,
  'meu_progresso',
  ARRAY['business_iaplicada']
);
```

### 2. Banco de Dados: Ajustar "Evolução Aprendizado"

Atualizar o menu `meu_progresso_conteudo` para aparecer apenas para `business` (não `business_iaplicada`):

```sql
UPDATE menu_config 
SET planos_permitidos = ARRAY['business']
WHERE menu_key = 'meu_progresso_conteudo';
```

### 3. `src/hooks/useMenuConfig.tsx`

Adicionar ambiente `business_iaplicada` separado do `business`:

```typescript
const hiddenByEnvironment: Record<string, string[]> = {
  skills: ['trilhas', 'calendario'],
  
  // Business Colaborativo: oculta Academy-only e Skills-only
  business: [
    'trilhas', 'calendario', 'evolucao', 'meu_diagnostico', 'minhas_duvidas',
    'trilhas_skills', 'skills_equipe', 'skills_backlog', 'skills_roadmap', 
    'skills_entregas', 'skills_lider'
  ],
  
  // Business IAplicada: versão mais restrita (cliente apenas acompanha)
  business_iaplicada: [
    'aprender',                    // Oculta todo o grupo "Aprender"
    'trilhas', 'trilhas_skills', 'calendario', 'central_conteudo',
    'evolucao', 'meu_diagnostico', 'minhas_duvidas',
    'meu_progresso_conteudo',      // "Evolução Aprendizado" oculta
    'skills_equipe', 'skills_backlog', 'skills_roadmap', 
    'skills_entregas', 'skills_lider',
    'comunidade', 'comunidade_feed', 'comunidade_sala'  // Oculta comunidade
  ],
};
```

### 4. `src/components/layout/AppSidebar.tsx`

Separar o ambiente de simulação para `business_iaplicada`:

**Linha 72-74 - Alterar:**
```typescript
case "business":
case "business_iaplicada":
  return "business";
```

**Para:**
```typescript
case "business":
  return "business";
case "business_iaplicada":
  return "business_iaplicada";
```

### 5. `src/components/layout/AppSidebar.tsx` - Filtrar Bibliotecas

Adicionar lógica para renderizar apenas Prompts e Ferramentas quando for `business_iaplicada` (em torno da linha 270):

```typescript
// Detectar se é IAplicada
const isBusinessIAplicadaEnv = effectiveEnvironment === 'business_iaplicada' 
  || effectivePlan === 'business_iaplicada';

// Condicional de itens de biblioteca
{isBusinessIAplicadaEnv ? (
  <>
    {/* Apenas Prompts e Ferramentas */}
    <SidebarMenuItem>
      <NavLink to="/biblioteca-prompts">Prompts</NavLink>
    </SidebarMenuItem>
    <SidebarMenuItem>
      <NavLink to="/biblioteca-ferramentas">Ferramentas</NavLink>
    </SidebarMenuItem>
  </>
) : (
  <>
    {/* Todos os itens de biblioteca */}
    <SidebarMenuItem><NavLink to="/ia-copie-use">IA "Copie e Use"</NavLink></SidebarMenuItem>
    <SidebarMenuItem><NavLink to="/biblioteca-ferramentas">Ferramentas</NavLink></SidebarMenuItem>
    <SidebarMenuItem><NavLink to="/biblioteca-prompts">Prompts</NavLink></SidebarMenuItem>
    <SidebarMenuItem><NavLink to="/metodos-aplicar">Métodos</NavLink></SidebarMenuItem>
  </>
)}
```

### 6. `src/pages/Mentoria.tsx`

Ajustar para Business IAplicada não mostrar a aba "Evolução Aprendizado":

```typescript
// Mostrar aba Evolução apenas para Business Colaborativo (não IAplicada)
const showEvolucaoTab = isBusiness && !isBusinessIAplicada;

// No grid de tabs
className={`grid ${showEvolucaoTab ? 'grid-cols-3' : 'grid-cols-2'} ...`}

// Na renderização da aba
{showEvolucaoTab && (
  <TabsTrigger value="evolucao-aprendizado">
    Evolução Aprendizado
  </TabsTrigger>
)}

// E no TabsContent
{showEvolucaoTab && (
  <TabsContent value="evolucao-aprendizado">
    <BusinessEvolucaoAprendizado />
  </TabsContent>
)}
```

---

## Resumo das Alterações

| Arquivo/Local | Alteração |
|---------------|-----------|
| Banco de dados | Inserir menu `meu_progresso_entregas` com `planos_permitidos: [business_iaplicada]` |
| Banco de dados | Atualizar `meu_progresso_conteudo` para `planos_permitidos: [business]` apenas |
| `useMenuConfig.tsx` | Adicionar `business_iaplicada` ao `hiddenByEnvironment` com lista restritiva |
| `AppSidebar.tsx` | Separar `business_iaplicada` de `business` no switch de ambiente |
| `AppSidebar.tsx` | Filtrar Bibliotecas para mostrar apenas Prompts e Ferramentas |
| `Mentoria.tsx` | Ocultar aba "Evolução Aprendizado" para `isBusinessIAplicada` |

---

## Resultado Final

### Para Business Colaborativo (`business`):
```text
├── Central
├── Bibliotecas (todos os 4 itens)
└── Meu Progresso
    ├── Visão Geral
    ├── Roadmap
    └── Evolução Aprendizado
```

### Para Business IAplicada (`business_iaplicada`):
```text
├── Central
├── Bibliotecas
│   ├── Prompts
│   └── Ferramentas
└── Meu Progresso
    ├── Visão Geral
    ├── Roadmap
    └── Entregas
```

---

## Seção Técnica

### SQL para menu_config

```sql
-- Inserir novo menu Entregas para IAplicada
INSERT INTO menu_config (menu_key, label, tipo, url, icon, visivel, editavel, ordem, parent_key, planos_permitidos)
VALUES ('meu_progresso_entregas', 'Entregas', 'sidebar', '/mentoria/entregas', 'Package', true, true, 33, 'meu_progresso', ARRAY['business_iaplicada']);

-- Ajustar Evolução Aprendizado para apenas Business Colaborativo
UPDATE menu_config 
SET planos_permitidos = ARRAY['business']
WHERE menu_key = 'meu_progresso_conteudo';
```

### useMenuConfig.tsx (linhas 51-62)

```typescript
const hiddenByEnvironment: Record<string, string[]> = {
  skills: ['trilhas', 'calendario'],
  
  business: [
    'trilhas', 'calendario', 'evolucao', 'meu_diagnostico', 'minhas_duvidas',
    'trilhas_skills', 'skills_equipe', 'skills_backlog', 'skills_roadmap', 
    'skills_entregas', 'skills_lider'
  ],
  
  business_iaplicada: [
    'aprender', 'trilhas', 'trilhas_skills', 'calendario', 'central_conteudo',
    'evolucao', 'meu_diagnostico', 'minhas_duvidas', 'meu_progresso_conteudo',
    'skills_equipe', 'skills_backlog', 'skills_roadmap', 'skills_entregas', 'skills_lider',
    'comunidade', 'comunidade_feed', 'comunidade_sala'
  ],
};
```

### AppSidebar.tsx - effectiveEnvironment (linhas 65-78)

```typescript
switch (viewAs) {
  case "visitante":
    return "gratuito";
  case "academy":
    return "academy";
  case "skills":
    return "skills";
  case "business":
    return "business";
  case "business_iaplicada":
    return "business_iaplicada";
  default:
    return currentEnvironment;
}
```

### AppSidebar.tsx - Filtro Bibliotecas (nova lógica em torno da linha 270)

Adicionar variável de detecção e condicional de renderização para itens de biblioteca.

### Mentoria.tsx (linhas 52-72 e 110-114)

```typescript
// Condição para mostrar aba
const showEvolucaoTab = isBusiness && !isBusinessIAplicada;

// Grid classes
className={`grid ${showEvolucaoTab ? 'grid-cols-3' : 'grid-cols-2'} ...`}

// Renderização condicional da aba
{showEvolucaoTab && (
  <TabsTrigger value="evolucao-aprendizado">...</TabsTrigger>
)}

// E do conteúdo
{showEvolucaoTab && (
  <TabsContent value="evolucao-aprendizado">...</TabsContent>
)}
```

