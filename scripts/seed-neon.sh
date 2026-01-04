#!/bin/bash
# Script para executar o seed diretamente no banco de dados Neon

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Iniciando seed no banco de dados Neon...${NC}"

# Verificar se a variável DATABASE_URL está definida
if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}Erro: Variável DATABASE_URL não definida${NC}"
  echo -e "${YELLOW}Utilizando valor do arquivo .env.production${NC}"

  # Extrair DATABASE_URL do arquivo .env.production
  if [ -f ".env.production" ]; then
    export $(grep -v '^#' .env.production | grep DATABASE_URL)
  else
    echo -e "${RED}Erro: Arquivo .env.production não encontrado${NC}"
    exit 1
  fi
fi

echo -e "${YELLOW}Executando seed no banco: ${DATABASE_URL}${NC}"

# Executar o schema push para garantir que as tabelas existam
echo -e "${YELLOW}Sincronizando esquema...${NC}"
npx prisma db push

# Executar o script de seed
echo -e "${YELLOW}Executando seed...${NC}"
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed-vercel.ts

# Verificar se o seed foi executado com sucesso
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Seed executado com sucesso!${NC}"
else
  echo -e "${RED}Erro ao executar o seed${NC}"
  exit 1
fi