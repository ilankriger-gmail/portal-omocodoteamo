# Guia de Deploy do Portal da Transparência

Este documento descreve o processo completo para deploy da aplicação em produção.

## Pré-requisitos

1. Servidor Linux (Ubuntu/Debian recomendado)
2. Node.js 18.x ou superior
3. NPM 9.x ou superior
4. Banco de dados PostgreSQL (usamos Neon.tech)
5. Git instalado

## Configuração de Variáveis de Ambiente

Antes do deploy, certifique-se de que todas as variáveis de ambiente estão configuradas corretamente no arquivo `.env.production`:

```
# Database
DATABASE_URL="postgresql://neondb_owner:password@endpoint.neon.tech/neondb?sslmode=require&channel_binding=require"

# NextAuth
NEXTAUTH_URL="https://portal.omocodoteamo.com.br"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"

# Cron Job
CRON_SECRET="outra-chave-secreta-aqui"
```

## Processo de Deploy

### 1. Clone do Repositório

```bash
git clone https://github.com/usuario/portal-transparencia.git
cd portal-transparencia
```

### 2. Deploy Automatizado

O repositório inclui um script automatizado de deploy que simplifica o processo:

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

O script irá:
- Verificar se você está na branch main
- Realizar git pull das últimas alterações
- Instalar dependências
- Gerar o Prisma Client
- Aplicar migrações de banco de dados (opcional)
- Executar a migração de slugs para registros existentes (opcional)
- Fazer o build de produção
- Reiniciar o servidor (se estiver usando PM2)

### 3. Deploy Manual

Se preferir fazer o deploy manualmente:

1. **Atualizar o código**:
   ```bash
   git pull origin main
   ```

2. **Instalar dependências**:
   ```bash
   npm ci
   ```

3. **Gerar o Prisma Client**:
   ```bash
   npx prisma generate
   ```

4. **Aplicar migrações de banco de dados** (se houver):
   ```bash
   npx prisma migrate deploy
   ```

5. **Executar migração de slugs** (apenas uma vez após a atualização):
   ```bash
   npm run migrate:slugs
   ```

6. **Construir a aplicação**:
   ```bash
   npm run build
   ```

7. **Iniciar o servidor**:
   ```bash
   npm run start
   ```

## Configuração do Servidor Web (Nginx)

Recomendamos o uso do Nginx como proxy reverso. Abaixo uma configuração básica:

```nginx
server {
    listen 80;
    server_name portal.omocodoteamo.com.br;

    # Redirecionar para HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name portal.omocodoteamo.com.br;

    # Configuração SSL
    ssl_certificate /etc/letsencrypt/live/portal.omocodoteamo.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/portal.omocodoteamo.com.br/privkey.pem;

    # Configurações de segurança recomendadas
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;

    # Proxy para a aplicação Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Uso com PM2 (Recomendado para Produção)

Para garantir que a aplicação continue em execução, recomendamos o uso do PM2:

1. **Instalar o PM2**:
   ```bash
   npm install -g pm2
   ```

2. **Iniciar a aplicação com PM2**:
   ```bash
   pm2 start npm --name "portal" -- start
   ```

3. **Configurar inicialização automática**:
   ```bash
   pm2 startup
   pm2 save
   ```

4. **Visualizar logs**:
   ```bash
   pm2 logs portal
   ```

5. **Reiniciar a aplicação**:
   ```bash
   pm2 restart portal
   ```

## Cron Job para Atualizações Automáticas

A aplicação inclui uma API para atualização automática dos dados. Configure um cron job no servidor para chamar esta API regularmente:

```
# Atualizar dados da Vakinha a cada hora
0 * * * * curl -X POST "https://portal.omocodoteamo.com.br/api/cron/update-vaquinhas?secret=SUA_CRON_SECRET_AQUI"
```

## Solução de Problemas

### Erro de Conexão com Banco de Dados

Se houver problemas de conexão com o banco de dados:
1. Verifique se a URL do banco está correta em `.env.production`
2. Certifique-se de que o IP do servidor está liberado no firewall do banco
3. Teste a conexão diretamente: `npx prisma db pull`

### Erro de Build

Se o build falhar:
1. Verifique os logs de erro: `npm run build`
2. Use o script otimizado: `./scripts/build-for-prod.sh`
3. Certifique-se de que todas as dependências estão instaladas: `npm ci`

### Problemas com Imagens

Se as imagens não estiverem carregando:
1. Verifique se todos os domínios estão configurados em `next.config.mjs`
2. Verifique a validação com `isValidImageUrl` nos componentes

## Conclusão

Após seguir todos os passos acima, o Portal da Transparência deverá estar funcionando corretamente em produção. Em caso de dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.