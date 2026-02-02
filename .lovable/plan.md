

# Plano: Correções Business IAplicada (3 itens)

## Resumo

Corrigir três problemas identificados para o plano Business IAplicada:

1. **Devolutiva do Diagnóstico** - Criar seção que mostre as respostas que o usuário preencheu
2. **Badge na Tabela de Usuários** - Adicionar tratamento para "business_iaplicada" 
3. **Menu Lateral Business** - Ajustar para mostrar apenas: Central, Bibliotecas, Meu Progresso (Visão Geral, Roadmap, Entregas)

---

## Problema 1: Devolutiva do Diagnóstico Business

### Situação Atual
- Quando o usuário Business preenche o formulário, ele é redirecionado para o `BusinessDashboard`
- O dashboard mostra KPIs, gráficos e projetos
- **Não existe** uma visualização das respostas que ele preencheu

### Solução
Criar uma seção "Resumo do Diagnóstico" no `BusinessDashboard` que exiba:
- Dados do projeto (problema principal, processo a automatizar)
- Expectativas (resultado esperado, impacto financeiro)
- Contexto (área de atuação, tamanho da equipe, decisores)
- Objetivos (KPIs, métricas de sucesso)

### Arquivos a Modificar
| Arquivo | Alteração |
|---------|-----------|
| `src/components/mentoria/business/BusinessDashboard.tsx` | Adicionar seção de resumo do diagnóstico |
| `src/components/mentoria/business/BusinessDiagnosticoResumo.tsx` | Novo componente para exibir respostas |

---

## Problema 2: Badge "business_iaplicada" na Tabela

### Situação Atual
O código em `GerenciarUsuarios.tsx` (linhas 210-231):
```tsx
{(user as any).plano_mentoria === "academy" && "Academy"}
{(user as any).plano_mentoria === "skills" && "Skills"}
{(user as any).plano_mentoria === "business" && "Business"}
// business_iaplicada NÃO está mapeado!
```

### Solução
Adicionar tratamento para "business_iaplicada":
```tsx
{(user as any).plano_mentoria === "business_iaplicada"
  ? "border-violet-500 text-violet-700"
  : // ...outros
}
{(user as any).plano_mentoria === "business_iaplicada" && "Business IAplicada"}
```

### Arquivo a Modificar
| Arquivo | Alteração |
|---------|-----------|
| `src/pages/admin/GerenciarUsuarios.tsx` | Adicionar badge para "business_iaplicada" |

---

## Problema 3: Menu Lateral Business IAplicada

### Situação Atual
- O filtro `hiddenByEnvironment` no `useMenuConfig` oculta apenas: `['trilhas', 'calendario']` para business
- Mas o requisito é mostrar **apenas**: Central, Bibliotecas (prompts/ferramentas), Meu Progresso (Visão Geral, Roadmap, Entregas)

### Solução
Atualizar a lógica de filtragem para ocultar todos os menus que não fazem parte da visão Business:

```typescript
const hiddenByEnvironment: Record<string, string[]> = {
  skills: ['trilhas', 'calendario', 'evolucao', 'meu_diagnostico', 'minhas_duvidas'],
  business: [
    'trilhas',           // Ocultar trilhas gerais
    'calendario',        // Ocultar calendário
    'evolucao',          // Ocultar Minha Evolução (Academy)
    'meu_diagnostico',   // Ocultar Meu Diagnóstico (Academy)
    'minhas_duvidas',    // Ocultar Minhas Dúvidas (Academy)
    'trilhas_skills',    // Ocultar Trilhas Skills
    // Skills específicos
    'skills_equipe', 'skills_backlog', 'skills_roadmap', 'skills_entregas', 'skills_lider',
  ],
};
```

### Verificar Bibliotecas no Sidebar
Confirmar que a seção "Bibliotecas" (Prompts e Ferramentas) aparece corretamente para o Business. Se não existir no `menu_config`, precisa ser adicionada.

### Arquivo a Modificar
| Arquivo | Alteração |
|---------|-----------|
| `src/hooks/useMenuConfig.tsx` | Expandir lista de menus ocultos para ambiente business |

---

## Menu Esperado para Business IAplicada

