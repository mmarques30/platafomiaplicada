
# Plano: Reformular Página de Cupons

## Resumo das Mudanças
1. Remover o ícone do título "Descontos IAplicada"
2. Reformular o card de cupom para formato mais discreto com fundo verde da marca
3. Criar sistema de abas, com sub-aba "Academy" contendo o cupom e descrição introdutória

---

## Mudanças Detalhadas

### 1. Remover ícone do título
**Arquivo:** `src/pages/Cupons.tsx`
- Remover a prop `icon` do componente `PageTitle`
- Manter apenas o título "Descontos IAplicada"

**De:**
```tsx
<PageTitle 
  primary="Descontos" 
  secondary="IAplicada"
  icon={<Ticket className="h-7 w-7 text-primary" />}
/>
```

**Para:**
```tsx
<PageTitle 
  primary="Descontos" 
  secondary="IAplicada"
/>
```

---

### 2. Criar estrutura de abas
**Arquivo:** `src/pages/Cupons.tsx`
- Adicionar import do componente Tabs
- Criar estrutura com TabsList e TabsTrigger para "Academy"
- Possibilidade de adicionar mais abas no futuro

**Estrutura:**
```text
+---------------------------+
|  Descontos IAplicada      |
+---------------------------+
| [Academy]  [Outras abas]  |
+---------------------------+
| Conteúdo da aba           |
+---------------------------+
```

---

### 3. Adicionar descrição introdutória na aba Academy
**Arquivo:** `src/pages/Cupons.tsx`
- Texto explicativo antes do cupom
- Mensagem: "O Academy é o primeiro passo da sua jornada na IAplicada. Aqui você começa sua trilha de aprendizado em Inteligência Artificial aplicada ao seu dia a dia profissional."

---

### 4. Reformular card de cupom
**Arquivo:** `src/pages/Cupons.tsx`
- Formato compacto (tipo tabela/inline)
- Fundo verde da marca (`bg-aplicada-green-700`)
- Texto branco para contraste
- Layout horizontal com cupom + botão copiar + botão comprar

**Novo design:**
```text
+-----------------------------------------------+
| bg-aplicada-green-700                         |
| +-------------------------------------------+ |
| |  ComunidadeIAplicada  [📋] [Comprar Agora]| |
| +-------------------------------------------+ |
+-----------------------------------------------+
```

---

## Estrutura Final da Página

```text
Descontos IAplicada (sem ícone)

[Academy]

Descrição:
"O Academy é o primeiro passo da sua jornada..."

+-- Card compacto verde --+
| Cupom: XXX  [📋] [CTA]  |
+-------------------------+

[Tabela comparativa]

[CTA final com foto da Mari]
```

---

## Arquivos a Serem Alterados
- `src/pages/Cupons.tsx` (única mudança necessária)

---

## Cores Utilizadas
| Elemento | Cor Tailwind | Código |
|----------|-------------|--------|
| Fundo do card | bg-aplicada-green-700 | #9EB038 |
| Texto do card | text-white | #FFFFFF |
| Hover do botão | hover:bg-aplicada-green-800 | #889C2D |

