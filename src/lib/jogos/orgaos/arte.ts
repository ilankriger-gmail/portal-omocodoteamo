// Arte do jogo "Órgãos no lugar certo": o boneco e os órgãos, desenhados em SVG
// na mão para a página não depender de nenhum arquivo externo.
//
// Tudo usa a mesma régua: as unidades do desenho do corpo (640 x 1000). O tamanho
// de cada órgão e a posição de cada lugar estão nessa régua.

export const TINTA = "#1b1d4d";

export const CORPO_LARGURA = 640;
export const CORPO_ALTURA = 1000;

const n = (v: number) => Math.round(v * 10) / 10;

/** Monta o SVG de um órgão em camadas, já com a sombra dura por baixo. */
class Arte {
  private sombra: string[] = [];
  private camadas: string[] = [];

  /** Forma fechada e preenchida, com contorno. */
  forma(d: string, cor: string, contorno = 5): this {
    this.sombra.push(`<path d="${d}" fill="${TINTA}" stroke="${TINTA}" stroke-width="${contorno}"/>`);
    this.camadas.push(`<path d="${d}" fill="${cor}" stroke="${TINTA}" stroke-width="${contorno}"/>`);
    return this;
  }

  /** Tubo: um traço grosso com contorno (vasos, esôfago, intestino). */
  tubo(d: string, largura: number, cor: string, contorno = 4.5): this {
    this.sombra.push(`<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="${largura}"/>`);
    this.camadas.push(
      `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="${largura}"/>` +
        `<path d="${d}" fill="none" stroke="${cor}" stroke-width="${n(largura - contorno * 2)}"/>`
    );
    return this;
  }

  /** Linha de detalhe por cima. */
  traco(d: string, cor: string, largura = 3.5, opacidade = 1): this {
    this.camadas.push(
      `<path d="${d}" fill="none" stroke="${cor}" stroke-width="${largura}"${opacidade < 1 ? ` opacity="${opacidade}"` : ""}/>`
    );
    return this;
  }

  /** Mancha sem contorno (brilho). */
  mancha(d: string, cor: string, opacidade = 1): this {
    this.camadas.push(`<path d="${d}" fill="${cor}" stroke="none"${opacidade < 1 ? ` opacity="${opacidade}"` : ""}/>`);
    return this;
  }

  bruto(svg: string): this {
    this.camadas.push(svg);
    return this;
  }

  svg(w: number, h: number): string {
    return (
      `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">` +
      `<g class="sb">${this.sombra.join("")}</g>${this.camadas.join("")}</svg>`
    );
  }
}

/** Contorno "de nuvem": liga os pontos (em sentido horário) com arcos para fora. */
function bolhas(pontos: [number, number][], curvatura = 0.62): string {
  let d = `M${n(pontos[0][0])},${n(pontos[0][1])}`;
  for (let i = 1; i <= pontos.length; i++) {
    const [x0, y0] = pontos[i - 1];
    const [x1, y1] = pontos[i % pontos.length];
    const r = n(Math.hypot(x1 - x0, y1 - y0) * curvatura);
    d += ` A${r},${r} 0 0 1 ${n(x1)},${n(y1)}`;
  }
  return d + " Z";
}

// ---------------------------------------------------------------- órgãos

function cerebro(): string {
  const cx = 66;
  const cy = 46;
  const rx = 53;
  const ry = 37;
  // Meia volta pela direita (de cima para baixo), depois espelha para a esquerda.
  const angulos = [-90, -52, -16, 20, 56, 90];
  const direita: [number, number][] = angulos.map((g, i) => {
    const a = (g * Math.PI) / 180;
    // As pontas de cima e de baixo entram um pouco: é o sulco entre os dois lados.
    const entra = i === 0 || i === angulos.length - 1 ? 6 : 0;
    return [cx + rx * Math.cos(a), cy + (ry - entra) * Math.sin(a)];
  });
  const esquerda = direita
    .slice(1, -1)
    .reverse()
    .map(([x, y]) => [2 * cx - x, y] as [number, number]);
  const contorno = bolhas([...direita, ...esquerda]);

  const giros =
    "M80,20 q11,5 6,15 q-5,9 5,13 M96,36 q8,6 2,14 M78,54 q10,2 12,12 M98,62 q-6,6 -14,4 M74,34 q-6,6 0,12";
  return new Arte()
    .tubo("M66,80 V95", 20, "#f08fb1")
    .forma(contorno, "#f7a9c6")
    .mancha("M30,26 q10,-12 26,-13 q-4,6 -12,9 q-9,4 -14,4 Z", "#fcd3e2", 0.9)
    .traco("M66,13 C62,30 70,52 66,78", "#c9588a", 3.5)
    .traco(giros, "#d9749f", 3.2)
    .bruto(`<g transform="translate(132 0) scale(-1 1)"><path d="${giros}" fill="none" stroke="#d9749f" stroke-width="3.2"/></g>`)
    .svg(132, 104);
}