```text
├── Início
│   └── Central
├── Bibliotecas (verificar se existe no menu_config)
│   ├── Biblioteca de Prompts
│   └── Biblioteca de Ferramentas
└── Meu Progresso
    ├── Visão Geral      (/mentoria)
    ├── Roadmap          (/mentoria?tab=roadmap)
    └── Entregas         (criar rota ou usar existente)
```

**Nota**: "Evolução Aprendizado" (`meu_progresso_conteudo`) está configurado para `business/business_iaplicada`, mas o requisito menciona "Entregas". Preciso confirmar se:
- "Entregas" é a mesma coisa que "Evolução Aprendizado"
- Ou se é uma nova página a ser criada

---

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/components/mentoria/business/BusinessDiagnosticoResumo.tsx` | Componente para exibir resumo das respostas |

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/admin/GerenciarUsuarios.tsx` | Badge para "business_iaplicada" |
| `src/hooks/useMenuConfig.tsx` | Expandir `hiddenByEnvironment` para business |
| `src/components/mentoria/business/BusinessDashboard.tsx` | Adicionar seção de resumo |

---

## Seção Técnica

### BusinessDiagnosticoResumo.tsx

```tsx
interface Props {
  diagnostico: {
    problema_principal?: string;
    processo_automatizar?: string;
    resultado_esperado?: string;
    impacto_financeiro_estimado?: string;
    kpi_principal?: string;
    definicao_sucesso?: string;
    // ...outros campos relevantes
  };
}

export function BusinessDiagnosticoResumo({ diagnostico }: Props) {
  const sections = [
    {
      title: "O Projeto",
      items: [
        { label: "Problema Principal", value: diagnostico.problema_principal },
        { label: "Processo a Automatizar", value: diagnostico.processo_automatizar },
        { label: "Resultado Esperado", value: diagnostico.resultado_esperado },
      ]
    },
    {
      title: "Impacto Esperado",
      items: [
        { label: "Impacto Financeiro", value: diagnostico.impacto_financeiro_estimado },
        { label: "KPI Principal", value: diagnostico.kpi_principal },
        { label: "Definição de Sucesso", value: diagnostico.definicao_sucesso },
      ]
    },
  ];

  return (
    <div className="bg-[#0D0D0D] rounded-xl p-6 border border-white/10">
      <h2 className="text-xl font-bold text-white mb-4">Resumo do Diagnóstico</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {sections.map(section => (
          <div key={section.title}>
            <h3 className="text-lg font-semibold text-white/90 mb-3">{section.title}</h3>
            <div className="space-y-2">
              {section.items.filter(i => i.value).map(item => (
                <div key={item.label}>
                  <span className="text-white/50 text-sm">{item.label}:</span>
                  <p className="text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### GerenciarUsuarios.tsx - Badge Atualizado

```tsx
<Badge 
  variant="outline"
  className={`text-xs ${
    (user as any).plano_mentoria === "academy"
      ? "border-blue-500 text-blue-700"
      : (user as any).plano_mentoria === "skills"
      ? "border-orange-500 text-orange-700"
      : (user as any).plano_mentoria === "business"
      ? "border-purple-500 text-purple-700"
      : (user as any).plano_mentoria === "business_iaplicada"
      ? "border-violet-500 text-violet-700"
      : "border-gray-500 text-gray-700"
  }`}
>
  {(user as any).plano_mentoria === "academy" && "Academy"}
  {(user as any).plano_mentoria === "skills" && "Skills"}
  {(user as any).plano_mentoria === "business" && "Business"}
  {(user as any).plano_mentoria === "business_iaplicada" && "Business IAplicada"}
</Badge>
```

### useMenuConfig.tsx - Filtro Expandido

```typescript
const hiddenByEnvironment: Record<string, string[]> = {
  skills: ['trilhas', 'calendario', 'evolucao', 'meu_diagnostico', 'minhas_duvidas'],
  business: [
    'trilhas', 'calendario', 'evolucao', 'meu_diagnostico', 'minhas_duvidas',
    'trilhas_skills', 'skills_equipe', 'skills_backlog', 'skills_roadmap', 
    'skills_entregas', 'skills_lider'
  ],
};
```

