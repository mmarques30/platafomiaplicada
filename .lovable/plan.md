
# Corrigir erro persistente de importação de arquivo em “Novo Material Gratuito” (Admin)

## Diagnóstico encontrado

O erro atual não é mais do campo `url` no banco.  
Pelos logs do navegador, a falha agora acontece no upload do arquivo para o storage:

- `StorageApiError: Invalid key: 1771955595073_ZAPIER + IA AUTOMAÇÕES INTELIGENTES.pdf`

Causa: o nome do arquivo está sendo enviado quase “cru” (`${Date.now()}_${file.name}`), contendo caracteres especiais (acentos, `+`, espaços/símbolos) que podem invalidar a chave do objeto no storage.

## O que será implementado

1. **Sanitizar o nome do arquivo antes do upload** em `GerenciarMateriais.tsx`, seguindo padrão já usado em outras partes do projeto.
2. **Gerar chave de arquivo segura** (somente caracteres permitidos), preservando extensão.
3. **Manter URL pública normalmente** após upload bem-sucedido.
4. **Aprimorar feedback de erro** para facilitar diagnóstico caso algum upload volte a falhar.
5. **(Opcional recomendado) validação de tamanho** de arquivo no front para evitar tentativas inválidas.

## Estratégia técnica

### Arquivo alvo
- `src/pages/admin/GerenciarMateriais.tsx`

### Ajustes no `handleFileUpload`

- Trocar:
```ts
const fileName = `${Date.now()}_${file.name}`;
```

- Por geração segura, por exemplo:
```ts
const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
const base = file.name.replace(/\.[^/.]+$/, '');
const normalized = base
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')   // remove acentos
  .replace(/[^a-zA-Z0-9.-]/g, '_')   // troca inválidos por _
  .replace(/_+/g, '_')               // colapsa __
  .replace(/^_+|_+$/g, '');          // trim de _
const safeBase = normalized || 'arquivo';
const fileName = `${Date.now()}-${safeBase}.${ext}`;
```

Isso evita chaves inválidas com `+`, acentos e símbolos.

### Robustez adicional recomendada

- Em `handleRemoveFile`, extrair o path do arquivo de forma mais robusta via `new URL(url)` + decode, para não quebrar se houver subpastas/futuros ajustes de estrutura.
- Melhorar `toast.error(...)` para mostrar mensagem amigável baseada no erro retornado (`error.message`) em vez de sempre genérica.

## Resultado esperado

Após esse ajuste:
- Upload de arquivos com nomes complexos (acentos, espaços, símbolos) funcionará normalmente.
- Criação de “Novo Material Gratuito” com arquivo voltará a funcionar sem erro de chave inválida.
- Fluxo ficará mais resiliente para diferentes nomes de arquivo.

## Validação (teste fim a fim)

1. Ir em `/admin/materiais`.
2. Clicar em **Novo Material**.
3. Fazer upload de um arquivo com nome “problemático” (ex.: `ZAPIER + IA AUTOMAÇÕES INTELIGENTES.pdf`).
4. Confirmar:
   - upload concluído sem erro;
   - arquivo aparece na lista;
   - salvar material com sucesso;
   - material aparece na tabela e abre corretamente no front.
