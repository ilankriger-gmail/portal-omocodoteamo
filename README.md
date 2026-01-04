This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Implantação na Vercel

### Preparação do Banco de Dados Neon

Antes de implantar o projeto na Vercel, é necessário preparar o banco de dados Neon:

1. Certifique-se de que a variável de ambiente `DATABASE_URL` está configurada com a conexão correta para o banco Neon

2. Execute o script de seed para inicializar o banco de dados:

```bash
npm run db:seed:neon
```

Este script irá:
- Sincronizar o esquema do Prisma com o banco Neon
- Criar um usuário administrador
- Configurar as informações básicas do site
- Criar perfis sociais e fontes de renda
- Criar uma vaquinha de teste para demonstração

3. Verifique na interface da Neon se as tabelas foram criadas e populadas corretamente

### Configuração da Vercel

Configure as seguintes variáveis de ambiente na Vercel:

- `DATABASE_URL`: URL de conexão com o banco Neon
- `NEXTAUTH_URL`: URL do site em produção (https://portal.omocodoteamo.com.br)
- `NEXTAUTH_SECRET`: Chave secreta para autenticação
- `CRON_SECRET`: Chave secreta para proteção de endpoints cron

### Processo de Implantação

O processo de implantação na Vercel é simplificado:

1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente mencionadas acima
3. Implante o projeto
4. Se ocorrerem erros durante o build relacionados ao banco de dados, execute o script de seed novamente
