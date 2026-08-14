document.addEventListener("DOMContentLoaded", function () {

  var perguntas = [
    { pergunta: "Qual é o maior planeta do Sistema Solar?", opcoes: ["Terra", "Júpiter", "Saturno", "Marte"], correta: 1, dificuldade: 1 },
    { pergunta: "Em que ano o homem pisou na Lua pela primeira vez?", opcoes: ["1965", "1969", "1972", "1959"], correta: 1, dificuldade: 2 },
    { pergunta: "Qual é o metal líquido à temperatura ambiente?", opcoes: ["Ferro", "Alumínio", "Mercúrio", "Ouro"], correta: 2, dificuldade: 2 },
    { pergunta: "Quantos ossos tem o corpo humano adulto?", opcoes: ["186", "206", "226", "246"], correta: 1, dificuldade: 2 },
    { pergunta: "Qual desses idiomas tem mais falantes nativos no mundo?", opcoes: ["Inglês", "Espanhol", "Mandarim", "Hindi"], correta: 2, dificuldade: 1 },
    { pergunta: "Qual é o oceano mais profundo do mundo?", opcoes: ["Atlântico", "Índico", "Ártico", "Pacífico"], correta: 3, dificuldade: 1 },
    { pergunta: "Quem pintou a Mona Lisa?", opcoes: ["Michelangelo", "Da Vinci", "Van Gogh", "Picasso"], correta: 1, dificuldade: 1 },
    { pergunta: "Qual é o menor país do mundo?", opcoes: ["Mônaco", "San Marino", "Vaticano", "Liechtenstein"], correta: 2, dificuldade: 3 },
    { pergunta: "Quantos corações tem um polvo?", opcoes: ["1", "2", "3", "4"], correta: 2, dificuldade: 3 },
    { pergunta: "Qual elemento químico tem o símbolo 'Au'?", opcoes: ["Prata", "Alumínio", "Ouro", "Argônio"], correta: 2, dificuldade: 2 },
    { pergunta: "Em que continente fica o Egito?", opcoes: ["Ásia", "África", "Oriente Médio", "Europa"], correta: 1, dificuldade: 1 },
    { pergunta: "Qual é a moeda oficial do Japão?", opcoes: ["Won", "Yuan", "Iene", "Dólar"], correta: 2, dificuldade: 1 }
  ];

  var TEMPO_POR_PERGUNTA = 10;
  var TOTAL_PERGUNTAS = 10;
  var VIDAS_INICIAIS = 3;
  var STREAK_PARA_BRILHO = 3;

  var perguntasDaRodada = [];
  var indiceAtual = 0;
  var pontuacao = 0;
  var vidas = VIDAS_INICIAIS;
  var combo = 0;
  var maiorCombo = 0;
  var acertos = 0;
  var travado = false;
  var tempoRestante = TEMPO_POR_PERGUNTA;
  var intervaloTempo = null;
  var nomeJogador = "Jogador";
  var usouPular = false;
  var usou5050 = false;
  var audioCtx = null;

  var container = document.getElementById("container");

  var telaInicial = document.getElementById("tela-inicial");
  var telaQuiz = document.getElementById("tela-quiz");
  var telaResultado = document.getElementById("tela-resultado");
  var telaDerrota = document.getElementById("tela-derrota");

  var inputNome = document.getElementById("input-nome");
  var btnIniciar = document.getElementById("btn-iniciar");
  var btnReiniciar = document.getElementById("btn-reiniciar");
  var btnReiniciarDerrota = document.getElementById("btn-reiniciar-derrota");
  var btnPular = document.getElementById("btn-pular");
  var btn5050 = document.getElementById("btn-5050");

  var perguntaTexto = document.getElementById("pergunta-texto");
  var opcoesContainer = document.getElementById("opcoes");
  var progressoPreenchido = document.getElementById("progresso-preenchido");
  var contadorPerguntas = document.getElementById("contador-perguntas");
  var pontuacaoParcial = document.getElementById("pontuacao-parcial");
  var hpPreenchido = document.getElementById("hp-preenchido");
  var comboTexto = document.getElementById("combo-texto");
  var tempoPreenchido = document.getElementById("tempo-preenchido");
  var feedbackFlutuante = document.getElementById("feedback-flutuante");
  var rankingLista = document.getElementById("ranking-lista");

  var tituloResultado = document.getElementById("titulo-resultado");
  var mensagemResultado = document.getElementById("mensagem-resultado");
  var scoreFinal = document.getElementById("score-final");
  var scoreFinalDerrota = document.getElementById("score-final-derrota");
  var recordeTexto = document.getElementById("recorde-texto");
  var statAcertos = document.getElementById("stat-acertos");
  var statCombo = document.getElementById("stat-combo");
  var statVidas = document.getElementById("stat-vidas");

  function tocarSom(tipo) {
    try {
      if (!audioCtx) {
        var AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioCtx();
      }
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (tipo === "acerto") {
        osc.frequency.setValueAtTime(523, audioCtx.currentTime);
        osc.frequency.setValueAtTime(784, audioCtx.currentTime + 0.08);
      } else if (tipo === "erro") {
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.setValueAtTime(120, audioCtx.currentTime + 0.1);
      } else if (tipo === "power") {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(660, audioCtx.currentTime + 0.06);
      }

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      /* ambiente sem suporte a áudio, seguimos sem som */
    }
  }

  function embaralhar(array) {
    var copia = array.slice();
    for (var i = copia.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = copia[i];
      copia[i] = copia[j];
      copia[j] = temp;
    }
    return copia;
  }

  function trocarTela(tela) {
    var todas = document.querySelectorAll(".tela");
    for (var i = 0; i < todas.length; i++) {
      todas[i].classList.remove("ativa");
    }
    tela.classList.add("ativa");
  }

  function carregarRanking() {
    try {
      var dados = JSON.parse(localStorage.getItem("quiz-ranking") || "[]");
      if (!Array.isArray(dados)) return [];
      return dados;
    } catch (e) {
      return [];
    }
  }

  function salvarRanking(nome, pontos) {
    var dados = carregarRanking();
    dados.push({ nome: nome, pontos: pontos });
    dados.sort(function (a, b) { return b.pontos - a.pontos; });
    var top5 = dados.slice(0, 5);
    try {
      localStorage.setItem("quiz-ranking", JSON.stringify(top5));
    } catch (e) {}
    return top5;
  }

  function renderizarRanking() {
    var dados = carregarRanking();
    if (dados.length === 0) {
      rankingLista.innerHTML = "";
      return;
    }
    var html = '<div class="ranking-titulo">Melhores pontuações</div>';
    for (var i = 0; i < dados.length; i++) {
      html += '<div class="ranking-item"><span>' + (i + 1) + '. ' + dados[i].nome + '</span><span>' + dados[i].pontos + ' pts</span></div>';
    }
    rankingLista.innerHTML = html;
  }

  function iniciarQuiz() {
    nomeJogador = inputNome.value.trim() || "Jogador";

    perguntasDaRodada = embaralhar(perguntas).slice(0, TOTAL_PERGUNTAS);
    indiceAtual = 0;
    pontuacao = 0;
    vidas = VIDAS_INICIAIS;
    combo = 0;
    maiorCombo = 0;
    acertos = 0;
    usouPular = false;
    usou5050 = false;

    btnPular.disabled = false;
    btn5050.disabled = false;

    atualizarHP();
    atualizarCombo();
    container.classList.remove("streak-alto");
    trocarTela(telaQuiz);
    mostrarPergunta();
  }

  function atualizarHP() {
    var porcentagem = (vidas / VIDAS_INICIAIS) * 100;
    hpPreenchido.style.width = porcentagem + "%";
    hpPreenchido.classList.remove("medio", "baixo");
    if (vidas === 2) hpPreenchido.classList.add("medio");
    if (vidas <= 1) hpPreenchido.classList.add("baixo");
  }

  function atualizarCombo() {
    comboTexto.textContent = "Combo x" + combo;
    comboTexto.classList.remove("ativo");
    void comboTexto.offsetWidth;
    comboTexto.classList.add("ativo");

    if (combo >= STREAK_PARA_BRILHO) {
      container.classList.add("streak-alto");
    } else {
      container.classList.remove("streak-alto");
    }
  }

  function mostrarPergunta() {
    travado = false;
    var atual = perguntasDaRodada[indiceAtual];
    var teclas = ["1", "2", "3", "4"];

    perguntaTexto.textContent = atual.pergunta;
    opcoesContainer.innerHTML = "";

    atual.opcoes.forEach(function (opcao, index) {
      var botao = document.createElement("button");
      botao.className = "opcao";
      botao.innerHTML = '<span class="tecla">' + teclas[index] + '</span><span>' + opcao + '</span>';
      botao.addEventListener("click", function () {
        selecionarOpcao(index, botao);
      });
      opcoesContainer.appendChild(botao);
    });

    var progresso = (indiceAtual / perguntasDaRodada.length) * 100;
    progressoPreenchido.style.width = progresso + "%";
    contadorPerguntas.textContent = (indiceAtual + 1) + " / " + perguntasDaRodada.length;
    pontuacaoParcial.textContent = pontuacao;

    iniciarCronometro();
  }

  function iniciarCronometro() {
    clearInterval(intervaloTempo);
    tempoRestante = TEMPO_POR_PERGUNTA;
    tempoPreenchido.style.width = "100%";

    var inicio = Date.now();

    intervaloTempo = setInterval(function () {
      var passado = (Date.now() - inicio) / 1000;
      tempoRestante = TEMPO_POR_PERGUNTA - passado;

      var porcentagem = Math.max(0, (tempoRestante / TEMPO_POR_PERGUNTA) * 100);
      tempoPreenchido.style.width = porcentagem + "%";

      if (tempoRestante <= 0 && !travado) {
        clearInterval(intervaloTempo);
        tempoAcabou();
      }
    }, 50);
  }

  function tempoAcabou() {
    travado = true;
    var atual = perguntasDaRodada[indiceAtual];
    var botoes = document.querySelectorAll(".opcao");

    for (var i = 0; i < botoes.length; i++) {
      botoes[i].classList.add("desabilitada");
    }
    botoes[atual.correta].classList.add("correta");

    perderVida();
    mostrarFeedback("Tempo esgotado", "#ef4444");
    tocarSom("erro");

    avancar();
  }

  function selecionarOpcao(index, botaoClicado) {
    if (travado) return;
    travado = true;
    clearInterval(intervaloTempo);

    var atual = perguntasDaRodada[indiceAtual];
    var botoes = document.querySelectorAll(".opcao");
    for (var i = 0; i < botoes.length; i++) {
      botoes[i].classList.add("desabilitada");
    }

    if (index === atual.correta) {
      botaoClicado.classList.add("correta");
      acertar(atual);
    } else {
      botaoClicado.classList.add("errada");
      botoes[atual.correta].classList.add("correta");
      errar();
    }

    avancar();
  }

  function acertar(atual) {
    combo++;
    if (combo > maiorCombo) maiorCombo = combo;
    acertos++;

    var basePorDificuldade = { 1: 10, 2: 20, 3: 30 };
    var base = basePorDificuldade[atual.dificuldade] || 10;

    var bonusVelocidade = Math.round((tempoRestante / TEMPO_POR_PERGUNTA) * 10);
    var multiplicadorCombo = 1 + (combo - 1) * 0.2;

    var ganho = Math.round((base + bonusVelocidade) * multiplicadorCombo);
    pontuacao += ganho;

    pontuacaoParcial.textContent = pontuacao;
    atualizarCombo();
    mostrarFeedback("+" + ganho, "#22c55e");
    tocarSom("acerto");
  }

  function errar() {
    combo = 0;
    atualizarCombo();
    perderVida();
    mostrarFeedback("Errou", "#ef4444");
    tocarSom("erro");
    container.classList.add("tremer");
    setTimeout(function () {
      container.classList.remove("tremer");
    }, 350);
  }

  function perderVida() {
    vidas--;
    atualizarHP();
  }

  function mostrarFeedback(texto, cor) {
    feedbackFlutuante.textContent = texto;
    feedbackFlutuante.style.color = cor;
    feedbackFlutuante.classList.remove("mostrar");
    void feedbackFlutuante.offsetWidth;
    feedbackFlutuante.classList.add("mostrar");
  }

  function avancar() {
    setTimeout(function () {
      if (vidas <= 0) {
        mostrarDerrota();
        return;
      }

      indiceAtual++;
      if (indiceAtual < perguntasDaRodada.length) {
        mostrarPergunta();
      } else {
        mostrarResultado();
      }
    }, 1300);
  }

  function usarPular() {
    if (usouPular || travado) return;
    usouPular = true;
    btnPular.disabled = true;
    clearInterval(intervaloTempo);
    tocarSom("power");
    mostrarFeedback("Pergunta pulada", "#60a5fa");

    travado = true;
    setTimeout(function () {
      indiceAtual++;
      if (indiceAtual < perguntasDaRodada.length) {
        mostrarPergunta();
      } else {
        mostrarResultado();
      }
    }, 700);
  }

  function usar5050() {
    if (usou5050 || travado) return;
    usou5050 = true;
    btn5050.disabled = true;
    tocarSom("power");

    var atual = perguntasDaRodada[indiceAtual];
    var botoes = document.querySelectorAll(".opcao");

    var indicesErrados = [];
    for (var i = 0; i < botoes.length; i++) {
      if (i !== atual.correta) indicesErrados.push(i);
    }

    var paraEliminar = embaralhar(indicesErrados).slice(0, 2);
    for (var j = 0; j < paraEliminar.length; j++) {
      botoes[paraEliminar[j]].classList.add("eliminada");
    }
  }

  function mostrarResultado() {
    clearInterval(intervaloTempo);
    progressoPreenchido.style.width = "100%";
    trocarTela(telaResultado);

    var total = perguntasDaRodada.length;
    scoreFinal.textContent = pontuacao + " pts";
    statAcertos.textContent = acertos + "/" + total;
    statCombo.textContent = maiorCombo;
    statVidas.textContent = vidas;

    var porcentagem = acertos / total;

    if (porcentagem === 1) {
      tituloResultado.textContent = "Perfeito";
      mensagemResultado.textContent = "Você acertou todas. Desempenho impecável.";
    } else if (porcentagem >= 0.6) {
      tituloResultado.textContent = "Muito bom";
      mensagemResultado.textContent = "Você tem um bom conhecimento sobre o assunto.";
    } else if (porcentagem >= 0.3) {
      tituloResultado.textContent = "Nada mal";
      mensagemResultado.textContent = "Dá pra melhorar, mas você foi bem.";
    } else {
      tituloResultado.textContent = "Pode tentar de novo";
      mensagemResultado.textContent = "Que tal estudar um pouco mais e tentar novamente?";
    }

    var novoRanking = salvarRanking(nomeJogador, pontuacao);
    var recordeAtual = novoRanking.length > 0 ? novoRanking[0].pontos : 0;
    recordeTexto.textContent = pontuacao === recordeAtual
      ? "Novo recorde no ranking local"
      : "Melhor pontuação registrada: " + recordeAtual + " pts";
  }

  function mostrarDerrota() {
    clearInterval(intervaloTempo);
    trocarTela(telaDerrota);
    scoreFinalDerrota.textContent = pontuacao + " pts";
    salvarRanking(nomeJogador, pontuacao);
  }

  function voltarInicio() {
    renderizarRanking();
    trocarTela(telaInicial);
  }

  document.addEventListener("keydown", function (e) {
    if (!telaQuiz.classList.contains("ativa") || travado) return;
    var mapa = { "1": 0, "2": 1, "3": 2, "4": 3 };
    if (mapa[e.key] !== undefined) {
      var botoes = document.querySelectorAll(".opcao");
      if (botoes[mapa[e.key]]) {
        selecionarOpcao(mapa[e.key], botoes[mapa[e.key]]);
      }
    }
  });

  btnIniciar.addEventListener("click", iniciarQuiz);
  btnReiniciar.addEventListener("click", voltarInicio);
  btnReiniciarDerrota.addEventListener("click", voltarInicio);
  btnPular.addEventListener("click", usarPular);
  btn5050.addEventListener("click", usar5050);

  renderizarRanking();

});