

# Corrigir StatCards para seguir fielmente o design card-10

## Problemas atuais vs referencia

O design de referencia mostra:
- Numero **muito grande** (text-5xl/6xl) com sufixo menor ao lado
- Titulo descritivo **abaixo** do numero, em texto cinza medio
- Trend badge na parte inferior com **icone dentro de circulo colorido** (verde ou vermelho), valor de mudanca em cor, e descricao em cinza
- Cards com **padding generoso**, borda sutil, cantos arredondados
- Espacamento vertical claro entre numero, titulo e trend

## O que mudar em `ProjetoOverviewCards.tsx`

### StatCard redesenhado:
1. **Numero**: `text-5xl font-bold` com sufixo em `text-3xl text-muted-foreground` inline
2. **Titulo**: `text-sm text-muted-foreground` abaixo do numero, com `mt-2`
3. **Trend line**: flex row com:
   - Icone (ArrowUpRight/ArrowDownRight) dentro de um **circulo** (`w-7 h-7 rounded-full`) com bg verde/vermelho translucido
   - Valor de change em **cor** (green-600/red-600) com sinal +/-
   - Texto descritivo em muted-foreground
4. **Card**: `rounded-2xl border border-border p-6 space-y-4`, sem shadow no hover (clean)
5. **Grid**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`

### Adaptacao dos dados:
- Saude: textValue sem sufixo, trend mostra comparacao
- Roadmap: value com sufixo "ª fase"  
- Cronograma: value com sufixo "%", change baseado em progresso
- Entregas: value com sufixo `/${total}`, change baseado em percentual

1 arquivo editado: `src/components/meu-sistema/ProjetoOverviewCards.tsx`

