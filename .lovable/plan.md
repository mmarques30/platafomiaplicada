

# Unificar títulos e remover subtítulo

## Mudanças

### 1. MeuSistema.tsx — Remover subtítulo
- Lines 67-71: Remover o `<p>` "Acompanhe o progresso do seu projeto em tempo real"

### 2. MeuSistemaEntregas.tsx — Usar PageTitle
- Lines 76-80: Substituir `<h1>Entregas</h1>` + `<p>` por `<PageTitle primary="Entregas" />`
- Importar `PageTitle`

### 3. MeuSistemaDocumentos.tsx — Usar PageTitle
- Lines 96-100: Substituir `<h1>Documentos</h1>` + `<p>` por `<PageTitle primary="Documentos" />`
- Importar `PageTitle`

## Arquivos
- `src/pages/MeuSistema.tsx`
- `src/pages/MeuSistemaEntregas.tsx`
- `src/pages/MeuSistemaDocumentos.tsx`