// Pulmão do lado esquerdo de quem olha; o outro é este espelhado.
function pulmao(): string {
  return new Arte()
    .tubo("M118,92 C130,84 138,72 142,58", 20, "#f6c9bd")
    .forma(
      "M98,8 C62,10 30,58 16,118 C8,158 6,190 20,200 C34,209 62,196 92,182 C110,173 126,170 134,160 C142,150 132,122 132,98 C132,72 136,52 128,32 C122,16 112,8 98,8 Z",
      "#f7969d"
    )
    .mancha("M84,24 C60,36 40,70 30,108 C44,80 62,50 90,34 Z", "#fcc5c6", 0.85)
    .traco("M120,92 C104,104 88,122 76,150", "#cf5767", 4.5)
    .traco("M103,107 C92,96 78,90 62,90 M92,121 C104,128 112,140 114,154 M84,134 C70,132 56,138 44,150 M76,150 C74,162 66,172 56,178", "#cf5767", 3.6)
    .svg(150, 210);
}

function coracao(): string {
  return new Arte()
    .tubo("M32,62 C30,44 30,28 32,12", 19, "#4c8fe6")
    .tubo("M62,60 C58,34 66,16 84,15 C100,14 108,26 108,42", 23, "#ec5560")
    .tubo("M74,17 L72,6", 11, "#ec5560", 3.5)
    .tubo("M90,15 L93,5", 11, "#ec5560", 3.5)
    .tubo("M78,62 C74,48 62,40 46,38", 17, "#4c8fe6")
    .forma(
      "M30,58 C10,66 4,90 14,108 C26,128 58,139 80,134 C104,128 120,104 116,80 C114,64 104,54 90,54 C76,54 68,61 58,59 C48,55 38,54 30,58 Z",
      "#e2343f"
    )
    .mancha("M22,74 C26,64 38,62 46,66 C36,70 28,80 26,94 C20,90 19,82 22,74 Z", "#f6858a", 0.9)
    .traco("M60,60 C62,86 70,110 82,130 M66,90 C76,92 86,88 94,80", "#a11325", 3.5)
    .svg(125, 140);
}

function figado(): string {
  return new Arte()
    .forma(
      "M18,62 C10,30 50,8 110,8 C160,8 204,24 222,44 C230,54 224,66 210,66 C184,66 162,76 142,90 C118,108 86,120 56,116 C30,112 22,88 18,62 Z",
      "#a94a31"
    )
    .mancha("M36,48 C46,28 78,18 112,18 C84,24 60,34 46,58 Z", "#cf7558", 0.85)
    .traco("M150,11 C146,38 140,62 134,94", "#6c2513", 3.6)
    .svg(230, 125);
}

function estomago(): string {
  const cor = "#f6a66f";
  return new Arte()
    .tubo("M46,6 C46,22 48,34 56,46", 23, cor)
    .tubo("M36,110 C24,110 14,102 9,90", 23, cor)
    .forma(
      "M42,44 C44,22 70,6 96,14 C122,22 134,52 128,78 C122,108 96,130 64,128 C44,126 30,121 22,111 C18,104 22,97 30,97 C44,97 58,87 58,69 C58,57 48,53 42,44 Z",
      cor
    )
    .mancha("M62,30 C72,20 90,18 102,26 C88,26 76,32 68,44 Z", "#fcd0ab", 0.9)
    .traco("M88,40 C106,52 110,76 98,98 M72,54 C84,64 86,82 76,102", "#cc6d36", 3.4)
    .svg(135, 135);
}

