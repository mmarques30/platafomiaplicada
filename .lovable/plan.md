

# Converter inline styles dos KPIs para Tailwind

## Alteração

**Arquivo**: `src/components/dashboard/WelcomeHeader.tsx`

### Skeleton (linha 191)
`style={{ width: 40, height: 22, background: 'rgba(255,255,255,0.06)', borderRadius: 4, animation: '...', margin: '0 auto' }}`
→ `className="w-10 h-[22px] bg-white/[0.06] rounded animate-[kpiPulse_1.2s_ease-in-out_infinite] mx-auto"`

### Container KPI (linhas 230-238)
`style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 20px", flexWrap: "wrap" }}`
→ `className="flex items-center gap-4 px-5 py-2.5 flex-wrap"`

### Cada KPI block (linhas 240, 252, 264)
`style={{ textAlign: "center", minWidth: 50 }}` → `className="text-center min-w-[50px]"`

### KPI values (linhas 241, 253, 265)
`style={{ color: "#2CBBA6", fontWeight: 700, fontSize: 18, lineHeight: 1.2 }}`
→ `className="font-bold text-lg leading-tight"` + `style={{ color: "#2CBBA6" }}` (cor mantida inline)

### KPI labels (linhas 244, 256, 268)
`style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}`
→ `className="text-white/50 text-[10px] font-medium uppercase tracking-[0.5px]"`

### Dividers (linhas 249, 261)
`style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)" }}`
→ `className="w-px h-7 bg-white/10"`

### CTA button (linhas 273-289)
`style={{ marginLeft: "auto", background: "hsl(...)", ... }}`
→ `className="ml-auto bg-primary text-primary-foreground text-[13px] font-medium py-[7px] px-3.5 rounded-lg border-none cursor-pointer whitespace-nowrap"`

### Nenhuma lógica, import ou estrutura JSX alterada.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/dashboard/WelcomeHeader.tsx` | Editado — inline styles → Tailwind |

