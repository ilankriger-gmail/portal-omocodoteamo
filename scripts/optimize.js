/**
 * Script para otimizar imagens para produção
 * Execute com: node scripts/optimize.js
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Diretório de imagens públicas
const PUBLIC_DIR = path.join(__dirname, '../public');

// Função para verificar se um arquivo é uma imagem
const isImageFile = (filename) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(filename).toLowerCase();
  return imageExtensions.includes(ext);
};

// Função para otimizar imagens usando o comando imagemin (requer imagemin-cli instalado)
const optimizeImages = () => {
  // Verifica se existem imagens no diretório público
  if (!fs.existsSync(PUBLIC_DIR)) {
    console.log('Diretório público não encontrado');
    return;
  }

  // Conta as imagens
  let imageCount = 0;

  const processDirectory = (dir) => {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        processDirectory(filePath);
      } else if (isImageFile(file)) {
        imageCount++;
        console.log(`Imagem encontrada: ${filePath}`);
      }
    });
  };

  processDirectory(PUBLIC_DIR);

  if (imageCount === 0) {
    console.log('Nenhuma imagem encontrada no diretório público');
    return;
  }

  console.log(`Total de ${imageCount} imagens encontradas`);
  console.log('Para otimizar as imagens, instale o imagemin-cli:');
  console.log('npm install -g imagemin-cli imagemin-jpegtran imagemin-pngquant');
  console.log('\nEntão execute:');
  console.log('imagemin public/**/*.{jpg,png,jpeg} --out-dir=public/optimized');
};

// Executar a função
optimizeImages();