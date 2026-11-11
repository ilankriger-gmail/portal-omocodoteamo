import { BORDA, CABECA, CORPO_ALTURA, CORPO_LARGURA, LUGARES, NIVEIS, ORGAOS, corpoSvg } from "./arte";
import { CLIENTE } from "./cliente";
import { CSS } from "./css";

const IC_OK = `<svg class="ic ic-ok" viewBox="0 0 24 24"><path d="M4.5 12.5l5 5L19.5 7"/></svg>`;
const IC_NO = `<svg class="ic ic-no" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>`;
const IC_CHEIA = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>`;
const IC_PAUSA = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5v14M15 5v14"/></svg>`;

/**
 * Página do jogo "Por R$ 500 você coloca os órgãos no lugar certo?".
 * HTML único e completo: estilo, script e desenhos vão embutidos, sem nenhuma
 * requisição extra. Depois de aberta, a página funciona até sem internet.
 */
function montarPagina(): string {
  // "<" escapado para os SVGs não fecharem a tag <script> por acidente.
  const dados = JSON.stringify({
    cw: CORPO_LARGURA,
    ch: CORPO_ALTURA,
    corpo: corpoSvg(),
    cabeca: CABECA,
    borda: BORDA,
    orgaos: ORGAOS,
    lugares: LUGARES,
    niveis: NIVEIS,
  }).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<title>Órgãos no lugar certo</title>
<meta name="description" content="Por R$ 500 você coloca os órgãos no lugar certo?">
<meta name="robots" content="noindex,nofollow">
<meta property="og:title" content="Órgãos no lugar certo">
<meta property="og:description" content="Por R$ 500 você coloca os órgãos no lugar certo?">
<meta name="theme-color" content="#ffcc33">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Órgãos">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<style>${CSS}</style>
</head>
<body>
<div id="area"></div>
<div id="palco" class="palco inicio">
<div id="mesa">
<div id="corpo"></div>
<div id="premio" class="premio"><span>Valendo</span><b>R$ 500</b></div>
<div id="relogio" class="relogio" hidden><b>60</b><span>seg</span></div>
<button id="menu-btn" class="rd" type="button" aria-label="Pausar">${IC_PAUSA}</button>
<div id="dica" class="dica"></div>
<button id="conferir" class="bt bt-verde" type="button" disabled><span>Conferir</span></button>
<div id="legenda" class="legenda" hidden><span></span><i class="bola">${IC_OK}${IC_NO}</i></div>
</div>

<section id="inicio" class="tela">
<div class="ini-txt">
<h1 id="titulo">Por <span class="tag" id="ini-premio">R$ 500</span><br>você coloca<br>os órgãos no<br><span class="faixa">lugar certo?</span></h1>
<button id="comecar" class="bt bt-verde bt-g" type="button">Começar</button>
<p id="resumo" class="resumo"></p>
</div>
<div id="ini-arte" class="ini-arte"></div>
<div class="ini-topo"><button id="abrir-ajustes" class="mini" type="button">Ajustes</button><button id="cheia-ini" class="rd" type="button" aria-label="Tela cheia">${IC_CHEIA}</button></div>
</section>

<div id="contagem" class="contagem" hidden></div>

<div id="ajustes" class="modal" hidden><div class="cartao aj">
<h2>Ajustes</h2>
<div class="lin"><span class="rot">Prêmio</span><div class="passo"><button id="pr-menos" class="rd" type="button" aria-label="Diminuir prêmio">−</button><b id="pr-valor">R$ 500</b><button id="pr-mais" class="rd" type="button" aria-label="Aumentar prêmio">+</button></div></div>
<div class="lin"><span class="rot">Nível</span><div class="chips" id="niveis"></div></div>
<p class="obs" id="nivel-obs"></p>
<div class="lin"><span class="rot">Dicas</span><div class="chips" id="dicas"></div></div>
<p class="obs" id="dicas-obs"></p>
<div class="lin"><span class="rot">Tempo</span><div class="chips" id="tempos"></div></div>
<div class="lin"><span class="rot">Som</span><div class="chips" id="sons"></div></div>
<button id="fechar-ajustes" class="bt bt-verde" type="button">Pronto</button>
</div></div>

<div id="pausa" class="modal" hidden><div class="cartao pausa">
<h2>Pausado</h2>
<button id="continuar" class="bt bt-verde" type="button">Continuar</button>
<button id="recomecar" class="bt bt-vermelho" type="button">Recomeçar</button>
<div class="par"><button id="som-btn" class="bt" type="button">Som: ligado</button><button id="cheia-btn" class="bt" type="button">Tela cheia</button></div>
</div></div>

<div id="resultado" class="modal" hidden><div class="cartao res">
<p class="acima" id="res-acima"></p>
<h2 id="res-titulo"></h2>
<p class="abaixo" id="res-abaixo"></p>
<div class="par"><button id="ver" class="bt" type="button">Ver resposta</button><button id="denovo" class="bt bt-verde" type="button">Jogar de novo</button></div>
</div></div>

<div id="confete"></div>
</div>
<noscript><p style="padding:2rem;font:700 1.2rem system-ui">Ative o JavaScript para jogar.</p></noscript>
<script>window.JOGO=${dados};</script>
<script>${CLIENTE}</script>
</body>
</html>`;
}

// A página é sempre a mesma: monta uma vez só.
let pagina: string | null = null;

export function paginaJogoOrgaos(): string {
  if (!pagina) pagina = montarPagina();
  return pagina;
}
