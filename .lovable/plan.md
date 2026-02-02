

# Plano: Página de Cupons com Comparativo de Mercado

## Resumo das Mudanças

1. **Remover badge vermelho** do Dashboard para visitantes
2. **Adicionar menu verde "Cupons"** na sidebar (apenas visitantes)
3. **Criar página `/cupons`** com tabela comparativa profissional
4. **Registrar rota** no App.tsx

---

## 1. Dashboard - Remover Badge Vermelho

**Arquivo:** `src/pages/Dashboard.tsx`

Remover o Link vermelho das linhas 49-55 que mostra "Ter acesso ao Academy":

```tsx
// REMOVER (linhas 49-55)
<Link 
  to="/servicos"
  className="... text-red-600 bg-red-50/50 ..."
>
  <Zap className="h-5 w-5" />
  Ter acesso ao Academy
</Link>
```

---

## 2. Sidebar - Adicionar Menu Cupons Verde

**Arquivo:** `src/components/layout/AppSidebar.tsx`

Inserir antes do menu "Comunidade" (linha 357):

```tsx
{/* Menu Cupons - Apenas visitantes */}
{isVisitante && !isLoadingState && (
  <SidebarMenuItem>
    <SidebarMenuButton asChild className="group">
      <NavLink 
        to="/cupons" 
        end 
        className={({ isActive }) => cn(
          "relative rounded-lg transition-all duration-200 font-semibold pl-4 py-2.5",
          "bg-emerald-500 text-white hover:bg-emerald-600",
          isActive && "ring-2 ring-emerald-300 ring-offset-2"
        )}
      >
        <LucideIcons.Ticket className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        {!collapsed && <span className="text-sm">Cupons</span>}
      </NavLink>
    </SidebarMenuButton>
  </SidebarMenuItem>
)}
```

---

## 3. Nova Página - Cupons.tsx

**Arquivo:** `src/pages/Cupons.tsx` (CRIAR)

### Estrutura da Página

| Seção | Descrição |
|-------|-----------|
| Header | PageTitle com ícone verde "Cupons exclusivos" |
| Card CTA | Cupom copiável + botão "Comprar Agora" |
| Tabela Comparativa | Grid 5 colunas (IAplicada vs 3 concorrentes) |

### Tabela Comparativa Final (sem "Formação teórica ampla")

| Característica | IAplicada | Adapta | Viver IA | Asimov |
|----------------|:---------:|:------:|:--------:|:------:|
| Resultados reais em 30 dias | ✓ | | | |
| Comunidade ativa com cases | ✓ | | | |
| Certificação por trilha | ✓ | | | ✓ |
| Trilhas por objetivo específico | ✓ | | | |
| Templates e prompts testados | ✓ | | | ✓ |
| Formação teórica + foco prático | ✓ | | | |
| Escala para times e empresas | ✓ | | | |
| Atualização constante 2026 | ✓ | | | |
| +15 LLMs integradas | | ✓ | | |
| Cursos genéricos por área | | ✓ | ✓ | ✓ |
| Foco em freelance/side hustle | | | ✓ | |

### Dados do Cupom

| Campo | Valor |
|-------|-------|
| Link de Compra | `https://clkdmg.site/pay/iaplicadaacademy` |
| Cupom | `ComunidadeIAplicada` |

### Design

- Layout inspirado no 21st.dev pricing-section-with-comparison
- IAplicada destacada com `bg-primary` e badge "Recomendado"
- Concorrentes em `bg-muted/50` (fundo neutro)
- Ícones Check e Minus do Lucide (sem emojis)
- Tipografia clean e profissional

---

## 4. App.tsx - Registrar Rota

**Arquivo:** `src/App.tsx`

Adicionar import e rota:

```tsx
import Cupons from "./pages/Cupons";

// Dentro das rotas protegidas com MainLayout
<Route path="/cupons" element={<Cupons />} />
```

---

## Arquivos a Modificar/Criar

| Arquivo | Ação |
|---------|------|
| `src/pages/Dashboard.tsx` | Remover badge vermelho (linhas 49-55) |
| `src/components/layout/AppSidebar.tsx` | Adicionar menu Cupons verde (linha 357) |
| `src/pages/Cupons.tsx` | **CRIAR** - Página com comparativo |
| `src/App.tsx` | Adicionar rota `/cupons` |

