
# Plano: Redirecionamento dos botões "Saiba mais" na página de Serviços

## Objetivo
Configurar os links "Saiba mais" na página `/servicos` para:
1. **Academy**: Redirecionar para cadastro gratuito (`/auth`) se não logado, ou para `/cupons` se já tiver acesso
2. **Skills e Business**: Abrir WhatsApp para falar com especialista: `http://wa.me/5511950566101`

---

## Alterações Necessárias

### Arquivo: `src/pages/Servicos.tsx`

**Mudanças:**
1. Importar `useAuth` para verificar se usuário está logado
2. Importar `useNavigate` para navegação programática
3. Substituir os links `<a>` por botões/links com lógica condicional

**Lógica do botão Academy:**
```text
Se usuário NÃO está logado → Redireciona para /auth (com tab de signup)
Se usuário ESTÁ logado → Redireciona para /cupons
```

**Lógica dos botões Skills e Business:**
```text
Sempre → Abre WhatsApp: http://wa.me/5511950566101
```

---

## Código Final

```tsx
// Importações adicionais
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Servicos = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAcademyClick = () => {
    if (user) {
      navigate("/cupons");
    } else {
      navigate("/auth?tab=signup");
    }
  };

  const handleSpecialistClick = () => {
    window.open("http://wa.me/5511950566101", "_blank");
  };

  return (
    // ... estrutura existente
    
    // Academy - botão com lógica
    <button
      onClick={handleAcademyClick}
      className="inline-flex items-center gap-1 text-[#9EB038] hover:underline"
    >
      Saiba mais <ArrowUpRight className="w-4 h-4" />
    </button>
    
    // Skills e Business - link para WhatsApp
    <button
      onClick={handleSpecialistClick}
      className="inline-flex items-center gap-1 text-[#9EB038] hover:underline"
    >
      Falar com especialista <ArrowUpRight className="w-4 h-4" />
    </button>
  );
};
```

---

## Atualização da Página Auth (Opcional)

Para suportar o parâmetro `?tab=signup`, faremos uma pequena modificação no `Auth.tsx` para ler o parâmetro da URL e já abrir na aba de cadastro:

```tsx
import { useSearchParams } from "react-router-dom";

// Dentro do componente
const [searchParams] = useSearchParams();
const initialTab = searchParams.get("tab") === "signup" ? "signup" : "login";
const [activeTab, setActiveTab] = useState<"login" | "signup">(initialTab);
```

---

## Resumo dos Arquivos

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/Servicos.tsx` | Adicionar lógica de redirecionamento nos botões |
| `src/pages/Auth.tsx` | Ler parâmetro `?tab=signup` da URL |

---

## Fluxo do Usuário

### Cenário 1: Visitante clica em "Saiba mais" do Academy
1. Usuário não logado clica no botão
2. É redirecionado para `/auth?tab=signup`
3. Página de auth abre já na aba "Criar Conta"
4. Após cadastro, pode acessar `/cupons`

### Cenário 2: Usuário logado clica em "Saiba mais" do Academy
1. Usuário já autenticado clica no botão
2. É redirecionado diretamente para `/cupons`
3. Vê seu cupom de desconto e pode comprar

### Cenário 3: Qualquer pessoa clica em "Saiba mais" do Skills ou Business
1. Usuário clica no botão
2. Abre WhatsApp com número do especialista
3. Pode iniciar conversa diretamente

