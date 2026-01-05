import * as cheerio from "cheerio";

interface ScrapedData {
  titulo: string | null;
  descricao: string | null;
  imagemUrl: string | null;
  chavePix: string | null;
  meta: number | null;
  valorAtual: number | null;
  doacoes: number | null;
  coracoes: number | null;
}

export async function scrapeVakinha(url: string): Promise<ScrapedData> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Título - tentar diferentes seletores
    const titulo =
      $('meta[property="og:title"]').attr("content") ||
      $("h1").first().text().trim() ||
      $(".campaign-title").text().trim() ||
      null;

    // Descrição
    const descricao =
      $('meta[property="og:description"]').attr("content") ||
      $(".campaign-description").text().trim() ||
      $('meta[name="description"]').attr("content") ||
      null;

    // Imagem
    const imagemUrl =
      $('meta[property="og:image"]').attr("content") ||
      $(".campaign-image img").attr("src") ||
      null;

    // Valores - tentar extrair do texto
    let meta: number | null = null;
    let valorAtual: number | null = null;

    // Buscar por padrões de valor no HTML
    const textoCompleto = $("body").text();

    // Primeiro, tentar encontrar meta com padrão "meta de R$" ou "Meta: R$"
    const metaPattern = /meta[^R$]*R\$\s*([\d.]+,\d{2})/i;
    const metaMatch = textoCompleto.match(metaPattern);
    if (metaMatch) {
      meta = parseFloat(metaMatch[1].replace(/\./g, "").replace(",", "."));
    }

    // Tentar encontrar valor arrecadado com padrão "arrecadado" ou similar
    const arrecadadoPatterns = [
      /arrecadad[oa][^R$]*R\$\s*([\d.]+,\d{2})/i,
      /R\$\s*([\d.]+,\d{2})[^<]*arrecadad/i,
      /já\s+arrecadou[^R$]*R\$\s*([\d.]+,\d{2})/i,
    ];

    for (const pattern of arrecadadoPatterns) {
      const arrecMatch = textoCompleto.match(pattern);
      if (arrecMatch) {
        valorAtual = parseFloat(arrecMatch[1].replace(/\./g, "").replace(",", "."));
        break;
      }
    }

    // Se não encontrou com padrões específicos, usar lógica de valores
    if (meta === null || valorAtual === null) {
      const valorPattern = /R\$\s*([\d.]+,\d{2})/g;
      const valores: number[] = [];
      let match;
      while ((match = valorPattern.exec(textoCompleto)) !== null) {
        const val = parseFloat(match[1].replace(/\./g, "").replace(",", "."));
        if (val > 0 && val < 100000000) {
          valores.push(val);
        }
      }

      // Remover duplicatas e ordenar
      const valoresUnicos = Array.from(new Set(valores)).sort((a, b) => b - a);

      if (valoresUnicos.length >= 2) {
        // A meta geralmente é um número "redondo" (termina em 000)
        const metaCandidata = valoresUnicos.find(v => v % 1000 === 0) || valoresUnicos[0];
        const arrecadadoCandidato = valoresUnicos.find(v => v !== metaCandidata) || valoresUnicos[1];

        if (meta === null) meta = metaCandidata;
        if (valorAtual === null) valorAtual = arrecadadoCandidato;
      } else if (valoresUnicos.length === 1) {
        if (meta === null) meta = valoresUnicos[0];
      }
    }

    // Tentar seletores específicos do vakinha.com.br (sobrescreve se encontrar)
    const metaText = $(".goal-value, .meta-value, [data-goal]").first().text();
    const arrecadadoText = $(".raised-value, .valor-arrecadado, [data-raised]").first().text();

    if (metaText) {
      const metaMatchCSS = metaText.match(/[\d.,]+/);
      if (metaMatchCSS) {
        meta = parseFloat(metaMatchCSS[0].replace(/\./g, "").replace(",", "."));
      }
    }

    if (arrecadadoText) {
      const arrecMatch = arrecadadoText.match(/[\d.,]+/);
      if (arrecMatch) {
        valorAtual = parseFloat(arrecMatch[0].replace(/\./g, "").replace(",", "."));
      }
    }

    // Extrair número de doações/apoiadores
    let doacoes: number | null = null;
    const doacoesPatterns = [
      /(\d+)\s*(?:apoiador(?:es)?|doa[çc][ãa]o|doa[çc][õo]es|pessoas?\s+(?:j[áa]\s+)?(?:apoiaram|doaram|contribu[íi]ram))/i,
      /(?:apoiador(?:es)?|doa[çc][ãa]o|doa[çc][õo]es)[^0-9]*(\d+)/i,
      /(\d+)\s*(?:pessoas?\s+)?(?:j[áa]\s+)?(?:apoiaram|doaram|contribu[íi]ram)/i,
    ];

    for (const pattern of doacoesPatterns) {
      const doacoesMatch = textoCompleto.match(pattern);
      if (doacoesMatch?.[1]) {
        const num = parseInt(doacoesMatch[1], 10);
        if (num > 0 && num < 1000000) {
          doacoes = num;
          break;
        }
      }
    }

    // Extrair número de corações/curtidas
    let coracoes: number | null = null;
    const coracoesPatterns = [
      /(\d+)\s*(?:cora[çc][ãa]o|cora[çc][õo]es|curtida?s?|like?s?|♥|❤)/i,
      /(?:cora[çc][ãa]o|cora[çc][õo]es|curtida?s?|like?s?|♥|❤)[^0-9]*(\d+)/i,
    ];

    for (const pattern of coracoesPatterns) {
      const coracoesMatch = textoCompleto.match(pattern);
      if (coracoesMatch?.[1]) {
        const num = parseInt(coracoesMatch[1], 10);
        if (num > 0 && num < 10000000) {
          coracoes = num;
          break;
        }
      }
    }

    // Tentar seletores específicos do vakinha.com.br para doações e corações
    const apoiadoresText = $(".supporters-count, .apoiadores, [data-supporters]").first().text();
    const coracoesText = $(".hearts-count, .coracoes, [data-hearts], .likes-count").first().text();

    if (apoiadoresText) {
      const apoMatch = apoiadoresText.match(/(\d+)/);
      if (apoMatch) {
        doacoes = parseInt(apoMatch[1], 10);
      }
    }

    if (coracoesText) {
      const corMatch = coracoesText.match(/(\d+)/);
      if (corMatch) {
        coracoes = parseInt(corMatch[1], 10);
      }
    }

    // Extrair chave PIX
    let chavePix: string | null = null;
    const pixPatterns = [
      // Chave aleatória (UUID)
      /(?:pix|chave)[^a-z0-9]*([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
      // CPF
      /(?:pix|chave)[^0-9]*(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/i,
      // CNPJ
      /(?:pix|chave)[^0-9]*(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})/i,
      // Email próximo de PIX
      /(?:pix|chave)[^a-z0-9]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
      // Telefone
      /(?:pix|chave)[^0-9]*(\+?55?\s?\d{2}\s?\d{4,5}-?\d{4})/i,
    ];

    for (const pattern of pixPatterns) {
      const pixMatch = textoCompleto.match(pattern);
      if (pixMatch?.[1]) {
        // Limpar palavras indesejadas que podem ser capturadas junto
        chavePix = pixMatch[1]
          .replace(/copiar?/gi, "")
          .replace(/copiado/gi, "")
          .replace(/copia/gi, "")
          .replace(/copy/gi, "")
          .trim();
        if (chavePix) break;
      }
    }

    return {
      titulo,
      descricao,
      imagemUrl,
      chavePix,
      meta,
      valorAtual,
      doacoes,
      coracoes,
    };
  } catch (error) {
    console.error("Erro ao fazer scraping:", error);
    throw error;
  }
}
