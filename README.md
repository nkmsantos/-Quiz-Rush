# Quiz Rush

Um quiz interativo construído com HTML, CSS e JavaScript puro, com mecânicas de jogo que vão além do quiz tradicional: sistema de vidas, combo de acertos, cronômetro por pergunta, power-ups estratégicos e ranking local.

## Sobre o projeto

Responda perguntas de conhecimentos gerais contra o relógio. Cada acerto seguido aumenta seu combo e multiplica os pontos ganhos, mas cuidado: errar ou deixar o tempo acabar custa uma vida. Quando as vidas zeram, o jogo termina. Use os power-ups com sabedoria para escapar de perguntas difíceis e manter sua sequência viva.

## Funcionalidades

- Sistema de vidas com barra de HP visual
- Combo de acertos que multiplica a pontuação
- Cronômetro de 10 segundos por pergunta
- Pontuação variável de acordo com a dificuldade da pergunta e a velocidade da resposta
- Power-ups: pular pergunta e eliminar duas alternativas erradas (50/50)
- Efeitos visuais de feedback (tela treme ao errar, brilho ao emplacar um combo alto)
- Sons sintetizados via Web Audio API, sem arquivos externos
- Ranking local salvo no navegador (localStorage) com as 5 melhores pontuações
- Suporte a atalhos de teclado (teclas 1 a 4) para responder sem usar o mouse
- Totalmente responsivo

## Tecnologias utilizadas

HTML5, CSS3 (com glassmorphism, gradientes e animações) e JavaScript puro (sem frameworks ou bibliotecas externas).

## Como jogar

Basta abrir o arquivo `index.html` no navegador. Digite seu nome, clique em Começar e responda as perguntas dentro do tempo. Você tem 3 vidas e dois power-ups disponíveis por partida, use-os no momento certo.

## Como rodar localmente

Clone o repositório e abra o `index.html` diretamente no navegador, ou utilize uma extensão como Live Server para recarregamento automático durante o desenvolvimento.

\`\`\`bash
git clone https://github.com/seu-usuario/quiz-rush.git
cd quiz-rush
\`\`\`

## Estrutura do projeto

\`\`\`
quiz-rush/
├── index.html
├── style.css
└── script.js
\`\`\`

## Próximos passos

Ideias para evoluir o projeto: seleção de dificuldade antes de começar, categorias de perguntas, mais power-ups, efeitos sonoros customizados e modo multiplayer local.
