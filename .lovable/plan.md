

# Plano: Melhorar Popup de Notificação de Expiração para Visitantes

## Objetivo
Ajustar o componente `VisitorExpirationNotice` para:
1. Remover todos os emojis das mensagens
2. Personalizar mensagens com base no cupom do usuário (Academy12 ou Academy15)
3. Adicionar verificação de duplicidade de conta na edge function

---

## Alterações no Componente de Popup

### Arquivo: `src/components/shared/VisitorExpirationNotice.tsx`

**Mudanças:**
- Remover emojis dos títulos
- Melhorar textos para serem mais profissionais
- Personalizar mensagens baseadas no engajamento do usuário

### Configuração Atualizada (sem emojis):

```typescript
const urgencyConfig = {
  "7_dias": {
    icon: Gift,
    title: "Seu acesso gratuito expira em 7 dias",
    description: `Você aproveitou bem a comunidade! Garanta ${desconto} de desconto exclusivo no Academy e continue sua jornada de aprendizado em IA.`,
    bgClass: "bg-aplicada-green-600/95",
    borderClass: "border-aplicada-green-400",
  },
  "3_dias": {
    icon: Clock,
    title: "Restam apenas 3 dias de acesso gratuito",
    description: `O tempo está passando! Aproveite ${desconto} de desconto exclusivo no Academy antes que seu acesso expire.`,
    bgClass: "bg-amber-600/95",
    borderClass: "border-amber-400",
  },
  "1_dia": {
    icon: AlertTriangle,
    title: "Ultimo dia de acesso gratuito",
    description: `Esta é sua ultima chance de garantir ${desconto} de desconto no Academy. Amanha seu acesso sera encerrado.`,
    bgClass: "bg-red-600/95",
    borderClass: "border-red-400",
  },
};
```

---

## Alterações na Edge Function

### Arquivo: `supabase/functions/process-visitor-expirations/index.ts`

**Mudanças:**
1. Remover emojis das notificações do sistema
2. Adicionar verificação de duplicidade antes de expirar
3. Mensagens mais profissionais

### Notificações Atualizadas:

```typescript
// Linha 103-108: Títulos sem emojis
titulo: notice.type === "1_dia" 
  ? "Ultimo dia de acesso gratuito" 
  : notice.type === "3_dias"
  ? "Restam 3 dias de acesso gratuito"
  : "Seu acesso gratuito expira em 7 dias",
mensagem: `Garanta ${isEngaged ? "15%" : "12%"} de desconto no Academy com o cupom ${isEngaged ? "Academy15" : "Academy12"}. Aproveite essa oportunidade exclusiva!`,
```

### Verificação de Duplicidade:

```typescript
// Antes de marcar como expirado, verificar se já é mentorado
const { data: jaMentorado } = await supabase
  .from("profiles")
  .select("id, plano_mentoria")
  .ilike("email", visitante.email)
  .eq("is_visitante", false)
  .eq("conta_ativa", true)
  .neq("id", visitante.id)
  .maybeSingle();

if (jaMentorado) {
  // Converter visitante automaticamente (já é mentorado por outra conta)
  await supabase
    .from("profiles")
    .update({ 
      is_visitante: false,
      data_conversao: new Date().toISOString(),
      acesso_expirado: false
    })
    .eq("id", visitante.id);
  
  results.convertidos_automatico = (results.convertidos_automatico || 0) + 1;
  continue; // Não processar expiração
}
```

---

## Resumo dos Arquivos

| Arquivo | Alteração |
|---------|-----------|
| `src/components/shared/VisitorExpirationNotice.tsx` | Remover emojis, melhorar textos |
| `supabase/functions/process-visitor-expirations/index.ts` | Remover emojis, adicionar verificação de duplicidade |

---

## Mensagens Finais por Tipo de Notificação

### 7 Dias Antes

| Campo | Valor |
|-------|-------|
| **Título** | Seu acesso gratuito expira em 7 dias |
| **Descrição (12%)** | Você aproveitou bem a comunidade! Garanta 12% de desconto exclusivo no Academy e continue sua jornada de aprendizado em IA. |
| **Descrição (15%)** | Você aproveitou bem a comunidade! Garanta 15% de desconto exclusivo no Academy e continue sua jornada de aprendizado em IA. |
| **Cor** | Verde (aplicada-green) |

### 3 Dias Antes

| Campo | Valor |
|-------|-------|
| **Título** | Restam apenas 3 dias de acesso gratuito |
| **Descrição (12%)** | O tempo está passando! Aproveite 12% de desconto exclusivo no Academy antes que seu acesso expire. |
| **Descrição (15%)** | O tempo está passando! Aproveite 15% de desconto exclusivo no Academy antes que seu acesso expire. |
| **Cor** | Amarelo/Laranja (amber) |

### 1 Dia Antes

| Campo | Valor |
|-------|-------|
| **Título** | Ultimo dia de acesso gratuito |
| **Descrição (12%)** | Esta é sua ultima chance de garantir 12% de desconto no Academy. Amanha seu acesso sera encerrado. |
| **Descrição (15%)** | Esta é sua ultima chance de garantir 15% de desconto no Academy. Amanha seu acesso sera encerrado. |
| **Cor** | Vermelho (red) |

---

## Fluxo Visual do Popup

```text
┌─────────────────────────────────────────────────────────────────┐
│  [X]                                                            │
│  ┌─────┐                                                        │
│  │ 🎁  │  Seu acesso gratuito expira em 7 dias                 │
│  └─────┘                                                        │
│         Você aproveitou bem a comunidade! Garanta 15% de       │
│         desconto exclusivo no Academy...                        │
│                                                                  │
│         Cupom: [ Academy15 ]                                    │
│                                                                  │
│         [ Copiar ]  [ Conhecer Academy → ]                      │
└─────────────────────────────────────────────────────────────────┘
```