// Rim do lado esquerdo de quem olha (a parte funda fica virada para o meio do corpo).
function rim(): string {
  return new Arte()
    .tubo("M56,66 C66,74 70,92 70,112", 13, "#f3d58c", 3.5)
    .tubo("M56,50 L76,44", 11, "#ec5560", 3.5)
    .tubo("M58,62 L76,60", 11, "#4c8fe6", 3.5)
    .forma(
      "M42,6 C18,6 6,32 6,60 C6,90 20,114 42,114 C62,114 70,98 64,84 C60,74 52,70 52,60 C52,50 60,46 64,36 C70,22 62,6 42,6 Z",
      "#b3364c"
    )
    .mancha("M20,36 C24,22 34,16 44,16 C34,22 26,34 24,52 Z", "#e07a8a", 0.85)
    .traco("M30,34 C22,50 22,72 30,88", "#7d1a2f", 3.2, 0.7)
    .svg(80, 120);
}

function intestino(): string {
  const grosso = "#e79b7c";
  const fino = "#f8b7b2";
  const marcas: string[] = [];
  // Marquinhas do intestino grosso (as "dobras").
  for (const y of [78, 104, 130, 156]) marcas.push(`M14,${y} h11`, `M236,${y - 12} h-11`);
  for (const x of [72, 100, 128, 156, 184]) marcas.push(`M${x},8 v11`);
  return new Arte()
    .tubo(
      "M68,64 H172 Q186,64 186,78 Q186,92 172,92 H80 Q66,92 66,106 Q66,120 80,120 H172 Q186,120 186,134 Q186,148 172,148 H50",
      25,
      fino
    )
    .tubo("M32,172 V58 Q32,26 64,26 H186 Q218,26 218,58 V146 Q218,176 188,176 H152 Q128,176 127,194", 40, grosso)
    .traco(marcas.join(" "), "#b25c3f", 3.4)
    .svg(250, 200);
}

function bexiga(): string {
  return new Arte()
    .tubo("M14,7 C16,18 22,26 30,32", 11, "#f3d58c", 3.5)
    .tubo("M86,7 C84,18 78,26 70,32", 11, "#f3d58c", 3.5)
    .tubo("M50,76 V88", 16, "#ffd24a", 4)
    .forma("M50,18 C78,18 92,36 90,54 C88,72 70,84 50,84 C30,84 12,72 10,54 C8,36 22,18 50,18 Z", "#ffd24a")
    .mancha("M24,42 C28,32 38,26 48,26 C38,32 32,40 30,52 Z", "#fff0b0", 0.95)
    .svg(100, 95);
}

function baco(): string {
  return new Arte()
    .tubo("M24,50 L7,54", 10, "#ec5560", 3.5)
    .tubo("M24,62 L7,68", 10, "#4c8fe6", 3.5)
    .forma(
      "M40,6 C60,8 70,34 68,58 C66,82 52,100 34,98 C20,96 14,84 20,70 C26,58 28,50 22,38 C16,24 22,6 40,6 Z",
      "#9150b6"
    )
    .mancha("M46,18 C56,26 60,42 58,58 C54,42 50,30 40,22 Z", "#c391dd", 0.85)
    .svg(75, 105);
}

function pancreas(): string {
  const contorno = bolhas(
    [
      [14, 32],
      [30, 13],
      [52, 11],
      [72, 19],
      [92, 21],
      [112, 17],
      [132, 13],
      [152, 11],
      [168, 17],
      [158, 31],
      [138, 35],
      [118, 39],
      [98, 43],
      [78, 45],
      [60, 53],
      [44, 62],
      [26, 60],
      [12, 48],
    ],
    0.6
  );
  return new Arte()
    .forma(contorno, "#f3c95c")
    .traco("M30,38 C62,42 112,30 158,22", "#c2902a", 3.4)
    .svg(175, 70);
}

