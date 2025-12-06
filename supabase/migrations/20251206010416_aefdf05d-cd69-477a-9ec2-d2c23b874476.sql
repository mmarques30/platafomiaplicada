
-- Atualizar a pesquisa 'formulario-aplica' com as perguntas corretas
UPDATE pesquisas 
SET perguntas = '[
  {
    "secao": 0,
    "titulo": "Visão de Carreira",
    "objetivo": "Entender quais os sonhos e objetivos da pessoa de forma mais geral",
    "perguntas": [
      {
        "id": "visao_carreira",
        "texto": "Qual é a sua visão de carreira para os próximos 5 anos?",
        "tipo": "texto_longo",
        "obrigatorio": true
      },
      {
        "id": "competencias_essenciais",
        "texto": "Quais competências e habilidades você considera essenciais desenvolver para alcançar essa visão?",
        "tipo": "texto_longo",
        "obrigatorio": true
      },
      {
        "id": "areas_referencia",
        "texto": "Em quais áreas você acredita que precisa se tornar uma referência ao longo dos próximos cinco anos?",
        "tipo": "texto_longo",
        "obrigatorio": true
      }
    ]
  },
  {
    "secao": 1,
    "titulo": "Perfil Demográfico e Básico",
    "objetivo": "Categorizar os compradores e identificar tendências de público",
    "perguntas": [
      {
        "id": "genero",
        "texto": "Como você se identifica em relação ao gênero?",
        "tipo": "multipla_escolha",
        "opcoes": ["Masculino", "Feminino", "Prefiro não declarar"],
        "obrigatorio": true
      },
      {
        "id": "idade",
        "texto": "Qual é a sua idade?",
        "tipo": "texto_curto",
        "obrigatorio": true,
        "placeholder": "Ex: 32"
      },
      {
        "id": "estado_civil",
        "texto": "Qual é o seu estado civil?",
        "tipo": "multipla_escolha",
        "opcoes": ["Solteiro(a)", "Casado(a)", "Prefiro não declarar"],
        "obrigatorio": true
      },
      {
        "id": "cidade_estado",
        "texto": "Qual sua cidade/estado?",
        "tipo": "texto_curto",
        "obrigatorio": true,
        "placeholder": "Ex: São Paulo/SP"
      },
      {
        "id": "formacao",
        "texto": "Qual sua formação acadêmica?",
        "tipo": "multipla_escolha",
        "opcoes": ["Ensino Médio", "Técnico", "Superior incompleto", "Superior completo", "Pós-graduação", "Mestrado / Doutorado"],
        "obrigatorio": true
      },
      {
        "id": "faixa_renda",
        "texto": "Qual é a sua faixa de renda mensal?",
        "tipo": "multipla_escolha",
        "opcoes": ["R$ 1.000 a R$ 3.000", "R$ 3.001 a R$ 6.000", "R$ 6.001 a R$ 12.000", "R$ 12.001 a R$ 20.000", "Acima de R$ 20.000"],
        "obrigatorio": true
      }
    ]
  },
  {
    "secao": 2,
    "titulo": "Situação Profissional e Contexto",
    "objetivo": "Descobrir a área, maturidade e momento profissional",
    "perguntas": [
      {
        "id": "situacao_atual",
        "texto": "Qual é a sua situação atual?",
        "tipo": "multipla_escolha_outro",
        "opcoes": ["Empresário / Fundador", "CLT", "Autônomo", "Estudante"],
        "obrigatorio": true
      },
      {
        "id": "senioridade",
        "texto": "Qual o seu nível de senioridade?",
        "tipo": "multipla_escolha",
        "opcoes": ["Junior", "Pleno", "Sênior", "Liderança / Gestão"],
        "obrigatorio": true
      },
      {
        "id": "qtd_liderados",
        "texto": "Qual o número de liderados?",
        "tipo": "multipla_escolha",
        "opcoes": ["1 a 3", "3 a 5", "5 a 10", "Mais de 10"],
        "obrigatorio": false,
        "condicional": {
          "campo": "senioridade",
          "valor": "Liderança / Gestão"
        }
      },
      {
        "id": "area_atuacao",
        "texto": "Em qual área você atua?",
        "tipo": "multipla_escolha_outro",
        "opcoes": ["Tech", "Dados", "Marketing", "Vendas", "Produto", "Operações", "People / RH", "Financeiro"],
        "obrigatorio": true
      },
      {
        "id": "ultima_promocao",
        "texto": "Quando foi a sua última promoção / mérito?",
        "tipo": "multipla_escolha",
        "opcoes": ["Menos de 6 meses", "Entre 6 meses a 1 ano", "Entre 1 ano a 3 anos", "Entre 3 anos a 5 anos", "Mais de 5 anos", "Prefiro não declarar"],
        "obrigatorio": true
      },
      {
        "id": "receita_empresa",
        "texto": "Qual é a faixa de receita anual da empresa?",
        "tipo": "multipla_escolha",
        "opcoes": ["Menos de R$ 1 milhão", "Entre R$ 1 milhão e R$ 5 milhões", "Entre R$ 5 milhões e R$ 30 milhões", "Entre R$ 30 milhões e R$ 100 milhões", "Entre R$ 100 milhões e R$ 500 milhões", "Acima de R$ 500 milhões"],
        "obrigatorio": true
      }
    ]
  },
  {
    "secao": 3,
    "titulo": "Objetivos",
    "objetivo": "Entender o porquê da compra",
    "perguntas": [
      {
        "id": "objetivos_3_meses",
        "texto": "Quais objetivos você quer atingir em até 3 meses?",
        "tipo": "texto_longo",
        "obrigatorio": true
      },
      {
        "id": "problema_resolver",
        "texto": "Que problema está tentando resolver?",
        "tipo": "texto_longo",
        "obrigatorio": true
      },
      {
        "id": "mudar_rotina",
        "texto": "O que você espera mudar na sua rotina?",
        "tipo": "texto_longo",
        "obrigatorio": true
      },
      {
        "id": "proximo_desafio",
        "texto": "Qual o seu próximo desafio como profissional?",
        "tipo": "texto_longo",
        "obrigatorio": true,
        "placeholder": "Quero te ajudar a chegar nesse próximo nível"
      },
      {
        "id": "projeto_extra_classe",
        "texto": "Qual projeto você gostaria de entregar que vai te posicionar como um profissional extra classe?",
        "tipo": "texto_longo",
        "obrigatorio": true,
        "placeholder": "Quero entender como consigo te ajudar mais especificamente"
      },
      {
        "id": "motivo_aprender",
        "texto": "Por qual motivo você decidiu aprender? (Escolha a principal)",
        "tipo": "multipla_escolha_outro",
        "opcoes": ["Evolução profissional", "Aumentar produtividade", "Automação de processos", "Criar um negócio usando IA", "Recolocação no mercado"],
        "obrigatorio": true
      }
    ]
  },
  {
    "secao": 4,
    "titulo": "Maturidade em Inteligência Artificial",
    "objetivo": "Medir o nível técnico",
    "perguntas": [
      {
        "id": "conhecimento_ia",
        "texto": "Como você avalia seu conhecimento atual em IA?",
        "tipo": "multipla_escolha",
        "opcoes": ["Iniciante total (não sei nada)", "Intermediário (já usei algumas ferramentas)", "Avançado (já crio fluxos, automações ou modelos)"],
        "obrigatorio": true
      }
    ]
  },
  {
    "secao": 5,
    "titulo": "Principais Dores e Barreiras",
    "objetivo": "Descobrir bloqueios reais e motivos de não evolução",
    "perguntas": [
      {
        "id": "dificuldades_ia",
        "texto": "Quais são suas maiores dificuldades com IA hoje?",
        "tipo": "texto_longo",
        "obrigatorio": true
      }
    ]
  },
  {
    "secao": 7,
    "titulo": "Comportamento de Compra",
    "objetivo": "Descobrir o canal de aquisição e fatores de decisão",
    "perguntas": [
      {
        "id": "onde_conheceu",
        "texto": "Onde me viu pela primeira vez?",
        "tipo": "multipla_escolha_outro",
        "opcoes": ["Instagram", "TikTok", "YouTube", "Indicação"],
        "obrigatorio": true
      },
      {
        "id": "convenceu_comprar",
        "texto": "O que te convenceu a comprar?",
        "tipo": "multipla_escolha_outro",
        "opcoes": ["Preço", "Conteúdo / currículo", "Confiança no criador", "Facilitou começar", "Transformação prometida"],
        "obrigatorio": true
      },
      {
        "id": "gatilho_compra",
        "texto": "Houve um gatilho que motivou a compra?",
        "tipo": "texto_longo",
        "obrigatorio": true
      }
    ]
  },
  {
    "secao": 8,
    "titulo": "O que esperam de você (Promessa / Transformação)",
    "objetivo": "Gerar roadmap de melhoria e novas entregas",
    "perguntas": [
      {
        "id": "transformacao_real",
        "texto": "O que seria uma transformação REAL na sua vida após a mentoria / aulas?",
        "tipo": "texto_longo",
        "obrigatorio": true
      },
      {
        "id": "temas_futuro",
        "texto": "Quais temas você gostaria de ver no futuro?",
        "tipo": "texto_longo",
        "obrigatorio": true
      }
    ]
  }
]'::jsonb,
updated_at = now()
WHERE slug = 'formulario-aplica';
