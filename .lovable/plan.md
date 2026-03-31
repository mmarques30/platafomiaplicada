

# Criar EmptyState e aplicar nos 4 componentes

## 1. Novo componente: `src/components/ui/EmptyState.tsx`
Props: `icon` (LucideIcon), `title` (string), `description` (string), `action?` ({ label, href }).
Visual: centralizado, ícone 32px muted, título 15px weight 500, descrição 13px muted, botão outline opcional.

## 2. Integrações

### `MentoriaEntregas.tsx` (linhas 277-284)
Substituir o bloco Card/CardContent com Package+texto por:
```tsx
<EmptyState icon={Package} title="Nenhuma entrega ainda" description="As entregas definidas pela sua mentora aparecerão aqui." />
```

### `MentoriaTarefas.tsx` (linhas 155-159)
Substituir o div vazio "Nenhuma tarefa" no kanban por:
```tsx
<EmptyState icon={CheckSquare} title="Nenhuma tarefa ainda" description="As tarefas do seu projeto aparecerão aqui quando forem criadas." />
```
Importar `CheckSquare` de lucide-react.

### `MentoriaSessoes.tsx` (linhas 183-188)
Substituir o bloco Calendar+texto por:
```tsx
<EmptyState icon={Calendar} title="Nenhuma sessão agendada" description="Suas sessões aparecerão aqui quando forem confirmadas." />
```

### `MentoriaValidacoes.tsx` (linhas 289-299)
Substituir Card/CardContent com CheckSquare+texto condicional por:
```tsx
<EmptyState icon={ClipboardCheck} title="Nenhuma validação pendente" description="Validações do seu projeto aparecerão aqui." />
```
Importar `ClipboardCheck` de lucide-react.

## Arquivos
- **Novo**: `src/components/ui/EmptyState.tsx`
- **Editados**: `MentoriaEntregas.tsx`, `MentoriaTarefas.tsx`, `MentoriaSessoes.tsx`, `MentoriaValidacoes.tsx`