function vesicula(): string {
  return new Arte()
    .tubo("M38,24 C42,16 48,10 52,6", 12, "#6ec272", 3.5)
    .forma("M38,20 C46,24 56,44 54,62 C52,78 42,86 30,86 C16,86 8,74 10,58 C12,42 26,24 38,20 Z", "#57b65b")
    .mancha("M22,52 C24,42 30,34 36,30 C32,40 28,50 28,62 Z", "#a9e3a4", 0.9)
    .svg(65, 90);
}

function apendice(): string {
  return new Arte()
    .forma(
      "M26,10 C26,4 50,4 50,10 C54,30 46,50 37,64 C33,71 33,77 31,83 C27,90 14,88 16,78 C18,64 26,52 28,40 C30,28 27,20 26,10 Z",
      "#e79b7c"
    )
    .mancha("M33,14 C35,26 34,40 28,54 C36,42 40,28 39,14 Z", "#f6c7b0", 0.85)
    .svg(60, 90);
}

export type TipoOrgao =
  | "cerebro"
  | "pulmao"
  | "coracao"
  | "figado"
  | "estomago"
  | "rim"
  | "intestino"
  | "bexiga"
  | "baco"
  | "pancreas"
  | "vesicula"
  | "apendice";

export type Orgao = { nome: string; plural?: string; w: number; h: number; svg: string };

export const ORGAOS: Record<TipoOrgao, Orgao> = {
  cerebro: { nome: "Cérebro", w: 132, h: 104, svg: cerebro() },
  pulmao: { nome: "Pulmão", plural: "Pulmões", w: 150, h: 210, svg: pulmao() },
  coracao: { nome: "Coração", w: 125, h: 140, svg: coracao() },
  figado: { nome: "Fígado", w: 230, h: 125, svg: figado() },
  estomago: { nome: "Estômago", w: 135, h: 135, svg: estomago() },
  rim: { nome: "Rim", plural: "Rins", w: 80, h: 120, svg: rim() },
  intestino: { nome: "Intestino", w: 250, h: 200, svg: intestino() },
  bexiga: { nome: "Bexiga", w: 100, h: 95, svg: bexiga() },
  baco: { nome: "Baço", w: 75, h: 105, svg: baco() },
  pancreas: { nome: "Pâncreas", w: 175, h: 70, svg: pancreas() },
  vesicula: { nome: "Vesícula", w: 65, h: 90, svg: vesicula() },
  apendice: { nome: "Apêndice", w: 60, h: 90, svg: apendice() },
};

// ---------------------------------------------------------------- lugares

/**
 * Cada lugar é um ponto no corpo (centro do órgão). O boneco está de frente:
 * o lado direito DELE fica à esquerda de quem olha. Por isso o fígado está à
 * esquerda na tela e o coração, estômago e baço à direita.
 * `vira` espelha o desenho dos órgãos que existem em par.
 */
export type Lugar = { id: string; tipo: TipoOrgao; x: number; y: number; vira?: boolean };

export const LUGARES: Lugar[] = [
  { id: "cerebro", tipo: "cerebro", x: 320, y: 84 },
  { id: "pulmao-a", tipo: "pulmao", x: 196, y: 372 },
  { id: "pulmao-b", tipo: "pulmao", x: 444, y: 372, vira: true },
  { id: "coracao", tipo: "coracao", x: 338, y: 410 },
  { id: "figado", tipo: "figado", x: 232, y: 550 },
  { id: "estomago", tipo: "estomago", x: 392, y: 566 },
  { id: "baco", tipo: "baco", x: 494, y: 562 },
  { id: "vesicula", tipo: "vesicula", x: 246, y: 642 },
  { id: "pancreas", tipo: "pancreas", x: 362, y: 668 },
  { id: "rim-a", tipo: "rim", x: 154, y: 704 },
  { id: "rim-b", tipo: "rim", x: 486, y: 704, vira: true },
  { id: "intestino", tipo: "intestino", x: 320, y: 782 },
  { id: "apendice", tipo: "apendice", x: 198, y: 852 },
  { id: "bexiga", tipo: "bexiga", x: 320, y: 908 },
];

