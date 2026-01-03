#!/bin/bash

# Script de deploy para produção

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Iniciando processo de deploy...${NC}"

# Verificar se estamos na branch main
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "main" ]; then
  echo -e "${YELLOW}⚠️  Você não está na branch main (está em: $current_branch).${NC}"
  read -p "Deseja continuar mesmo assim? (s/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${RED}Deploy cancelado.${NC}"
    exit 1
  fi
fi

# Verificar alterações não commitadas
git_status=$(git status --porcelain)
if [ -n "$git_status" ]; then
  echo -e "${YELLOW}⚠️  Há alterações não commitadas:${NC}"
  git status --short
  read -p "Deseja continuar sem commitar? (s/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${RED}Deploy cancelado.${NC}"
    exit 1
  fi
fi

# Pull das últimas mudanças
echo -e "${YELLOW}Baixando últimas mudanças do repositório...${NC}"
git pull

# Instalar dependências
echo -e "${YELLOW}Instalando dependências...${NC}"
npm ci || npm install

# Gerar prisma client
echo -e "${YELLOW}Gerando Prisma Client...${NC}"
npx prisma generate

# Verificar se precisa migrar o banco de dados
echo -e "${YELLOW}Verificando migrações de banco de dados...${NC}"
read -p "Deseja executar migrações no banco de dados? (s/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
  echo -e "${YELLOW}Aplicando migrações...${NC}"
  npx prisma migrate deploy
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro nas migrações. Verifique os erros acima.${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ Migrações aplicadas com sucesso!${NC}"
fi

# Verificar se é necessário criar slugs para registros existentes
read -p "Deseja executar a migração para gerar slugs para vaquinhas existentes? (s/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
  echo -e "${YELLOW}Executando migração de slugs...${NC}"
  npm run migrate:slugs
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro na migração de slugs. Verifique os erros acima.${NC}"
  else
    echo -e "${GREEN}✅ Migração de slugs concluída com sucesso!${NC}"
  fi
fi

# Build
echo -e "${YELLOW}Executando build de produção...${NC}"
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Erro durante o build. Verifique os erros acima.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Build concluído com sucesso!${NC}"

# Verificar se deseja reiniciar o servidor
read -p "Deseja reiniciar o servidor agora? (s/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
  echo -e "${YELLOW}Reiniciando servidor...${NC}"

  # Exemplo usando PM2 (ajuste conforme sua configuração)
  if command -v pm2 &> /dev/null; then
    pm2 restart portal
  else
    # Se não está usando PM2, pode ajustar para o seu processo
    echo -e "${YELLOW}PM2 não encontrado. Você precisará reiniciar o servidor manualmente.${NC}"
  fi
fi

echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo -e "${YELLOW}Não esqueça de verificar os logs após reiniciar o servidor para garantir que tudo está funcionando.${NC}"