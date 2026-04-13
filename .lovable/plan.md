

# Fix: Runtime error no dashboard admin + redeploy

## Problema

O site publicado (plataforma.iaplicada.com) não está carregando porque há um erro de runtime no dashboard admin: `Cannot read properties of undefined (reading 'novosUsuarios')`. Isso ocorre porque a interface `VisaoGeralTabProps` não inclui o campo `novosUsuarios7d` no objeto `crescimento`, mas o componente tenta acessá-lo.

Além disso, o card "Novos (7d)" na linha 112 usa lógica confusa — deveria mostrar `crescimento.novosUsuarios7d` mas esse campo não está na interface.

## Correção

**Arquivo: `src/components/admin/dashboard/VisaoGeralTab.tsx`**

1. Adicionar campos ausentes na interface `crescimento`:
   - `novosUsuarios7d: number`
   - `novosUsuarios30d: number`
   - `usuariosAtivos30d: number`

2. Corrigir o card "Novos (7d)" (linha 110-116) para mostrar o valor correto:
   ```tsx
   <StatsCard
     title="Novos (7d)"
     value={data.crescimento.novosUsuarios7d}
     description="vs. 7 dias anteriores"
     icon={TrendingUp}
     trend={data.tendencias.novosUsuarios}
   />
   ```

Após a correção, o build vai funcionar e o site publicado carregará normalmente. Mudanças no frontend requerem clicar "Update" no dialog de publicação para ir ao ar no domínio customizado.