/** Níveis: cada um acrescenta lugares ao anterior. */
export const NIVEIS: { id: string; nome: string; lugares: string[] }[] = [
  { id: "facil", nome: "Fácil", lugares: ["cerebro", "pulmao-a", "pulmao-b", "coracao", "estomago", "intestino"] },
  {
    id: "medio",
    nome: "Médio",
    lugares: ["cerebro", "pulmao-a", "pulmao-b", "coracao", "figado", "estomago", "rim-a", "rim-b", "intestino", "bexiga"],
  },
  {
    id: "dificil",
    nome: "Difícil",
    lugares: [
      "cerebro",
      "pulmao-a",
      "pulmao-b",
      "coracao",
      "figado",
      "estomago",
      "baco",
      "pancreas",
      "rim-a",
      "rim-b",
      "intestino",
      "bexiga",
    ],
  },
  { id: "expert", nome: "Expert", lugares: LUGARES.map((l) => l.id) },
];

// ---------------------------------------------------------------- corpo

const SILHUETA =
  "M286,196 L286,224 C286,242 262,251 226,257 L150,269 C108,277 84,301 84,345 L92,470 C98,540 110,600 112,650 " +
  "C112,700 92,760 88,820 L90,992 L298,992 C300,972 306,962 320,958 C334,962 340,972 342,992 L550,992 L552,820 " +
  "C548,760 528,700 528,650 C530,600 542,540 548,470 L556,345 C556,301 532,277 490,269 L414,257 C378,251 354,242 354,224 L354,196 Z";

function costelas(): string {
  const linhas: string[] = [];
  for (let i = 0; i < 5; i++) {
    const y = 318 + i * 36;
    const abre = 150 + i * 10;
    linhas.push(`M308,${y} C${308 - abre * 0.4},${y - 12} ${308 - abre * 0.8},${y - 2} ${308 - abre},${y + 26}`);
    linhas.push(`M332,${y} C${332 + abre * 0.4},${y - 12} ${332 + abre * 0.8},${y - 2} ${332 + abre},${y + 26}`);
  }
  return linhas.join(" ");
}

/** O boneco: cabeça com carinha, pescoço e tronco. Fica por baixo de tudo. */
export function corpoSvg(): string {
  const detalhe = "#dfe3f8";
  return (
    `<svg class="corpo" viewBox="0 0 ${CORPO_LARGURA} ${CORPO_ALTURA}" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">` +
    // sombra dura
    `<g transform="translate(0 12)" fill="${TINTA}" stroke="${TINTA}" stroke-width="7" opacity=".16">` +
    `<path d="${SILHUETA}"/><ellipse cx="320" cy="104" rx="86" ry="100"/></g>` +
    // orelhas, tronco e cabeça
    `<g fill="#fff" stroke="${TINTA}" stroke-width="7">` +
    `<ellipse cx="236" cy="118" rx="14" ry="22"/><ellipse cx="404" cy="118" rx="14" ry="22"/>` +
    `<path d="${SILHUETA}"/><ellipse cx="320" cy="104" rx="86" ry="100"/></g>` +
    // junção do pescoço com a cabeça sem linha no meio
    `<path d="M292,190 H348 V214 H292 Z" fill="#fff"/>` +
    // detalhes clarinhos
    `<g fill="none" stroke="${detalhe}" stroke-width="5">` +
    `<path d="M300,292 C276,278 250,276 226,284 M340,292 C364,278 390,276 414,284"/>` +
    `<path d="M320,300 V470"/><path d="${costelas()}"/>` +
    `<path d="M124,842 C170,872 232,912 292,950 M516,842 C470,872 408,912 348,950"/>` +
    `<path d="M312,742 q8,8 16,0"/></g>` +
    // carinha
    `<g class="cara"><g fill="${TINTA}"><circle class="olho" cx="292" cy="156" r="6.5"/><circle class="olho" cx="348" cy="156" r="6.5"/></g>` +
    `<path class="boca" d="M303,176 Q320,190 337,176" fill="none" stroke="${TINTA}" stroke-width="5"/></g>` +
    `</svg>`
  );
}
