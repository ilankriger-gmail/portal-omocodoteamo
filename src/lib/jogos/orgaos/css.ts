// Estilo do jogo. Todas as medidas em px valem para um "palco" de 1000 de altura
// (e 1333 a 2400 de largura), que o script escala para caber em qualquer tela.

export const CSS = String.raw`
*,*::before,*::after{box-sizing:border-box}
[hidden]{display:none!important}
/* Um palco deitado: boneco no centro, bandejas de peças dos dois lados. */
:root{--tinta:#1b1d4d;--papel:#fff;--sol-claro:#ffe27a;--sol:#ffcc33;--sol-escuro:#ffbe1c;--verde:#12b56d;--vermelho:#ff3b55;--ouro:#ffd84d;
--certo:#c9f5df;--erro:#ffd3da;--lugar:#eef0ff;--alvo:#ffe14d;--apagado:#ffe9a3;--linha:#e7e9f7;--foco:#2f6df6;--fonte:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%;background:var(--sol)}
html,body{margin:0;width:100%;height:100%;overflow:hidden;overscroll-behavior:none}
body{position:fixed;left:0;top:0;right:0;bottom:0;color:var(--tinta);font-family:var(--fonte);font-weight:900;line-height:1;text-transform:uppercase;
-webkit-font-smoothing:antialiased;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;touch-action:none;background:var(--sol)}
/* Raios de sol no fundo, onde o navegador souber desenhar. */
@supports (background:repeating-conic-gradient(red 0deg 1deg,blue 1deg 2deg)){
body{background:repeating-conic-gradient(from 0deg at 50% 46%,rgba(255,255,255,0) 0deg 6deg,rgba(255,255,255,.13) 6deg 12deg),
radial-gradient(circle at 50% 46%,var(--sol-claro) 0%,var(--sol) 40%,var(--sol-escuro) 100%)}
}
/* Parte útil da tela (sem entalhe nem barras do sistema): o script mede esta caixa. */
#area{position:fixed;left:0;top:0;right:0;bottom:0;visibility:hidden;pointer-events:none}
@supports (left:env(safe-area-inset-left,0px)){
#area{left:env(safe-area-inset-left,0px);top:env(safe-area-inset-top,0px);right:env(safe-area-inset-right,0px);bottom:env(safe-area-inset-bottom,0px)}
}
button{font:inherit;color:inherit;text-transform:inherit;letter-spacing:inherit;cursor:pointer;-webkit-appearance:none;appearance:none;margin:0;padding:0;border:0;background:none}
button:focus{outline:none}
button:focus-visible{outline:5px solid var(--foco);outline-offset:4px}
svg{display:block}
h1,h2,p{margin:0}

.palco{position:fixed;left:0;top:0;width:1778px;height:1000px;transform-origin:0 0;overflow:hidden;touch-action:none;visibility:hidden}
.palco.pronto{visibility:visible}
/* A mesa (boneco, bandejas, placar) some enquanto a tela inicial está na frente. */
#mesa{position:absolute;left:0;top:0;width:100%;height:100%;transition:opacity .34s ease .18s}
.palco.inicio #mesa{opacity:0;pointer-events:none;transition:opacity .15s}

/* ------------------------------------------------ boneco e lugares */
#corpo{position:absolute;left:50%;top:28px;width:604.16px;height:944px;margin-left:-302.08px;z-index:1;pointer-events:none}
.corpo{width:100%;height:100%;overflow:visible}
.olho{transition:transform .12s ease-out}

.lg{position:absolute;left:0;top:0;width:0;height:0;z-index:500;pointer-events:none;transform:translate(var(--x),var(--y))}
.lg i{position:absolute;left:-27px;top:-27px;width:54px;height:54px;border-radius:50%;border:4px dashed var(--tinta);background:var(--lugar);
display:grid;place-items:center;font-style:normal;font-size:28px;transition:transform .15s,background-color .15s,opacity .15s;animation:pulsa 2.4s ease-in-out infinite}
.lg.cheio i{opacity:0;transform:scale(.4);animation:none}
.lg.alvo i{opacity:1;transform:scale(1.42);background:var(--alvo);border-style:solid;animation:none}
.fim .lg,.livre .lg{display:none}
@keyframes pulsa{0%,100%{transform:scale(1)}50%{transform:scale(1.09)}}

.selo{position:absolute;left:0;top:0;width:0;height:0;z-index:600;pointer-events:none;transform:translate(var(--x),var(--y))}
.selo i{position:absolute;left:-25px;top:-25px;width:50px;height:50px;border-radius:50%;border:4px solid var(--tinta);display:grid;place-items:center;
transform:scale(0);transition:transform .28s cubic-bezier(.3,1.6,.5,1)}
.selo.ok i{background:var(--verde);transform:scale(1)}
.selo.no i{background:var(--vermelho);transform:scale(1)}
.ic{width:28px;height:28px;fill:none;stroke:var(--papel);stroke-width:4.5;stroke-linecap:round;stroke-linejoin:round}
.ic-no,.ok .ic-ok{display:block}
.ic-ok,.ok .ic-no{display:none}
.no .ic-ok{display:none}
.no .ic-no{display:block}

/* ------------------------------------------------ bandejas e peças */
.cel{position:absolute;left:0;top:0;z-index:2;background:var(--papel);border:4px solid var(--tinta);border-radius:24px;box-shadow:0 7px 0 rgba(27,29,77,.25);
transform:translate(var(--x),var(--y));cursor:grab;transition:background-color .2s}
.cel .fan{position:absolute;left:50%;top:0;width:0;height:0;opacity:.17;pointer-events:none}
.cel .fan svg{position:absolute;overflow:visible}
.cel .fan .sb{display:none}
.cel .nm{position:absolute;left:4px;right:4px;bottom:0;text-align:center;white-space:nowrap;letter-spacing:.02em}
.nm span,.dica span,#conferir span,.legenda span{display:inline-block}
.cel .mk{position:absolute;right:-13px;top:-13px;width:44px;height:44px;border-radius:50%;border:4px solid var(--tinta);display:none;place-items:center}
.cel .mk .ic{width:24px;height:24px}
.cel.ok{background:var(--certo)}
.cel.no{background:var(--erro)}
.cel.ok .mk{display:grid;background:var(--verde)}
.cel.no .mk{display:grid;background:var(--vermelho)}
.cel.vez{animation:vez .45s ease-out}
@keyframes vez{0%{transform:translate(var(--x),var(--y)) scale(1)}40%{transform:translate(var(--x),var(--y)) scale(1.08)}100%{transform:translate(var(--x),var(--y)) scale(1)}}

.pc{position:absolute;left:0;top:0;z-index:60;pointer-events:none;will-change:transform}
.pc.anim{transition:transform .28s cubic-bezier(.2,.85,.3,1.12)}
.pc.lento{transition:transform .6s cubic-bezier(.3,.1,.2,1)}
.pc .pi{transform-origin:50% 50%;transition:transform .16s ease-out}
.pc .pv{transition:transform .18s}
.pc .pv.vira{transform:scaleX(-1)}
.pc svg{overflow:visible}
.pc svg *{pointer-events:visiblePainted;cursor:grab}
.pc .sb,.pc .sb *{pointer-events:none}
.sb{transform:translateY(7px);opacity:.2;transition:transform .15s,opacity .15s}
.pc.arr .sb{transform:translateY(22px);opacity:.13}
.arrastando,.arrastando *{cursor:grabbing!important}
.travado .cel,.travado .pc svg *{cursor:default}
.pa.pulo{animation:pulo .5s cubic-bezier(.3,1.5,.5,1)}
.pa.treme{animation:treme .45s linear}
.pa.bate{animation:bate 1s ease-in-out infinite}
@keyframes pulo{0%{transform:scale(1)}40%{transform:scale(1.2)}100%{transform:scale(1)}}
@keyframes treme{0%,100%{transform:translateX(0)}15%{transform:translateX(-11px) rotate(-4deg)}35%{transform:translateX(11px) rotate(4deg)}55%{transform:translateX(-8px) rotate(-3deg)}75%{transform:translateX(7px) rotate(2deg)}}
@keyframes bate{0%,36%,100%{transform:scale(1)}12%{transform:scale(1.16)}24%{transform:scale(1.04)}30%{transform:scale(1.13)}}

/* ------------------------------------------------ placar */
.premio{position:absolute;left:50%;top:66px;width:202px;margin-left:-310px;z-index:3;background:var(--verde);color:var(--papel);border:4px solid var(--tinta);border-radius:22px;
box-shadow:0 7px 0 var(--tinta);padding:13px 6px 15px;text-align:center;transform:rotate(-6deg)}
.premio span{display:block;font-size:20px;letter-spacing:.1em}
.premio b{display:block;margin-top:7px;font-size:46px;white-space:nowrap}
.relogio{position:absolute;left:50%;top:50px;width:160px;height:160px;margin-left:128px;z-index:3;background:var(--papel);border:5px solid var(--tinta);border-radius:50%;
box-shadow:0 7px 0 var(--tinta);display:grid;place-content:center;text-align:center;transform:rotate(5deg)}
.relogio b{display:block;font-size:72px;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
.relogio.longo b{font-size:50px}
.relogio span{display:block;margin-top:4px;font-size:17px;letter-spacing:.12em}
.relogio.aperto{background:var(--vermelho);color:var(--papel);animation:aperto 1s ease-in-out infinite}
.relogio.placar{background:var(--tinta);color:var(--ouro)}
.relogio.placar b{font-size:54px}
.relogio.placar.longo b{font-size:44px}
@keyframes aperto{0%,100%{transform:rotate(5deg) scale(1)}50%{transform:rotate(5deg) scale(1.1)}}

.rd{width:64px;height:64px;border-radius:50%;background:var(--papel);border:4px solid var(--tinta);box-shadow:0 5px 0 var(--tinta);display:grid;place-items:center;
transition:transform .08s,box-shadow .08s}
.rd:active{transform:translateY(4px);box-shadow:0 1px 0 var(--tinta)}
.rd svg{width:30px;height:30px;fill:none;stroke:var(--tinta);stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}
#menu-btn{position:absolute;left:28px;bottom:46px;z-index:3}
.dica{position:absolute;left:110px;bottom:30px;width:calc(var(--col) - 82px);height:100px;z-index:3;display:flex;align-items:center;font-size:25px;line-height:1.16;white-space:nowrap}

.bt{height:96px;padding:0 34px;border:4px solid var(--tinta);border-radius:24px;background:var(--papel);box-shadow:0 8px 0 var(--tinta);font-size:40px;letter-spacing:.02em;
white-space:nowrap;display:inline-grid;place-items:center;transition:transform .08s,box-shadow .08s,background-color .2s}
.bt:active{transform:translateY(6px);box-shadow:0 2px 0 var(--tinta)}
.bt-verde{background:var(--verde);color:var(--papel)}
.bt-vermelho{background:var(--vermelho);color:var(--papel)}
.bt-tinta{background:var(--tinta);color:var(--ouro)}
.bt:disabled{background:var(--apagado);color:rgba(27,29,77,.55);border-color:rgba(27,29,77,.4);box-shadow:0 8px 0 rgba(27,29,77,.22);cursor:default;transform:none}
#conferir{position:absolute;right:28px;bottom:36px;width:var(--col);z-index:3;padding:0 8px}
#conferir.chama{animation:chama 1s ease-in-out infinite}
@keyframes chama{0%,100%{transform:scale(1)}50%{transform:scale(1.045)}}
.legenda{position:absolute;right:28px;bottom:36px;width:var(--col);height:96px;z-index:3;background:var(--papel);border:4px solid var(--tinta);border-radius:24px;
box-shadow:0 8px 0 var(--tinta);display:grid;grid-auto-flow:column;place-content:center;align-items:center;grid-gap:14px;font-size:40px;white-space:nowrap}
.legenda.ok{background:var(--certo)}
.legenda.no{background:var(--erro)}
.legenda .bola{width:48px;height:48px;border-radius:50%;border:4px solid var(--tinta);display:none;place-items:center}
.legenda.ok .bola{display:grid;background:var(--verde)}
.legenda.no .bola{display:grid;background:var(--vermelho)}

#confete{position:absolute;left:0;top:0;width:100%;height:100%;z-index:3500;pointer-events:none;overflow:hidden}
#confete i{position:absolute;top:-40px;display:block;border:2px solid var(--tinta)}

/* ------------------------------------------------ tela inicial */
.tela{position:absolute;left:0;top:0;width:100%;height:100%;z-index:2000;transition:transform .35s cubic-bezier(.5,0,.3,1),opacity .22s ease}
.tela.saiu{transform:translateY(-9%);opacity:0;pointer-events:none}
.ini-txt{position:absolute;left:76px;top:0;bottom:0;width:56%;display:flex;flex-direction:column;justify-content:center;align-items:flex-start}
#titulo{font-size:120px;line-height:1.1;letter-spacing:-.015em;white-space:nowrap}
#titulo .tag{display:inline-block;line-height:1;background:var(--verde);color:var(--papel);border:.05em solid var(--tinta);border-radius:.2em;box-shadow:0 .075em 0 var(--tinta);padding:.05em .2em .09em;
margin:0 0 .1em .12em;transform:rotate(-3deg)}
#titulo .faixa{display:inline-block;line-height:1;background:var(--papel);border:.05em solid var(--tinta);border-radius:.2em;box-shadow:0 .075em 0 var(--tinta);padding:.07em .2em .11em;
margin-top:.1em;transform:rotate(-1.5deg)}
.bt-g{height:124px;margin-top:54px;padding:0 60px;font-size:60px;border-width:5px;border-radius:30px;box-shadow:0 10px 0 var(--tinta)}
.bt-g:active{transform:translateY(8px);box-shadow:0 2px 0 var(--tinta)}
.resumo{margin-top:30px;font-size:24px;letter-spacing:.06em;opacity:.8}
.ini-topo{position:absolute;right:28px;top:28px;z-index:5;display:grid;grid-auto-flow:column;grid-gap:14px;align-items:center}
.mini{height:64px;padding:0 26px;border-radius:32px;background:var(--papel);border:4px solid var(--tinta);box-shadow:0 5px 0 var(--tinta);font-size:23px;letter-spacing:.06em;
transition:transform .08s,box-shadow .08s}
.mini:active{transform:translateY(4px);box-shadow:0 1px 0 var(--tinta)}
.ini-arte{position:absolute;right:0;top:0;width:44%;height:100%;pointer-events:none}
.ini-boneco{position:absolute;left:50%;top:50%;width:640px;height:1000px;margin:-500px 0 0 -320px;transform:translateY(24px) scale(.82) rotate(4deg)}
.ini-boneco .corpo{position:absolute;left:0;top:0}
.ini-boneco .lg i{animation:none}
.ini-duvida{position:absolute;left:0;top:300px;width:640px;text-align:center;font-size:380px;line-height:1;color:var(--tinta);opacity:.1}
.solto{position:absolute;left:0;top:0;animation:flutua 3.2s ease-in-out infinite}
.solto svg{overflow:visible}
@keyframes flutua{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-16px) rotate(3deg)}}

.contagem{position:absolute;left:0;top:0;width:100%;height:100%;z-index:2500;display:grid;place-items:center;background:rgba(27,29,77,.45)}
.contagem b{font-size:440px;color:var(--papel);-webkit-text-stroke:14px var(--tinta);paint-order:stroke fill;animation:conta .7s cubic-bezier(.2,1.4,.4,1)}
.contagem b.txt{font-size:230px;color:var(--ouro)}
@keyframes conta{0%{transform:scale(.3);opacity:0}45%{transform:scale(1.1);opacity:1}100%{transform:scale(1);opacity:1}}

/* ------------------------------------------------ cartões (ajustes, pausa, resultado) */
.modal{position:absolute;left:0;top:0;width:100%;height:100%;z-index:3000;display:grid;place-items:center;background:rgba(27,29,77,.6)}
.cartao{background:var(--papel);border:5px solid var(--tinta);border-radius:40px;box-shadow:0 14px 0 var(--tinta);padding:44px 56px 50px;text-align:center;
animation:entra .32s cubic-bezier(.2,1.3,.4,1)}
@keyframes entra{0%{transform:scale(.7);opacity:0}100%{transform:scale(1);opacity:1}}
.cartao h2{font-size:58px;letter-spacing:-.01em}
.par{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;grid-gap:22px;margin-top:34px}

.aj{width:1120px;text-align:left}
.aj h2{text-align:center;margin-bottom:26px}
.lin{display:grid;grid-template-columns:170px 1fr;align-items:center;min-height:98px;border-top:4px solid var(--linha)}
.lin .rot{font-size:28px;letter-spacing:.06em}
.chips{display:flex;flex-wrap:wrap;margin:-6px}
.chip{margin:6px;height:66px;padding:0 18px;border:4px solid var(--tinta);border-radius:18px;background:var(--papel);font-size:27px;white-space:nowrap;
display:inline-grid;place-items:center;transition:transform .08s}
.chip:active{transform:scale(.95)}
.chip.on{background:var(--tinta);color:var(--ouro)}
.passo{display:grid;grid-auto-flow:column;justify-content:start;align-items:center;grid-gap:20px}
.passo b{min-width:230px;text-align:center;font-size:52px;white-space:nowrap}
.passo .rd{font-size:44px;line-height:1;padding-bottom:6px}
.obs{font-size:22px;line-height:1.3;letter-spacing:.02em;text-transform:none;font-weight:700;opacity:.75;padding:0 0 16px 170px;margin-top:-8px}
.aj .bt{display:grid;width:100%;margin-top:20px}

.pausa{width:640px}
.pausa .bt{display:grid;width:100%;margin-top:24px}
.pausa .par{margin-top:0}
.pausa .par .bt{font-size:28px;padding:0 10px}

.res{min-width:900px;padding:54px 64px 56px}
.res .acima{font-size:44px;letter-spacing:.04em}
.res h2{font-size:112px;margin-top:22px;white-space:nowrap}
.res h2 .tag{display:inline-block;background:var(--verde);color:var(--papel);border:6px solid var(--tinta);border-radius:26px;box-shadow:0 9px 0 var(--tinta);padding:4px 28px 10px;transform:rotate(-3deg)}
.res .abaixo{font-size:34px;margin-top:30px;letter-spacing:.03em}
.res.perdeu h2{font-size:92px}
.res .par{margin-top:44px}

@media (prefers-reduced-motion:reduce){
.lg i,.solto,#conferir.chama,.relogio.aperto{animation:none}
}
`;
