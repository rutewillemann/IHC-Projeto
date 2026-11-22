# Portal Conexão Solidária

Projeto semestral da disciplina **Interação Humano-Computador (IHC)** — Faculdade de Computação e Informática (FCI), **Universidade Presbiteriana Mackenzie**.

**Tema:** ODS 01 — Erradicação da Pobreza  
**Docente:** Profa. Dra. Valéria Farinazzo Martins  

## Integrantes
- **Ilca Maria Pereira da Luz** — RA: 10444474
- **Rute Willemann** — RA: 10436781
- **Vinícius Pereira Rodrigues** — RA: 10729470

## Acesso ao Site
Após ativar o GitHub Pages neste repositório, o portal ficará disponível em:  
[https://rutewillemann.github.io/IHC-Projeto/](https://rutewillemann.github.io/IHC-Projeto/)

## Sobre o Projeto
O **Portal Conexão Solidária** é um site responsivo desenvolvido para facilitar o acesso imediato a serviços essenciais gratuitos (alimentação, moradia/acolhimento, documentação, saúde, vestuário e apoio social), conectando pessoas em situação de vulnerabilidade a equipamentos públicos (Bom Prato, CRAS, CREAS, UBS, Descomplica SP) e ONGs mais próximas.

## Princípios de IHC e Usabilidade Aplicados
- **Baixo letramento digital e baixa carga cognitiva:** navegação 100% visual por botões grandes e ícones intuitivos, sem formulários extensos ou campos de digitação obrigatórios.
- **Mobile-first e internet limitada:** desenvolvido em HTML, CSS e JavaScript puros, sem frameworks pesados nem fontes externas, garantindo carregamento rápido em smartphones de entrada e dados móveis pré-pagos.
- **Proximidade real (Haversine):** ordenação automática do ponto de apoio mais próximo ao mais distante a partir do GPS (com alternativa manual por região de São Paulo).
- **Prevenção de erros (Heurísticas de Nielsen):** selos de alto contraste indicando `ABERTO AGORA` ou `FECHADO AGORA` e alerta explícito na tela de detalhes para evitar deslocamentos desnecessários a pé.
- **Acessibilidade (WCAG AAA):** ajuste de tamanho de fonte (`A+`), 3 modos de contraste (Padrão, Escuro e Amarelo/Preto), leitura opcional em voz alta (`pt-BR`) e atalho direto para ligação telefônica (`tel:`).
- **Simulador de horário:** seletor discreto no rodapé para demonstração do status de funcionamento durante apresentações acadêmicas.

## Estrutura de Arquivos
```text
IHC-Projeto/
├── index.html      # Estrutura semantica das telas e icones SVG
├── css/
│   └── style.css   # Layout responsivo mobile-first e temas de alto contraste
├── js/
│   ├── data.js     # Base de categorias, regioes e 26 pontos de apoio de SP
│   └── app.js      # Navegacao, GPS, calculo de distancia e acessibilidade
└── README.md       # Documentacao do projeto
```
