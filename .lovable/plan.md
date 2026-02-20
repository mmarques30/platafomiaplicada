
# Cards verdes minimalistas para informacoes das trilhas

## O que muda

A area de informacoes abaixo de cada card de trilha (titulo, numero da trilha, classificacao, quantidade de videos) sera envolvida em um card verde discreto com estilo clean e minimalista.

## Visual proposto

Cada bloco de informacoes abaixo da imagem da trilha sera encapsulado em um card com:

- Fundo verde suave (`bg-primary/5`)
- Borda verde sutil (`border border-primary/15`)
- Cantos arredondados (`rounded-xl`)
- Padding interno uniforme (`p-3`)
- Mesma largura do card da trilha acima (ja garantido pelo layout do carrossel)

O conteudo interno permanece o mesmo (titulo, badges de trilha/classificacao, contagem de videos), apenas organizado dentro do card verde.

## Secao Tecnica

### Arquivo modificado

| Arquivo | Mudanca |
|---|---|
| `src/components/dashboard/TodasAsTrilhas.tsx` | Envolver o bloco de info (linhas 172-187) em um container com classes de card verde |

### Antes (linhas 172-187)

```text
<div className="px-1 space-y-0.5">
  <p>titulo</p>
  <div>badges + videos</div>
</div>
```

### Depois

```text
<div className="bg-primary/5 border border-primary/15 rounded-xl p-3 space-y-1">
  <p>titulo</p>
  <div>badges + videos</div>
</div>
```

Nenhuma mudanca estrutural -- apenas adicionar classes de estilo ao container existente para criar o efeito de card verde discreto.
