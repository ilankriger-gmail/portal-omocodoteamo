#!/bin/bash

# Script para build de produção

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Iniciando build de produção...${NC}"

# Configurações
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=4096"

# Verifica se há alterações não commitadas
git_status=$(git status --porcelain)
if [ -n "$git_status" ]; then
  echo -e "${YELLOW}⚠️  Há alterações não commitadas no repositório:${NC}"
  git status --short

  read -p "Deseja continuar mesmo assim? (s/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${RED}Build cancelado.${NC}"
    exit 1
  fi
fi

echo -e "${YELLOW}Instalando dependências...${NC}"
npm ci || npm install

echo -e "${YELLOW}Executando Prisma Generate...${NC}"
npx prisma generate

echo -e "${YELLOW}Construindo aplicação...${NC}"
npm run build

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Build concluído com sucesso!${NC}"
  echo -e "Agora você pode:
  - Executar o servidor: ${YELLOW}npm run start${NC}
  - Configurar no seu servidor web (Nginx/Apache)
  - Fazer deploy na sua plataforma"
else
  echo -e "${RED}❌ Erro durante o build. Verifique os erros acima.${NC}"
  exit 1
fi