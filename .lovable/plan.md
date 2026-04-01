

# Converter inline styles do OnboardingVideo para Tailwind

## Alteração

**Arquivo**: `src/components/onboarding/OnboardingVideo.tsx`

### Mapeamento linha a linha

| Elemento | Inline style atual | Tailwind |
|---|---|---|
| Overlay (L38) | `position:'fixed', inset:0, zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.85)', backdropFilter:'blur(8px)'` | `className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-[8px]"` |
| Card (L39) | `background:'#14160F', borderRadius:16, overflow:'hidden', width:'100%', maxWidth:560, boxShadow:'0 24px 80px rgba(0,0,0,0.6)', border:'1px solid rgba(255,255,255,0.06)'` | `className="bg-[#14160F] rounded-2xl overflow-hidden w-full max-w-[560px] shadow-[0_24px_80px_rgba(0,0,0,0.6)] border border-white/[0.06]"` |
| Video wrapper (L40) | `position:'relative', paddingBottom:'56.25%', background:'#0C0F0A'` | `className="relative pb-[56.25%] bg-[#0C0F0A]"` |
| iframe (L43) | `position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none'` | `className="absolute top-0 left-0 w-full h-full border-none"` |
| Content area (L48) | `padding:'28px 32px'` | `className="px-8 py-7"` |
| Label "✱ IAplicada" (L49) | `fontSize:10, fontWeight:600, color:'#AFC040', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8` | `className="text-[10px] font-semibold text-[#AFC040] uppercase tracking-[0.1em] mb-2"` |
| Título (L50) | `fontSize:21, fontWeight:600, color:'#E2E5DC', marginBottom:8, lineHeight:1.3` | `className="text-[21px] font-semibold text-[#E2E5DC] mb-2 leading-[1.3]"` |
| Descrição (L51) | `fontSize:14, color:'#6B7060', lineHeight:1.7, marginBottom:28` | `className="text-sm text-[#6B7060] leading-[1.7] mb-7"` |
| Buttons row (L52) | `display:'flex', alignItems:'center', gap:16` | `className="flex items-center gap-4"` |
| Botão principal (L53) | cores, padding, border, radius, cursor/opacity dinâmicos | `className="bg-[#AFC040] text-[#0C0F0A] text-sm font-semibold px-8 py-3 rounded-[10px] border-none font-[inherit] transition-opacity duration-150"` + `style` apenas para `cursor` e `opacity` dinâmicos |
| Botão "Pular" (L56) | transparent, cor, fontSize | `className="bg-transparent text-[#6B7060] text-[13px] border-none cursor-pointer font-[inherit] py-3 px-0"` |

### Cursor/opacity dinâmicos do botão principal
Manter como `style={{ cursor: entering ? 'not-allowed' : 'pointer', opacity: entering ? 0.7 : 1 }}` ou usar classes condicionais: `${entering ? 'cursor-not-allowed opacity-70' : 'cursor-pointer opacity-100'}`.

### Nenhuma lógica, import ou handler alterado.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/onboarding/OnboardingVideo.tsx` | Editado — inline styles → Tailwind |

