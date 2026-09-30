import type { AgregadorDados } from "./dados";
import { PLATAFORMAS } from "./icons";

export const AGREGADOR_URL = "https://links.omocodoteamo.com.br";

function esc(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Defesa extra: só esquemas seguros chegam ao href (bloqueia javascript:, data:, etc).
function hrefSeguro(url: string): string {
  return /^(https?:|mailto:|tel:)/i.test(url.trim()) ? esc(url.trim()) : "#";
}

// Pede ao Cloudinary a foto já recortada no rosto, no tamanho certo e em WebP/AVIF.
function otimizarAvatar(url: string): string {
  const marcador = "/image/upload/";
  if (!url.includes("res.cloudinary.com") || !url.includes(marcador)) return url;
  return url.replace(marcador, `${marcador}c_fill,g_face,w_336,h_336,f_auto,q_auto/`);
}

function iniciais(nome: string): string {
  return nome
    .split(/\s+/)
    .filter((p) => p.length > 2)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("") || "M";
}

const CSS = `
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{margin:0;min-height:100vh;min-height:100svh;background:#0b0b10;color:#f4f4f6;
font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent;
background-image:radial-gradient(60rem 26rem at 50% -8rem,rgba(236,72,153,.20),transparent 70%),
radial-gradient(40rem 22rem at 10% -4rem,rgba(245,158,11,.14),transparent 70%),
radial-gradient(40rem 22rem at 90% -2rem,rgba(124,58,237,.16),transparent 70%);background-repeat:no-repeat}
.wrap{width:100%;max-width:34rem;margin:0 auto;min-height:100vh;min-height:100svh;display:flex;flex-direction:column;
padding:calc(2.75rem + env(safe-area-inset-top)) 1.25rem calc(1.5rem + env(safe-area-inset-bottom))}
header{display:flex;flex-direction:column;align-items:center;text-align:center}
.ring{width:7.5rem;height:7.5rem;border-radius:50%;padding:3px;
background:conic-gradient(from 210deg,#f59e0b,#ef4444,#d946ef,#7c3aed,#f59e0b)}
.ring>*{width:100%;height:100%;border-radius:50%;border:3px solid #0b0b10;display:block;object-fit:cover;background:#1c1c24}
.ini{display:flex!important;align-items:center;justify-content:center;font-size:2.25rem;font-weight:800;color:#fff}
h1{font-size:1.4rem;line-height:1.2;font-weight:800;letter-spacing:-.01em;margin:1rem 0 0}
.bio{margin:.5rem 0 0;max-width:36ch;font-size:.97rem;line-height:1.5;color:#b9b9c4;white-space:pre-line}
main{margin-top:2rem}
ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.8rem}
.btn{position:relative;display:flex;align-items:center;justify-content:center;min-height:3.6rem;padding:.9rem 3rem;
border-radius:1rem;text-decoration:none;text-align:center;color:#f4f4f6;font-size:1rem;font-weight:650;line-height:1.3;
background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);
transition:transform .15s ease,background-color .2s ease,border-color .2s ease}
.btn::after{content:"";position:absolute;right:1.25rem;top:50%;width:.5rem;height:.5rem;margin-top:-.25rem;
border-top:2px solid currentColor;border-right:2px solid currentColor;transform:rotate(45deg);opacity:.45}
.btn:hover{background:rgba(255,255,255,.11);border-color:rgba(255,255,255,.2)}
.btn:active{transform:scale(.975)}
.btn:focus-visible,.soc a:focus-visible{outline:3px solid #fbbf24;outline-offset:3px}
.dst{border:0;font-size:1.06rem;font-weight:750;color:#fff;
background:linear-gradient(100deg,#c2410c 0%,#be185d 50%,#6d28d9 100%);
box-shadow:0 10px 30px -12px rgba(190,24,93,.7)}
.dst:hover{background:linear-gradient(100deg,#c2410c 0%,#be185d 50%,#6d28d9 100%);filter:brightness(1.08)}
.dst::after{opacity:.8}
.vazio{text-align:center;color:#8b8b96;font-size:.95rem}
footer{margin-top:auto;padding-top:2.75rem;display:flex;flex-direction:column;align-items:center;gap:1.25rem}
.soc{display:flex;flex-direction:row;flex-wrap:wrap;justify-content:center;gap:.6rem;list-style:none;margin:0;padding:0}
.soc a{display:flex;align-items:center;justify-content:center;width:3rem;height:3rem;border-radius:50%;color:#f4f4f6;
background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);transition:transform .15s ease,background-color .2s ease}
.soc a:hover{background:rgba(255,255,255,.14)}
.soc a:active{transform:scale(.92)}
.soc svg{width:1.35rem;height:1.35rem;fill:currentColor}
.cred{font-size:.78rem;color:#7a7a86;text-decoration:none}
.cred:hover{color:#b9b9c4}
@media (prefers-reduced-motion:no-preference){
header,main li,footer{animation:sobe .5s cubic-bezier(.2,.7,.2,1) both}
main li{animation-delay:calc(.06s + var(--i,0) * .045s)}
footer{animation-delay:.3s}
@keyframes sobe{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
}`;

export function renderAgregador(d: AgregadorDados): string {
  const avatar = d.avatarUrl
    ? `<img src="${esc(otimizarAvatar(d.avatarUrl))}" alt="Foto de ${esc(d.nome)}" width="120" height="120" fetchpriority="high" decoding="async">`
    : `<span class="ini" aria-hidden="true">${esc(iniciais(d.nome))}</span>`;

  const links = d.links.length
    ? `<ul>${d.links
        .map(
          (l, i) =>
            `<li style="--i:${i}"><a class="btn${l.destaque ? " dst" : ""}" href="${hrefSeguro(l.url)}" data-l="${esc(l.titulo)}" rel="noopener">${esc(l.titulo)}</a></li>`
        )
        .join("")}</ul>`
    : `<p class="vazio">Novidades em breve ✨</p>`;

  const redes = d.redes.length
    ? `<ul class="soc">${d.redes
        .map((r) => {
          const p = PLATAFORMAS[r.plataforma];
          return `<li><a href="${hrefSeguro(r.url)}" aria-label="${esc(p.nome)}" title="${esc(p.nome)}" data-l="rede:${esc(p.nome)}" rel="noopener me"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${p.path}"/></svg></a></li>`;
        })
        .join("")}</ul>`
    : "";

  const descricao = d.bio || `Links oficiais de ${d.nome}.`;
  const ogImagem = d.avatarUrl ? `<meta property="og:image" content="${esc(otimizarAvatar(d.avatarUrl))}">` : "";

  // Google Analytics só é carregado se configurado no admin; fica assíncrono e
  // não bloqueia a página. Cada clique vira o evento "clique_link" no GA.
  const ga =
    d.gaId && /^G-[A-Z0-9]+$/.test(d.gaId)
      ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${d.gaId}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","${d.gaId}");
document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[data-l]");if(a)gtag("event","clique_link",{link_titulo:a.getAttribute("data-l"),link_url:a.href,transport_type:"beacon"})});</script>`
      : "";

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(d.nome)} | Links oficiais</title>
<meta name="description" content="${esc(descricao)}">
<meta name="theme-color" content="#0b0b10">
<meta name="color-scheme" content="dark">
<link rel="canonical" href="${AGREGADOR_URL}">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<meta property="og:type" content="profile">
<meta property="og:locale" content="pt_BR">
<meta property="og:url" content="${AGREGADOR_URL}">
<meta property="og:title" content="${esc(d.nome)}">
<meta property="og:description" content="${esc(descricao)}">
${ogImagem}
<meta name="twitter:card" content="summary">
<style>${CSS}</style>
${ga}
</head>
<body>
<div class="wrap">
<header>
<div class="ring">${avatar}</div>
<h1>${esc(d.nome)}</h1>
${d.bio ? `<p class="bio">${esc(d.bio)}</p>` : ""}
</header>
<main>${links}</main>
<footer>
${redes}
<a class="cred" href="https://portal.omocodoteamo.com.br">portal.omocodoteamo.com.br</a>
</footer>
</div>
</body>
</html>`;
}
