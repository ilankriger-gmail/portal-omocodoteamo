// Script do jogo (roda no navegador). Fica como texto porque a página é servida
// como HTML puro, fora do React. Regras para editar: nada de crase nem de "${"
// aqui dentro, porque o arquivo todo é um template string.

export const CLIENTE = String.raw`
(function () {
  'use strict';

  var J = window.JOGO;
  var doc = document;
  var palco = doc.getElementById('palco');
  var mesa = doc.getElementById('mesa');   // boneco, bandejas e placar

  function $(id) { return doc.getElementById(id); }
  function cria(tag, classe, html) {
    var e = doc.createElement(tag);
    if (classe) e.className = classe;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function limita(v, a, b) { return v < a ? a : v > b ? b : v; }
  function espera(ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); }
  function reais(v) { return 'R$\u00a0' + String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function vibra(v) { try { if (navigator.vibrate) navigator.vibrate(v); } catch (e) {} }
  // Diminui a letra até o texto (um <span> dentro de "el") caber na largura.
  function encaixar(el, largura, maior, menor) {
    var f = maior, miolo = el.firstChild;
    el.style.fontSize = f + 'px';
    while (f > menor && miolo && miolo.offsetWidth > largura) { f -= 1; el.style.fontSize = f + 'px'; }
  }
  var coluna = 300;                 // largura de cada bandeja (muda com a tela)
  // Texto do canto de baixo, à esquerda.
  function dica(html) {
    var el = $('dica');
    el.innerHTML = html ? '<span>' + html + '</span>' : '';
    encaixar(el, coluna - 86, 25, 12);
  }
  // Rótulo do botão grande de baixo.
  function rotulo(texto) {
    var bt = $('conferir');
    bt.innerHTML = '<span>' + texto + '</span>';
    encaixar(bt, coluna - 44, 40, 16);
  }
  // Faixa que narra a conferência ("Fígado" + certo/errado).
  function legenda(texto, cls) {
    var el = $('legenda');
    el.hidden = false;
    el.className = 'legenda' + (cls ? ' ' + cls : '');
    el.firstChild.textContent = texto;
    encaixar(el, coluna - 44 - (cls ? 64 : 0), 40, 16);
  }

  var IC_OK = '<svg class="ic ic-ok" viewBox="0 0 24 24"><path d="M4.5 12.5l5 5L19.5 7"/></svg>';
  var IC_NO = '<svg class="ic ic-no" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  // ------------------------------------------------------------ ajustes salvos
  var PREMIOS = [50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 1000, 1500, 2000, 3000, 5000, 10000];
  var TEMPOS = [0, 30, 45, 60, 90, 120];
  var cfg = { premio: 500, nivel: 'medio', tempo: 0, som: true };

  (function () {
    try {
      var salvo = JSON.parse(localStorage.getItem('jogo-orgaos') || 'null');
      if (salvo) for (var c in cfg) if (typeof salvo[c] === typeof cfg[c]) cfg[c] = salvo[c];
    } catch (e) {}
    // Também dá para ajustar pelo endereço: ?premio=750&nivel=dificil&tempo=60
    try {
      var q = new URLSearchParams(location.search);
      var p = parseInt(q.get('premio'), 10);
      if (p > 0 && p <= 1000000) cfg.premio = p;
      var t = parseInt(q.get('tempo'), 10);
      if (t >= 0 && t <= 600) cfg.tempo = t;
      if (q.get('nivel')) cfg.nivel = q.get('nivel');
    } catch (e) {}
    if (!J.niveis.some(function (n) { return n.id === cfg.nivel; })) cfg.nivel = 'medio';
    cfg.premio = limita(Math.round(cfg.premio) || 500, 1, 1000000);
    cfg.tempo = limita(Math.round(cfg.tempo) || 0, 0, 600);
  })();

  function salvar() { try { localStorage.setItem('jogo-orgaos', JSON.stringify(cfg)); } catch (e) {} }
  function nivelAtual() { return J.niveis.filter(function (n) { return n.id === cfg.nivel; })[0]; }

  // ------------------------------------------------------------ sons (sintetizados, sem arquivos)
  var som = (function () {
    var ac = null, saida = null, chiado = null;
    function ctx() {
      if (!ac) {
        var C = window.AudioContext || window.webkitAudioContext;
        if (!C) return null;
        try { ac = new C(); } catch (e) { return null; }
        saida = ac.createGain();
        saida.gain.value = 0.55;
        saida.connect(ac.destination);
      }
      if (ac.state === 'suspended' && ac.resume) {
        try { var r = ac.resume(); if (r && r.catch) r.catch(function () {}); } catch (e) {}
      }
      return ac;
    }
    function nota(f, ini, dur, tipo, vol, fFim) {
      if (!cfg.som) return;
      var a = ctx();
      if (!a) return;
      var t = a.currentTime + (ini || 0);
      var o = a.createOscillator(), g = a.createGain();
      o.type = tipo || 'sine';
      o.frequency.setValueAtTime(f, t);
      if (fFim) o.frequency.exponentialRampToValueAtTime(fFim, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.3, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(saida);
      o.start(t);
      o.stop(t + dur + 0.05);
    }
    function ruido(ini, dur, vol, freq) {
      if (!cfg.som) return;
      var a = ctx();
      if (!a) return;
      if (!chiado) {
        chiado = a.createBuffer(1, a.sampleRate, a.sampleRate);
        var d = chiado.getChannelData(0);
        for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      var t = a.currentTime + (ini || 0);
      var s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
      s.buffer = chiado;
      fl.type = 'bandpass';
      fl.frequency.value = freq || 1800;
      fl.Q.value = 0.8;
      g.gain.setValueAtTime(vol || 0.2, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(fl);
      fl.connect(g);
      g.connect(saida);
      s.start(t);
      s.stop(t + dur + 0.05);
    }
    return {
      acorda: function () { if (cfg.som) ctx(); },
      pega: function () { nota(520, 0, 0.09, 'sine', 0.22, 820); },
      encaixe: function () { nota(330, 0, 0.11, 'triangle', 0.4, 170); ruido(0, 0.05, 0.16, 2600); },
      volta: function () { nota(420, 0, 0.16, 'sine', 0.16, 210); },
      pronto: function () { nota(784, 0, 0.14, 'triangle', 0.25); nota(1047, 0.11, 0.24, 'triangle', 0.25); },
      rufo: function (dur) { for (var t = 0; t < dur; t += 0.045) ruido(t, 0.06, 0.06 + 0.1 * t / dur, 900); },
      certo: function (n) {
        var f = 660 * Math.pow(2, Math.min(n, 14) / 12);
        nota(f, 0, 0.32, 'triangle', 0.34);
        nota(f * 1.5, 0.05, 0.36, 'sine', 0.2);
      },
      errado: function () { nota(150, 0, 0.42, 'sawtooth', 0.28, 96); nota(101, 0, 0.42, 'square', 0.16, 70); },
      vitoria: function () {
        [523, 659, 784, 1047, 784, 1047, 1319].forEach(function (f, i) { nota(f, i * 0.11, 0.3, 'triangle', 0.32); });
        [523, 659, 784, 1047].forEach(function (f) { nota(f, 0.8, 1.2, 'sine', 0.16); });
      },
      derrota: function () {
        [392, 370, 349, 311].forEach(function (f, i) {
          nota(f, i * 0.3, i === 3 ? 0.9 : 0.3, 'sawtooth', 0.16, i === 3 ? 290 : f * 0.97);
        });
      },
      bip: function (alto) { nota(alto ? 1175 : 587, 0, alto ? 0.5 : 0.16, 'square', 0.16); },
      tic: function (forte) { nota(forte ? 1400 : 1000, 0, 0.05, 'square', forte ? 0.16 : 0.1); },
      alarme: function () { for (var i = 0; i < 3; i++) nota(880, i * 0.16, 0.12, 'square', 0.2); }
    };
  })();

  // ------------------------------------------------------------ palco: sempre deitado
  // O palco tem 1000 de altura e de 1333 a 2400 de largura, e é escalado para
  // caber na tela. Celular em pé: o palco gira 90 graus, então o jogo continua
  // na horizontal mesmo com a rotação da tela travada.
  var K = 944 / J.ch;               // escala do boneco dentro do palco
  var CORPO_Y = 28, CORPO_W = J.cw * K, MARGEM = 28;
  var RAIO = 92;                    // distância máxima para a peça grudar num lugar
  var G = { W: 0, esc: 1, ox: 0, oy: 0, girar: false, vw: 0, ex: 0, ey: 0 };
  var dedo = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);

  function medir() {
    // #area é a parte útil da tela, já sem entalhe e barras do sistema
    var r = $('area').getBoundingClientRect();
    var vw = r.width, vh = r.height;
    if (!vw || !vh) return;
    var girar = dedo && vh > vw;
    var lw = girar ? vh : vw, lh = girar ? vw : vh;
    var W = limita(Math.round(1000 * lw / lh), 1333, 2400);
    var esc = Math.min(lw / W, lh / 1000);
    var ox = (lw - W * esc) / 2, oy = (lh - 1000 * esc) / 2;
    G = { W: W, esc: esc, ox: ox, oy: oy, girar: girar, vw: vw, ex: r.left, ey: r.top };
    palco.style.width = W + 'px';
    palco.style.transform = girar
      ? 'translate(' + (r.left + vw - oy) + 'px,' + (r.top + ox) + 'px) rotate(90deg) scale(' + esc + ')'
      : 'translate(' + (r.left + ox) + 'px,' + (r.top + oy) + 'px) scale(' + esc + ')';
    arrumar(false);
    ajustarTitulo();
  }

  // Posição do toque/mouse nas medidas do palco.
  function noPalco(e) {
    var cx = e.clientX - G.ex, cy = e.clientY - G.ey;
    var lx = G.girar ? cy : cx;
    var ly = G.girar ? G.vw - cx : cy;
    return { x: (lx - G.ox) / G.esc, y: (ly - G.oy) / G.esc };
  }

  // ------------------------------------------------------------ estado
  var estado = 'inicio';            // inicio | contagem | jogando | conferindo | fim
  var rodada = 0;                   // muda a cada jogo: cancela o que estiver agendado
  var pecas = [], lugares = [];
  var arr = null;                   // peça sendo arrastada
  var completo = false, ganhou = false, respostaMostrada = false;
  var par = {};                     // órgãos que existem em par (pulmão, rim)
  J.lugares.forEach(function (a) {
    J.lugares.forEach(function (b) { if (a !== b && a.tipo === b.tipo) par[a.tipo] = true; });
  });

  function pos(el, x, y) {
    el.style.setProperty('--x', x + 'px');
    el.style.setProperty('--y', y + 'px');
  }
  function embaralha(v) {
    for (var i = v.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = v[i]; v[i] = v[j]; v[j] = t;
    }
    return v;
  }
  function camada(p, z) { p.el.style.zIndex = z; }
  function virar(p, sim) {
    p.vira = !!sim;
    if (p.vira) p.pv.classList.add('vira'); else p.pv.classList.remove('vira');
  }

  // ------------------------------------------------------------ montar o tabuleiro
  function montar() {
    pecas.forEach(function (p) { p.el.remove(); p.cel.remove(); });
    lugares.forEach(function (l) { l.el.remove(); l.selo.remove(); });
    pecas = []; lugares = [];

    var ids = nivelAtual().lugares;
    var defs = J.lugares.filter(function (d) { return ids.indexOf(d.id) >= 0; });

    defs.forEach(function (d) {
      var el = cria('div', 'lg', '<i>?</i>');
      var selo = cria('div', 'selo', '<i>' + IC_OK + IC_NO + '</i>');
      mesa.appendChild(el);
      mesa.appendChild(selo);
      lugares.push({ def: d, el: el, selo: selo, x: 0, y: 0, peca: null });
    });

    var ordem = embaralha(defs.slice());
    var metade = Math.ceil(ordem.length / 2);
    ordem.forEach(function (d, i) {
      var o = J.orgaos[d.tipo];
      var el = cria('div', 'pc', '<div class="pi"><div class="pa"><div class="pv">' + o.svg + '</div></div></div>');
      el.setAttribute('data-i', i);
      el.style.width = o.w + 'px';
      el.style.height = o.h + 'px';
      if (Math.min(o.w, o.h) < 112) {
        // peça pequena: área de toque invisível maior que o desenho
        var svg = el.querySelector('svg');
        var area = doc.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        area.setAttribute('cx', o.w / 2);
        area.setAttribute('cy', o.h / 2);
        area.setAttribute('rx', Math.max(o.w / 2, 50));
        area.setAttribute('ry', Math.max(o.h / 2, 50));
        area.setAttribute('fill', '#000');
        area.setAttribute('fill-opacity', '0');
        area.setAttribute('stroke', 'none');
        svg.insertBefore(area, svg.firstChild);
      }
      var cel = cria('div', 'cel', '<div class="fan">' + o.svg + '</div><div class="nm"><span>' + o.nome + '</span></div><span class="mk">' + IC_OK + IC_NO + '</span>');
      cel.setAttribute('data-i', i);
      mesa.appendChild(cel);
      mesa.appendChild(el);
      var pi = el.firstChild, pa = pi.firstChild;
      pecas.push({
        i: i, tipo: d.tipo, nome: o.nome, w: o.w, h: o.h,
        el: el, pi: pi, pa: pa, pv: pa.firstChild,
        cel: cel, fan: cel.firstChild, nm: cel.children[1],
        lado: i < metade ? 0 : 1, viraCasa: !!d.vira, vira: false, giro: 0,
        lugar: null, casa: { x: 0, y: 0, s: 1 }, x: 0, y: 0, s: 1, z: 100, certa: null
      });
    });

    // No corpo, as peças menores ficam por cima das maiores (nenhuma some).
    pecas.slice().sort(function (a, b) { return b.w * b.h - a.w * a.h; }).forEach(function (p, n) { p.z = 100 + n; });
    pecas.forEach(function (p) { virar(p, p.viraCasa); });

    completo = false; ganhou = false; respostaMostrada = false;
    arrumar(false);
    prepararPlacar();
    montarInicio();
  }

  // Calcula onde fica cada lugar, cada casa da bandeja e cada peça.
  function arrumar(modo) {
    if (!G.W) return;
    var W = G.W, x0 = W / 2 - CORPO_W / 2;
    var col = x0 - 24 - MARGEM;
    coluna = col;
    palco.style.setProperty('--col', col + 'px');
    encaixar($('dica'), col - 86, 25, 12);
    encaixar($('conferir'), col - 44, 40, 16);
    if (!$('legenda').hidden) encaixar($('legenda'), col - 44 - ($('legenda').className.length > 7 ? 64 : 0), 40, 16);

    lugares.forEach(function (l) {
      l.x = x0 + l.def.x * K;
      l.y = CORPO_Y + l.def.y * K;
      pos(l.el, l.x, l.y);
      pos(l.selo, l.x + 24, l.y - 24);
    });

    var topo = MARGEM, alt = 1000 - 150 - topo, vao = 14;
    [0, 1].forEach(function (lado) {
      var lista = pecas.filter(function (p) { return p.lado === lado; });
      var n = lista.length;
      if (!n) return;
      var m = null;
      for (var cols = 1; cols <= 4; cols++) {
        var lin = Math.ceil(n / cols);
        var cw = Math.min(320, (col - vao * (cols - 1)) / cols);
        var ch = Math.min(340, (alt - vao * (lin - 1)) / lin);
        var nh = limita(ch * 0.2, 30, 46);
        var s = Math.min(cw - 26, ch - nh - 22);
        if (!m || s > m.s + 1) m = { cols: cols, lin: lin, cw: cw, ch: ch, nh: nh, s: s };
      }
      var gw = m.cols * m.cw + vao * (m.cols - 1), gh = m.lin * m.ch + vao * (m.lin - 1);
      var gx = (lado === 0 ? MARGEM : W - MARGEM - col) + (col - gw) / 2;
      var gy = topo + (alt - gh) / 2;
      lista.forEach(function (p, idx) {
        var c = idx % m.cols, r = Math.floor(idx / m.cols);
        var naLinha = r === m.lin - 1 ? n - r * m.cols : m.cols;
        var x = gx + (m.cols - naLinha) * (m.cw + vao) / 2 + c * (m.cw + vao);
        var y = gy + r * (m.ch + vao);
        var t = Math.min(m.s / p.w, m.s / p.h, 1.12);
        var cy = 12 + (m.ch - m.nh - 16) / 2;
        p.cel.style.width = m.cw + 'px';
        p.cel.style.height = m.ch + 'px';
        pos(p.cel, x, y);
        p.fan.style.top = cy + 'px';
        p.fan.firstChild.style.cssText = 'left:' + (-p.w / 2) + 'px;top:' + (-p.h / 2) + 'px;transform:scale(' + (p.viraCasa ? -t : t) + ',' + t + ')';
        p.nm.style.height = m.nh + 'px';
        p.nm.style.lineHeight = (m.nh - 8) + 'px';
        encaixar(p.nm, m.cw - 26, Math.round(limita(m.nh * 0.62, 17, 28)), 11);
        p.fonte = parseFloat(p.nm.style.fontSize);
        p.casa = { x: x + m.cw / 2, y: y + cy, s: t };
      });
    });

    // todos os nomes com o mesmo tamanho de letra (o do nome mais apertado)
    var letra = pecas.reduce(function (m, p) { return Math.min(m, p.fonte || 28); }, 28);
    pecas.forEach(function (p) { p.nm.style.fontSize = letra + 'px'; });

    pecas.forEach(function (p) {
      if (arr && arr.p === p) return;
      if (p.lugar) por(p, p.lugar.x, p.lugar.y, K, modo);
      else por(p, p.casa.x, p.casa.y, p.casa.s, modo);
    });
  }

  // Coloca a peça com o centro em (x, y). modo: false (na hora), true (rápido) ou 'lento'.
  function por(p, x, y, s, modo) {
    p.x = x; p.y = y; p.s = s;
    p.el.classList.remove('anim', 'lento');
    if (modo) p.el.classList.add(modo === 'lento' ? 'lento' : 'anim');
    p.el.style.transform = 'translate(' + (x - p.w / 2) + 'px,' + (y - p.h / 2) + 'px)';
    p.pi.style.transform = 'scale(' + s + ')' + (p.giro ? ' rotate(' + p.giro + 'deg)' : '');
  }

  function esvaziar(l) {
    l.peca = null;
    l.el.classList.remove('cheio');
  }

  function ocupar(p, l, modo) {
    if (p.lugar && p.lugar !== l) esvaziar(p.lugar);
    p.lugar = l;
    l.peca = p;
    l.el.classList.add('cheio');
    if (par[p.tipo]) {
      // pulmão e rim viram para o lado do corpo em que foram postos
      var d = l.def.x - J.cw / 2;
      if (d > 12) virar(p, true); else if (d < -12) virar(p, false);
    }
    p.giro = 0;
    por(p, l.x, l.y, K, modo);
    camada(p, p.z);
  }

  function praCasa(p, modo) {
    if (p.lugar) { esvaziar(p.lugar); p.lugar = null; }
    virar(p, p.viraCasa);
    p.giro = 0;
    por(p, p.casa.x, p.casa.y, p.casa.s, modo);
    if (!modo) { camada(p, 60); return; }
    camada(p, 900);
    var r = rodada;
    setTimeout(function () {
      if (r === rodada && !p.lugar && !(arr && arr.p === p)) camada(p, 60);
    }, 320);
  }

  // ------------------------------------------------------------ arrastar e soltar
  function maisPerto(x, y) {
    var achado = null, menor = RAIO * RAIO;
    lugares.forEach(function (l) {
      var d = (l.x - x) * (l.x - x) + (l.y - y) * (l.y - y);
      if (d < menor) { menor = d; achado = l; }
    });
    return achado;
  }

  // Qual peça está embaixo do toque? Vale o desenho tocado ou a casa da bandeja;
  // se não for nenhum dos dois, procura uma peça do corpo bem perto do dedo.
  function pecaEm(alvo, pt) {
    var a = alvo && alvo.closest ? alvo.closest('.pc') : null;
    if (a) return { p: pecas[+a.getAttribute('data-i')], naPeca: true };
    a = alvo && alvo.closest ? alvo.closest('.cel') : null;
    if (a) {
      var q = pecas[+a.getAttribute('data-i')];
      return q && !q.lugar ? { p: q, naPeca: false } : null;
    }
    // (só vale para toque no fundo do palco, nunca por cima de botão ou cartão)
    if (alvo !== palco && alvo !== mesa) return null;
    var perto = null;
    pecas.forEach(function (p) {
      if (!p.lugar) return;
      if (Math.abs(pt.x - p.x) > p.w * K / 2 + 16 || Math.abs(pt.y - p.y) > p.h * K / 2 + 16) return;
      if (!perto || p.z > perto.z) perto = p;
    });
    return perto ? { p: perto, naPeca: true } : null;
  }

  function baixar(e) {
    som.acorda();
    manterAcesa();
    if (estado !== 'jogando') return;
    if (arr) {
      // já existe um arrasto: outro dedo é ignorado; o mesmo ponteiro de novo
      // quer dizer que o "soltar" anterior se perdeu
      if (e.pointerId !== arr.id) return;
      largar(true);
    }
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    var pt = noPalco(e);
    var achada = pecaEm(e.target, pt);
    if (!achada || !achada.p) return;
    e.preventDefault();

    var p = achada.p, origem = p.lugar;
    if (origem) { esvaziar(origem); p.lugar = null; }
    var toque = e.pointerType === 'touch';
    arr = {
      p: p, id: e.pointerId, origem: origem,
      px: pt.x, py: pt.y, x0: pt.x, y0: pt.y, andou: false,
      ox: p.x - pt.x, oy: p.y - pt.y,
      // no dedo a peça sobe um pouco, para não ficar escondida embaixo dele
      ax: toque || !achada.naPeca ? 0 : p.x - pt.x,
      ay: toque ? -Math.min(110, 40 / G.esc) : (achada.naPeca ? p.y - pt.y : 0),
      alvo: null, t: performance.now(), raf: 0
    };
    try { palco.setPointerCapture(e.pointerId); } catch (err) {}
    p.el.classList.remove('anim', 'lento');
    p.el.classList.add('arr');
    doc.body.classList.add('arrastando');
    camada(p, 1000);
    p.giro = -4;
    som.pega();
    vibra(8);
    quadro(arr.t);
  }

  function quadro(agora) {
    if (!arr) return;
    var dt = limita(agora - arr.t, 0, 60);
    arr.t = agora;
    var f = 1 - Math.exp(-dt / 60);
    arr.ox += (arr.ax - arr.ox) * f;
    arr.oy += (arr.ay - arr.oy) * f;
    var x = limita(arr.px + arr.ox, 24, G.W - 24), y = limita(arr.py + arr.oy, 24, 976);
    por(arr.p, x, y, K * 1.07, false);
    var l = maisPerto(x, y);
    if (l !== arr.alvo) {
      if (arr.alvo) arr.alvo.el.classList.remove('alvo');
      if (l) l.el.classList.add('alvo');
      arr.alvo = l;
    }
    olhar(x, y);
    arr.raf = requestAnimationFrame(quadro);
  }

  function mover(e) {
    if (!arr || e.pointerId !== arr.id) return;
    var pt = noPalco(e);
    arr.px = pt.x;
    arr.py = pt.y;
    // só conta como arrasto depois de andar uns 8 px na tela
    if (!arr.andou && Math.abs(pt.x - arr.x0) + Math.abs(pt.y - arr.y0) > 8 / G.esc) arr.andou = true;
  }

  function soltar(e) {
    if (!arr || e.pointerId !== arr.id) return;
    var valeu = e.type === 'pointerup';
    if (valeu) mover(e);
    // toque sem arrastar não muda nada: a peça volta para onde estava
    largar(!valeu || !arr.andou);
  }

  if (window.PointerEvent) {
    palco.addEventListener('pointerdown', baixar);
    palco.addEventListener('pointermove', mover);
    palco.addEventListener('pointerup', soltar);
    palco.addEventListener('pointercancel', soltar);
    palco.addEventListener('lostpointercapture', function (e) { if (e.target === palco) soltar(e); });
  } else {
    // Navegadores antigos, sem "pointer events": toque e mouse separados.
    var dedos = function (e, tipo, fn) {
      for (var i = 0; i < e.changedTouches.length; i++) {
        var t = e.changedTouches[i];
        fn({
          type: tipo, pointerId: 't' + t.identifier, pointerType: 'touch', button: 0,
          clientX: t.clientX, clientY: t.clientY, target: e.target,
          preventDefault: function () { e.preventDefault(); }
        });
      }
    };
    var rato = function (e, tipo) {
      return {
        type: tipo, pointerId: 'mouse', pointerType: 'mouse', button: e.button,
        clientX: e.clientX, clientY: e.clientY, target: e.target,
        preventDefault: function () { e.preventDefault(); }
      };
    };
    palco.addEventListener('touchstart', function (e) { dedos(e, 'pointerdown', baixar); }, { passive: false });
    palco.addEventListener('touchmove', function (e) { dedos(e, 'pointermove', mover); }, { passive: false });
    palco.addEventListener('touchend', function (e) { dedos(e, 'pointerup', soltar); });
    palco.addEventListener('touchcancel', function (e) { dedos(e, 'pointercancel', soltar); });
    palco.addEventListener('mousedown', function (e) { baixar(rato(e, 'pointerdown')); });
    window.addEventListener('mousemove', function (e) { mover(rato(e, 'pointermove')); });
    window.addEventListener('mouseup', function (e) { soltar(rato(e, 'pointerup')); });
  }
  window.addEventListener('blur', function () { if (arr) largar(true); });

  function largar(cancelado) {
    var a = arr;
    if (!a) return;
    cancelAnimationFrame(a.raf);
    var p = a.p;
    var x = limita(a.px + a.ox, 24, G.W - 24), y = limita(a.py + a.oy, 24, 976);
    var l = cancelado ? a.origem : maisPerto(x, y);
    if (a.alvo) a.alvo.el.classList.remove('alvo');
    arr = null;
    try { palco.releasePointerCapture(a.id); } catch (err) {}
    p.el.classList.remove('arr');
    doc.body.classList.remove('arrastando');
    olhar(null);

    if (l) {
      var outro = l.peca;
      if (outro && outro !== p) {
        // lugar ocupado: troca as duas peças (ou devolve a outra para a bandeja)
        if (a.origem && a.origem !== l) ocupar(outro, a.origem, true); else praCasa(outro, true);
      }
      ocupar(p, l, true);
      if (!cancelado) { som.encaixe(); vibra(12); }
    } else {
      praCasa(p, true);
      if (!cancelado) som.volta();
    }
    atualizar();
  }

  // ------------------------------------------------------------ placar e botões
  function prepararPlacar() {
    var bt = $('conferir');
    bt.hidden = false;
    bt.disabled = true;
    bt.className = 'bt bt-verde';
    rotulo('Conferir');
    $('legenda').hidden = true;
    $('menu-btn').disabled = false;
    dica('Arraste cada órgão<br>até o lugar certo');

    var texto = reais(cfg.premio), n = texto.length;
    var valor = $('premio').querySelector('b');
    valor.textContent = texto;
    valor.style.fontSize = (n <= 6 ? 46 : n === 7 ? 42 : n === 8 ? 38 : n === 9 ? 33 : 28) + 'px';
    $('ini-premio').textContent = texto;

    var t = cfg.tempo;
    $('resumo').textContent = 'Nível ' + nivelAtual().nome + ' · ' + pecas.length + ' peças · ' +
      (t ? (t >= 120 ? t / 60 + ' min' : t + ' segundos') : 'sem tempo');

    rel.resta = cfg.tempo;
    rel.seg = -1;
    rel.anda = false;
    mostrarRelogio();
    ajustarTitulo();
  }

  function atualizar() {
    if (estado !== 'jogando') return;
    var n = pecas.length;
    var postas = pecas.filter(function (p) { return p.lugar; }).length;
    var falta = n - postas, tudo = falta === 0;
    var bt = $('conferir');
    bt.disabled = !tudo;
    rotulo(tudo || !postas ? 'Conferir' : (falta === 1 ? 'Falta 1' : 'Faltam ' + falta));
    if (tudo) bt.classList.add('chama'); else bt.classList.remove('chama');
    dica(tudo ? 'Tudo no lugar?<br>Aperte conferir'
      : postas ? postas + ' de ' + n + '<br>no corpo'
      : 'Arraste cada órgão<br>até o lugar certo');
    if (tudo && !completo) som.pronto();
    completo = tudo;
  }

  function ajustarTitulo() {
    var t = $('titulo');
    if (!t || !G.W) return;
    var largura = G.W * 0.56 - 50, f = 132;
    t.style.fontSize = f + 'px';
    while (f > 56 && (t.offsetWidth > largura || t.offsetHeight > 640)) {
      f -= 4;
      t.style.fontSize = f + 'px';
    }
  }

  // ------------------------------------------------------------ cronômetro
  var rel = { resta: 0, antes: 0, anda: false, seg: -1 };

  function mostrarRelogio() {
    var el = $('relogio');
    if (estado === 'conferindo' || estado === 'fim') return;
    if (!cfg.tempo) { el.hidden = true; return; }
    var s = Math.max(0, Math.ceil(rel.resta)), longo = s > 99;
    el.hidden = false;
    el.className = 'relogio' + (longo ? ' longo' : '') + (s <= 10 && estado === 'jogando' ? ' aperto' : '');
    el.querySelector('b').textContent = longo ? Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2) : s;
    el.querySelector('span').textContent = longo ? 'min' : 'seg';
  }

  function ligarRelogio(sim) {
    rel.anda = !!sim && cfg.tempo > 0 && estado === 'jogando';
    rel.antes = performance.now();
  }

  setInterval(function () {
    if (!rel.anda) return;
    var agora = performance.now();
    rel.resta -= (agora - rel.antes) / 1000;
    rel.antes = agora;
    var s = Math.max(0, Math.ceil(rel.resta));
    if (s !== rel.seg) {
      rel.seg = s;
      mostrarRelogio();
      if (s <= 10 && s > 0) som.tic(s <= 3);
    }
    if (rel.resta <= 0) {
      rel.anda = false;
      som.alarme();
      conferir(true);
    }
  }, 100);

  // ------------------------------------------------------------ começar
  function comecar() {
    if (estado !== 'inicio') return;
    som.acorda();
    manterAcesa();
    estado = 'contagem';
    var r = ++rodada;
    $('inicio').classList.add('saiu');
    palco.classList.remove('inicio');
    espera(540)
      .then(function () { return cfg.tempo > 0 && r === rodada ? contagem(r) : null; })
      .then(function () {
        if (r !== rodada) return;
        estado = 'jogando';
        rel.resta = cfg.tempo;
        rel.seg = -1;
        ligarRelogio(true);
        mostrarRelogio();
        atualizar();
      });
  }

  async function contagem(r) {
    var c = $('contagem');
    var passos = ['3', '2', '1', 'Valendo!'];
    c.hidden = false;
    for (var i = 0; i < passos.length; i++) {
      if (r !== rodada) break;
      c.innerHTML = '<b' + (i === 3 ? ' class="txt"' : '') + '>' + passos[i] + '</b>';
      som.bip(i === 3);
      await espera(i === 3 ? 650 : 720);
    }
    c.hidden = true;
  }

  // ------------------------------------------------------------ conferir
  async function conferir(porTempo) {
    if (estado !== 'jogando') return;
    if (arr) largar(true);
    estado = 'conferindo';
    var r = ++rodada;
    rel.anda = false;
    palco.classList.add('travado', 'fim');

    var bt = $('conferir'), plc = $('relogio');
    bt.hidden = true;
    bt.classList.remove('chama');
    legenda(porTempo ? 'Tempo esgotado!' : 'Conferindo...', '');
    dica('');
    $('menu-btn').disabled = true;
    plc.classList.remove('aperto');
    boca('surpreso');

    pecas.forEach(function (p) { p.certa = !!p.lugar && p.lugar.def.tipo === p.tipo; });
    function porLugar(a, b) { return a.lugar.def.y - b.lugar.def.y || a.lugar.def.x - b.lugar.def.x; }
    // Suspense: primeiro as certas, de cima para baixo; as erradas ficam para o fim.
    var ordem = pecas.filter(function (p) { return p.certa; }).sort(porLugar)
      .concat(pecas.filter(function (p) { return p.lugar && !p.certa; }).sort(porLugar))
      .concat(pecas.filter(function (p) { return !p.lugar; }));
    var n = pecas.length, acertos = 0, errou = false;

    function placar() {
      plc.hidden = false;
      plc.className = 'relogio placar' + (n > 9 && acertos > 9 ? ' longo' : '');
      plc.querySelector('b').textContent = acertos + '/' + n;
      plc.querySelector('span').textContent = 'acertos';
    }

    som.rufo(porTempo ? 1.3 : 0.8);
    await espera(porTempo ? 1500 : 950);
    if (r !== rodada) return;
    placar();

    for (var i = 0; i < ordem.length; i++) {
      var p = ordem[i];
      if (p.certa) acertos++; else errou = true;
      marcar(p, acertos);
      placar();
      await espera(errou ? 430 : (n > 10 ? 520 : 620));
      if (r !== rodada) return;
    }

    await espera(520);
    if (r !== rodada) return;
    veredito(acertos, n);
  }

  function marcar(p, acertos) {
    var cls = p.certa ? 'ok' : 'no';
    legenda(p.nome, cls);
    p.cel.classList.remove('vez');
    void p.cel.offsetWidth;
    p.cel.classList.add(cls, 'vez');
    if (p.lugar) {
      p.lugar.selo.className = 'selo ' + cls;
      p.pa.classList.remove('pulo', 'treme');
      void p.pa.offsetWidth;
      p.pa.classList.add(p.certa ? 'pulo' : 'treme');
    }
    if (p.certa) { som.certo(acertos); vibra(15); } else { som.errado(); vibra([40, 40, 80]); }
  }

  function veredito(acertos, n) {
    estado = 'fim';
    ganhou = acertos === n;
    $('menu-btn').disabled = false;
    var cartao = $('resultado').firstChild, titulo = $('res-titulo');
    cartao.className = 'cartao res ' + (ganhou ? 'ganhou' : 'perdeu');
    $('res-acima').textContent = ganhou ? 'Acertou tudo!' : 'Não foi dessa vez!';
    titulo.innerHTML = ganhou ? 'Ganhou <span class="tag">' + reais(cfg.premio) + '</span>' : acertos + ' de ' + n;
    $('res-abaixo').textContent = ganhou ? n + ' de ' + n + ' no lugar certo' : (acertos === 1 ? 'peça no lugar certo' : 'peças no lugar certo');
    $('ver').textContent = ganhou ? 'Ver o corpo' : 'Ver resposta';
    $('resultado').hidden = false;
    // prêmio com muitos dígitos: encolhe o título até caber
    var f = ganhou ? 112 : 92;
    titulo.style.fontSize = f + 'px';
    while (f > 48 && cartao.offsetWidth > G.W - 90) { f -= 6; titulo.style.fontSize = f + 'px'; }

    if (ganhou) {
      boca('feliz');
      som.vitoria();
      confete();
      vibra([60, 60, 60, 60, 200]);
      pecas.forEach(function (p) { if (p.tipo === 'coracao') { p.pa.classList.remove('pulo'); p.pa.classList.add('bate'); } });
    } else {
      boca('triste');
      som.derrota();
    }
  }

  // Depois do resultado: mostra o tabuleiro (com a resposta certa, se a pessoa errou).
  function fecharResultado() {
    $('resultado').hidden = true;
    $('legenda').hidden = true;
    var bt = $('conferir');
    bt.hidden = false;
    bt.disabled = false;
    bt.className = 'bt bt-tinta';
    rotulo('Jogar de novo');
    var n = pecas.length, acertos = pecas.filter(function (p) { return p.certa; }).length;
    dica(ganhou ? 'Corpo montado!<br>Ganhou ' + reais(cfg.premio)
      : 'Esta é a resposta.<br>Acertou ' + acertos + ' de ' + n);
    if (!ganhou && !respostaMostrada) mostrarResposta();
  }

  function mostrarResposta() {
    respostaMostrada = true;
    var r = rodada;
    var erradas = pecas.filter(function (p) { return !p.certa; });
    erradas.forEach(function (p) {
      if (!p.lugar) return;
      p.lugar.selo.className = 'selo';
      esvaziar(p.lugar);
      p.lugar = null;
    });
    var livres = lugares.filter(function (l) { return !l.peca; });
    erradas.forEach(function (p, i) {
      var k = -1;
      livres.some(function (l, j) { if (l.def.tipo === p.tipo) { k = j; return true; } return false; });
      if (k < 0) return;
      var l = livres.splice(k, 1)[0];
      l.peca = p;
      setTimeout(function () {
        if (r !== rodada) return;
        camada(p, 950);
        ocupar(p, l, 'lento');
        camada(p, 950);
        som.pega();
        setTimeout(function () { if (r === rodada) camada(p, p.z); }, 620);
      }, 250 + i * 280);
    });
  }

  function novoJogo() {
    rodada++;
    if (arr) largar(true);
    estado = 'inicio';
    rel.anda = false;
    $('resultado').hidden = true;
    $('pausa').hidden = true;
    $('contagem').hidden = true;
    $('confete').innerHTML = '';
    palco.classList.remove('travado', 'fim');
    boca('neutro');
    olhar(null);
    montar();
    palco.classList.add('inicio');
    $('inicio').classList.remove('saiu');
  }

  // ------------------------------------------------------------ carinha do boneco
  var BOCAS = {
    neutro: 'M303,176 Q320,190 337,176',
    feliz: 'M299,171 Q320,203 341,171 Z',
    triste: 'M304,187 Q320,172 336,187',
    surpreso: 'M311,180 a9,10 0 1,0 18,0 a9,10 0 1,0 -18,0 Z'
  };
  function boca(tipo) {
    var b = $('corpo').querySelector('.boca');
    if (!b) return;
    b.setAttribute('d', BOCAS[tipo]);
    b.setAttribute('fill', tipo === 'feliz' || tipo === 'surpreso' ? '#1b1d4d' : 'none');
  }
  // Os olhos acompanham a peça que está sendo arrastada.
  function olhar(x, y) {
    var olhos = $('corpo').querySelectorAll('.olho');
    var dx = 0, dy = 0;
    if (x != null) {
      var vx = x - G.W / 2, vy = y - (CORPO_Y + 156 * K);
      var d = Math.sqrt(vx * vx + vy * vy) || 1;
      var f = Math.min(1, d / 160) * 4.5;
      dx = vx / d * f;
      dy = vy / d * f;
    }
    for (var i = 0; i < olhos.length; i++) olhos[i].style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
  }

  function confete() {
    var caixa = $('confete');
    if (!caixa.animate) return;
    var cores = ['#12b56d', '#ff3b55', '#2f6df6', '#ffffff', '#ff7ac1', '#ffd84d'];
    for (var i = 0; i < 150; i++) {
      var d = cria('i'), tam = 12 + Math.random() * 16;
      d.style.cssText = 'left:' + (Math.random() * 100) + '%;width:' + tam + 'px;height:' + (tam * (0.4 + Math.random() * 0.6)) +
        'px;background:' + cores[i % cores.length] + ';border-radius:' + (Math.random() < 0.3 ? '50%' : '3px');
      caixa.appendChild(d);
      var an = d.animate(
        [{ transform: 'translate(0,0) rotate(0deg)' },
         { transform: 'translate(' + (Math.random() * 300 - 150) + 'px,1100px) rotate(' + (Math.random() * 1400 - 700) + 'deg)' }],
        { duration: 1700 + Math.random() * 2300, delay: Math.random() * 1400, easing: 'cubic-bezier(.3,.3,.6,1)', fill: 'both' }
      );
      an.onfinish = (function (el) { return function () { el.remove(); }; })(d);
    }
  }

  // ------------------------------------------------------------ tela inicial
  function montarInicio() {
    var ids = nivelAtual().lugares;
    var html = '<div class="ini-boneco">' + J.corpo;
    J.lugares.forEach(function (d) {
      if (ids.indexOf(d.id) >= 0) html += '<div class="lg" style="--x:' + d.x + 'px;--y:' + d.y + 'px"><i>?</i></div>';
    });
    var soltos = [['coracao', 40, 330, -14, 0], ['cerebro', 596, 150, 12, 0.7], ['baco', 598, 560, 10, 1.3], ['estomago', 40, 905, -9, 1.9], ['rim', 590, 880, 12, 2.5]];
    soltos.forEach(function (s) {
      var o = J.orgaos[s[0]];
      html += '<div class="solto" style="margin:' + (s[2] - o.h / 2) + 'px 0 0 ' + (s[1] - o.w / 2) + 'px;animation-delay:-' + s[4] + 's">' +
        '<div style="transform:rotate(' + s[3] + 'deg)">' + o.svg + '</div></div>';
    });
    $('ini-arte').innerHTML = html + '</div>';
  }

  // ------------------------------------------------------------ ajustes
  function descreverNivel(n) {
    var conta = {}, ordem = [];
    J.lugares.forEach(function (d) {
      if (n.lugares.indexOf(d.id) < 0) return;
      if (!conta[d.tipo]) { conta[d.tipo] = 0; ordem.push(d.tipo); }
      conta[d.tipo]++;
    });
    var nomes = ordem.map(function (t) {
      var o = J.orgaos[t];
      return (conta[t] > 1 ? conta[t] + ' ' + (o.plural || o.nome) : o.nome).toLowerCase();
    });
    return n.lugares.length + ' peças: ' + nomes.slice(0, -1).join(', ') + ' e ' + nomes[nomes.length - 1] + '.';
  }

  function pintarAjustes() {
    $('pr-valor').textContent = reais(cfg.premio);
    var chips = $('ajustes').querySelectorAll('.chip');
    for (var i = 0; i < chips.length; i++) {
      var c = chips[i], on = false;
      if (c.hasAttribute('data-nivel')) on = c.getAttribute('data-nivel') === cfg.nivel;
      else if (c.hasAttribute('data-tempo')) on = +c.getAttribute('data-tempo') === cfg.tempo;
      else if (c.hasAttribute('data-som')) on = (c.getAttribute('data-som') === '1') === cfg.som;
      if (on) c.classList.add('on'); else c.classList.remove('on');
    }
    $('nivel-obs').textContent = descreverNivel(nivelAtual());
    $('som-btn').textContent = 'Som: ' + (cfg.som ? 'ligado' : 'desligado');
  }

  $('niveis').innerHTML = J.niveis.map(function (n) {
    return '<button type="button" class="chip" data-nivel="' + n.id + '">' + n.nome + '</button>';
  }).join('');
  $('tempos').innerHTML = TEMPOS.map(function (t) {
    return '<button type="button" class="chip" data-tempo="' + t + '">' + (t ? (t >= 120 ? t / 60 + ' min' : t + ' s') : 'Sem tempo') + '</button>';
  }).join('');
  $('sons').innerHTML = '<button type="button" class="chip" data-som="1">Ligado</button><button type="button" class="chip" data-som="0">Desligado</button>';

  $('ajustes').addEventListener('click', function (e) {
    var c = e.target.closest ? e.target.closest('button') : null;
    if (!c) return;
    var antes = cfg.nivel, i;
    if (c.id === 'pr-mais') {
      for (i = 0; i < PREMIOS.length - 1 && PREMIOS[i] <= cfg.premio; i++);
      cfg.premio = PREMIOS[i];
    } else if (c.id === 'pr-menos') {
      for (i = PREMIOS.length - 1; i > 0 && PREMIOS[i] >= cfg.premio; i--);
      cfg.premio = PREMIOS[i];
    } else if (c.hasAttribute('data-nivel')) cfg.nivel = c.getAttribute('data-nivel');
    else if (c.hasAttribute('data-tempo')) cfg.tempo = +c.getAttribute('data-tempo');
    else if (c.hasAttribute('data-som')) { cfg.som = c.getAttribute('data-som') === '1'; if (cfg.som) som.pronto(); }
    else if (c.id === 'fechar-ajustes') { $('ajustes').hidden = true; return; }
    salvar();
    if (cfg.nivel !== antes) montar(); else prepararPlacar();
    pintarAjustes();
  });

  // ------------------------------------------------------------ tela cheia e tela acesa
  function telaCheia() {
    var el = doc.documentElement;
    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      (doc.exitFullscreen || doc.webkitExitFullscreen).call(doc);
      return;
    }
    var pedir = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!pedir) return;
    try {
      var r = pedir.call(el);
      if (r && r.then) r.then(function () {
        // no Android, trava a tela deitada enquanto estiver em tela cheia
        try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function () {}); } catch (e) {}
      }).catch(function () {});
    } catch (e) {}
  }
  // Onde o navegador não deixa (iPhone, página embutida), os botões de tela cheia somem.
  var raiz = doc.documentElement;
  if (!((raiz.requestFullscreen && doc.fullscreenEnabled !== false) ||
        (raiz.webkitRequestFullscreen && doc.webkitFullscreenEnabled !== false))) {
    $('cheia-ini').hidden = true;
    $('cheia-btn').hidden = true;
  }

  // Não deixa a tela apagar no meio da gravação (onde o navegador permite).
  var trava = null;
  function manterAcesa() {
    try {
      if (trava || !navigator.wakeLock || doc.visibilityState !== 'visible') return;
      navigator.wakeLock.request('screen').then(function (t) {
        trava = t;
        t.addEventListener('release', function () { trava = null; });
      }).catch(function () {});
    } catch (e) {}
  }

  // ------------------------------------------------------------ botões
  $('comecar').addEventListener('click', comecar);
  $('abrir-ajustes').addEventListener('click', function () { pintarAjustes(); $('ajustes').hidden = false; });
  $('cheia-ini').addEventListener('click', telaCheia);
  $('cheia-btn').addEventListener('click', telaCheia);
  $('conferir').addEventListener('click', function () { if (estado === 'fim') novoJogo(); else conferir(false); });
  $('ver').addEventListener('click', fecharResultado);
  $('denovo').addEventListener('click', novoJogo);
  $('recomecar').addEventListener('click', novoJogo);
  $('menu-btn').addEventListener('click', function () {
    if (estado === 'conferindo' || estado === 'contagem') return;
    if (arr) largar(true);
    rel.anda = false;
    pintarAjustes();
    $('pausa').hidden = false;
  });
  $('continuar').addEventListener('click', function () { $('pausa').hidden = true; ligarRelogio(true); });
  $('som-btn').addEventListener('click', function () {
    cfg.som = !cfg.som;
    salvar();
    pintarAjustes();
    if (cfg.som) som.pronto();
  });

  doc.addEventListener('keydown', function (e) {
    if (e.key === 'f' || e.key === 'F') telaCheia();
  });
  doc.addEventListener('visibilitychange', function () {
    if (doc.visibilityState === 'visible') {
      manterAcesa();
      if ($('pausa').hidden) ligarRelogio(true);
    } else {
      rel.anda = false;
    }
  });

  // O iOS só libera o som dentro de um clique ou fim de toque.
  doc.addEventListener('click', som.acorda, true);
  doc.addEventListener('touchend', som.acorda, true);

  // Nada de menu de contexto, zoom ou rolagem atrapalhando o jogo.
  doc.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  doc.addEventListener('dragstart', function (e) { e.preventDefault(); });
  doc.addEventListener('gesturestart', function (e) { e.preventDefault(); });
  doc.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });

  window.addEventListener('resize', medir);
  window.addEventListener('orientationchange', function () { setTimeout(medir, 250); });
  if (window.visualViewport) window.visualViewport.addEventListener('resize', medir);

  // ------------------------------------------------------------ partida
  $('corpo').innerHTML = J.corpo;
  medir();
  montar();
  palco.classList.add('pronto');
})();
`;
