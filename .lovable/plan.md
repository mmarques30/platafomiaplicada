
# Tornar Logo Clicável no AuthHeader

## Objetivo
Fazer com que ao clicar no logo da IAplicada no menu superior, o usuário seja redirecionado para a página de autenticação (`/auth`).

## Alteração Técnica

### Arquivo: `src/components/auth/AuthHeader.tsx`

Envolver a imagem do logo em um componente `Link` do react-router-dom para navegação SPA:

**Antes (linhas 83-92):**
```tsx
<div className="flex items-center gap-2">
  <img 
    src={logoAplicada}
    alt="IAplicada" 
    className="h-10 w-auto"
    onError={(e) => {
      e.currentTarget.style.display = 'none';
    }}
  />
</div>
```

**Depois:**
```tsx
<Link to="/auth" className="flex items-center gap-2">
  <img 
    src={logoAplicada}
    alt="IAplicada" 
    className="h-10 w-auto cursor-pointer"
    onError={(e) => {
      e.currentTarget.style.display = 'none';
    }}
  />
</Link>
```

## Resultado
- Clicar no logo em `/sobre` ou `/servicos` navegará para `/auth`
- Navegação será via SPA (sem recarregar a página)
- Cursor mudará para pointer indicando que é clicável
