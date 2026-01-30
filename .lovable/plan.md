

# Redesign da Tela de Login - Versão Ajustada

## Visão Geral

Layout com fundo animado, header limpo apenas com navegação, e formulário centralizado com sub-abas discretas para alternar entre Login e Criar Conta.

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│  [Logo IAplicada]                    Sobre    Serviços                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│                            ·  ·  ·  ·  ·  ·  ·                                  │
│                         ·  ·  ·  ·  ·  ·  ·  ·  ·                               │
│                                                                                  │
│                        Bem Vindo Aplicado                                        │
│                         acesse e aplique                                         │
│                                                                                  │
│                   ┌──────────────────────────────┐                              │
│                   │  [Entrar]  [Criar Conta]     │  ← sub-abas discretas        │
│                   ├──────────────────────────────┤                              │
│                   │                              │                              │
│                   │   Email                      │                              │
│                   │   ________________________   │                              │
│                   │                              │                              │
│                   │   Senha                      │                              │
│                   │   ________________________   │                              │
│                   │                              │                              │
│                   │   [      Acessar       ]     │                              │
│                   │                              │                              │
│                   │     Esqueceu a senha?        │                              │
│                   └──────────────────────────────┘                              │
│                                                                                  │
│         Ao continuar, você concorda com Termos e Privacidade                    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Estrutura

### Header (Limpo)
- Logo IAplicada à esquerda
- Links "Sobre" e "Serviços" à direita
- **SEM** botões de login/criar conta no header

### Card Central
- Título: "Bem Vindo Aplicado"
- Subtítulo: "acesse e aplique"
- Sub-abas discretas: **Entrar** | **Criar Conta**
- Formulário correspondente à aba selecionada
- Começa em "Entrar" por padrão

---

## Fluxo de Abas

| Aba Selecionada | Formulário Exibido |
|-----------------|-------------------|
| **Entrar** (padrão) | Email + Senha + Botão "Acessar" + Link "Esqueceu a senha?" |
| **Criar Conta** | Nome + Email + Telefone + Senha + Botão "Criar conta grátis" |

---

## Arquivos a Criar

| Arquivo | Propósito |
|---------|-----------|
| `src/components/auth/AuthHeader.tsx` | Header com logo e links (Sobre, Serviços) |
| `src/components/auth/AnimatedBackground.tsx` | Fundo com padrão de pontos animado |
| `src/components/auth/LoginForm.tsx` | Formulário de login (email + senha) |
| `src/components/auth/SignupForm.tsx` | Formulário de cadastro completo |

## Arquivos a Modificar

| Arquivo | Mudanças |
|---------|----------|
| `src/pages/Auth.tsx` | Refatorar para novo layout com sub-abas no card |

## Arquivos a Remover

| Arquivo | Motivo |
|---------|--------|
| `src/components/auth/AnimatedLogo.tsx` | Substituído pelo novo background |
| `src/components/auth/FloatingTestimonial.tsx` | Não faz parte do novo design |

---

## Design Visual

### Header
```text
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo]                                          Sobre   Serviços   │
└─────────────────────────────────────────────────────────────────────┘

- Logo: /logo-marca-completa-clara.png (horizontal, branca)
- Links: text-white/60 hover:text-white, fonte média
- Fundo: transparente (header fixo sobre o background animado)
```

### Card Central com Sub-abas
```text
┌────────────────────────────────────────┐
│     [Entrar]     [Criar Conta]         │  ← sub-abas discretas
├────────────────────────────────────────┤
│                                        │
│   Campo email...                       │
│   Campo senha...                       │
│                                        │
│   [ Botão de ação ]                    │
│                                        │
└────────────────────────────────────────┘

Sub-abas:
- Estilo: underline ou pill discreto
- Aba ativa: texto branco, indicador sutil (linha ou fundo leve)
- Aba inativa: texto white/50
- Transição suave entre abas
```

### Background Animado
- Base: #0a0a0a (preto profundo)
- Padrão de pontos: radial-gradient com pontos brancos semi-transparentes
- Grid de 30x30px ou similar
- Efeito de brilho/gradiente sutil no centro

---

## Seção Técnica

### AuthHeader.tsx

```typescript
export function AuthHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <img 
          src="/logo-marca-completa-clara.png" 
          alt="IAplicada" 
          className="h-8" 
        />
        
        {/* Links de navegação */}
        <nav className="flex items-center gap-8">
          <a href="/aplique" className="text-white/60 hover:text-white transition-colors">
            Sobre
          </a>
          <a href="/avance" className="text-white/60 hover:text-white transition-colors">
            Serviços
          </a>
        </nav>
      </div>
    </header>
  );
}
```

### Auth.tsx - Estrutura Principal

```typescript
export default function Auth() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  
  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <AuthHeader />
      
      <main className="flex-1 flex items-center justify-center px-6 pt-20">
        <div className="w-full max-w-md text-center">
          {/* Título */}
          <h1 className="text-4xl font-bold text-white mb-2">
            Bem Vindo Aplicado
          </h1>
          <p className="text-white/60 mb-8">
            acesse e aplique
          </p>
          
          {/* Card com sub-abas */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            {/* Sub-abas discretas */}
            <div className="flex justify-center gap-6 mb-6 border-b border-white/10 pb-4">
              <button
                onClick={() => setActiveTab("login")}
                className={cn(
                  "text-sm font-medium transition-colors pb-2 border-b-2",
                  activeTab === "login" 
                    ? "text-white border-[#9EB038]" 
                    : "text-white/50 border-transparent hover:text-white/70"
                )}
              >
                Entrar
              </button>
              <button
                onClick={() => setActiveTab("signup")}
                className={cn(
                  "text-sm font-medium transition-colors pb-2 border-b-2",
                  activeTab === "signup" 
                    ? "text-white border-[#9EB038]" 
                    : "text-white/50 border-transparent hover:text-white/70"
                )}
              >
                Criar Conta
              </button>
            </div>
            
            {/* Formulário */}
            {activeTab === "login" ? <LoginForm /> : <SignupForm />}
          </div>
          
          {/* Termos */}
          <p className="text-xs text-white/40 mt-6">
            Ao continuar, você concorda com nossos{" "}
            <a href="/termos-uso" className="text-[#9EB038]">Termos</a> e{" "}
            <a href="/politica-privacidade" className="text-[#9EB038]">Privacidade</a>
          </p>
        </div>
      </main>
    </div>
  );
}
```

### Formulários

**LoginForm.tsx:**
- Email
- Senha (com toggle de visibilidade)
- Botão "Acessar"
- Link "Esqueceu a senha?" (abre modal existente)

**SignupForm.tsx:**
- Nome Completo
- Email
- Telefone
- Senha
- Botão "Criar conta grátis"

---

## Responsividade

| Breakpoint | Comportamento |
|------------|---------------|
| Desktop | Layout completo, header com links |
| Mobile | Links podem ficar em menu hambúrguer ou empilhados |

---

## Resumo

| Elemento | Posição |
|----------|---------|
| Logo | Header, esquerda |
| Sobre / Serviços | Header, direita |
| Entrar / Criar Conta | Sub-abas dentro do card central |
| Formulário | Card central, abaixo das sub-abas |
| Background | Tela cheia, padrão de pontos animado |

