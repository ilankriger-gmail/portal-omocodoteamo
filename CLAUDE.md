# Portal da Transparência - Documentação para Claude Code

## Visão Geral

O **Portal da Transparência** é uma aplicação web para o projeto "O Moço do Te Amo" que gerencia campanhas de arrecadação (vaquinhas), exibe perfis sociais oficiais e permite inscrições de pessoas que precisam de ajuda.

**URL de Produção:** https://portal.omocodoteamo.com.br

---

## Stack Tecnológica

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Next.js | 14.2.35 | Framework React com SSR |
| React | 18 | Biblioteca UI |
| TypeScript | 5 | Tipagem estática |
| Tailwind CSS | 3.4.1 | Estilização |
| Prisma | 5.22.0 | ORM para PostgreSQL |
| PostgreSQL | - | Banco de dados (Neon em prod) |
| NextAuth | 4.24.13 | Autenticação |
| Cloudinary | - | Upload de imagens |
| Puppeteer | 24.34.0 | Web scraping |

---

## Estrutura de Pastas

```
/portal
├── /src
│   ├── /app                    # Páginas e rotas Next.js (App Router)
│   │   ├── /(public)           # Páginas públicas (/, /vaquinhas, /quem-somos, etc.)
│   │   ├── /(protected)/admin  # Páginas admin (requer autenticação)
│   │   └── /api                # Endpoints da API
│   ├── /components
│   │   ├── /admin              # Componentes do painel admin
│   │   ├── /ui                 # Componentes UI reutilizáveis
│   │   └── /providers          # Providers (Auth, Theme)
│   ├── /lib
│   │   ├── /scrapers           # Web scrapers para redes sociais
│   │   ├── prisma.ts           # Cliente Prisma
│   │   ├── auth.ts             # Configuração NextAuth
│   │   ├── parceiro.ts         # Dados do parceiro Vakinha
│   │   └── slug.ts             # Geração de slugs únicos
│   └── /types                  # Definições de tipos TypeScript
├── /prisma
│   ├── schema.prisma           # Schema do banco de dados
│   └── seed.ts                 # Script de seed inicial
├── /scripts                    # Scripts de utilidade
└── /public                     # Arquivos estáticos
```

---

## Banco de Dados (Prisma Schema)

### Modelos Principais

```prisma
Config          # Configurações globais (biografia, banners, analytics)
User            # Usuários admin
Vaquinha        # Campanhas de arrecadação
Atualizacao     # Atualizações de campanhas (fotos, vídeos, textos)
VaquinhaApoiada # Campanhas externas apoiadas
PerfilSocial    # Perfis (ex: "O Moço do Te Amo", "NextLevelDJ")
RedeSocial      # Redes de cada perfil (Instagram, TikTok, YouTube)
Inscricao       # Inscrições de pessoas pedindo ajuda
Denuncia        # Denúncias de perfis falsos
FAQ             # Perguntas frequentes
LinkSocial      # Links do footer
FonteRenda      # Fontes de renda (transparência)
```

### Status e Enums

```prisma
VaquinhaStatus: ATIVA | ENCERRADA
InscricaoStatus: PENDENTE | ANALISANDO | APROVADA | RECUSADA
TipoAtualizacao: TEXTO | FOTO | VIDEO | COMPROVANTE | GALERIA | INSTAGRAM
```

---

## Páginas

### Públicas (`/(public)`)

| Rota | Descrição |
|------|-----------|
| `/` | Homepage com banner, vaquinha destaque e secundárias |
| `/vaquinhas` | Lista de todas as vaquinhas |
| `/vaquinhas/[slug]` | Detalhes de uma vaquinha |
| `/vaquinhas-apoiadas` | Campanhas apoiadas pelo portal |
| `/quem-somos` | Perfis oficiais e fontes de renda |
| `/participar` | Formulário de inscrição |
| `/duvidas` | FAQ |
| `/denunciar` | Denunciar perfis falsos |

### Admin (`/(protected)/admin`)

| Rota | Descrição |
|------|-----------|
| `/admin` | Dashboard |
| `/admin/vaquinhas` | CRUD de vaquinhas |
| `/admin/vaquinhas/[id]/atualizacoes` | Gerenciar atualizações |
| `/admin/config` | Configurações (biografia, banner) |
| `/admin/redes` | Perfis e redes sociais |
| `/admin/inscricoes` | Ver/gerenciar inscrições |
| `/admin/denuncias` | Ver denúncias |
| `/admin/faqs` | Gerenciar FAQ |
| `/admin/usuarios` | Gerenciar usuários admin |

---

## APIs

### Padrão de Rotas

```typescript
// Todas as APIs usam:
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Autenticação em rotas protegidas:
const session = await getServerSession(authOptions);
if (!session) return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
```

### Endpoints Principais

| Método | Rota | Descrição |
|--------|------|-----------|
| GET/POST | `/api/vaquinhas` | Listar/criar vaquinhas |
| GET/PUT/DELETE | `/api/vaquinhas/[id]` | CRUD vaquinha |
| POST | `/api/vaquinhas/[id]/atualizacoes` | Criar atualização |
| GET/POST | `/api/inscricoes` | Inscrições |
| GET/POST | `/api/denuncias` | Denúncias |
| GET/PUT | `/api/config` | Configurações globais |
| POST | `/api/upload` | Upload para Cloudinary |
| GET | `/api/parceiro` | Dados do perfil Vakinha |

---

## Padrões de Código

### Server Components (Padrão)

```typescript
// Páginas são Server Components por padrão
export const dynamic = 'force-dynamic';

async function getData() {
  const data = await prisma.model.findMany();
  return data;
}

export default async function Page() {
  const data = await getData();
  return <ClientComponent data={data} />;
}
```

### Tratamento de Erros

```typescript
async function getData() {
  try {
    const data = await prisma.model.findFirst();
    return { data, error: null };
  } catch (error) {
    console.error("Erro:", error);
    return { data: null, error };
  }
}
```

### Autenticação

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Em API routes
const session = await getServerSession(authOptions);
if (!session) {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}
```

---

## Variáveis de Ambiente

### Obrigatórias

```env
DATABASE_URL="postgresql://..."      # Conexão PostgreSQL
NEXTAUTH_URL="http://localhost:3000" # URL da aplicação
NEXTAUTH_SECRET="..."                # Secret para JWT
```

### Opcionais

```env
ADMIN_EMAIL="admin@..."              # Email do admin inicial (seed)
ADMIN_PASSWORD="..."                 # Senha do admin inicial (seed)
CRON_SECRET="..."                    # Token para cron jobs
NEXT_PUBLIC_GA_ID="G-..."            # Google Analytics
```

### Cloudinary (para uploads)

```env
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

---

## Comandos Úteis

### Desenvolvimento

```bash
npm run dev          # Iniciar servidor dev (port 3000)
npm run build        # Build de produção
npm run start        # Iniciar servidor de produção
```

### Banco de Dados

```bash
npm run db:push      # Sincronizar schema com banco
npm run db:studio    # Abrir Prisma Studio (GUI)
npm run db:seed      # Popular banco com dados iniciais
```

### Utilitários

```bash
npm run update-followers  # Atualizar contagem de seguidores
npm run lint              # Verificar erros de código
```

---

## Problemas Comuns e Soluções

### Erro "Can't reach database"

**Causa:** PostgreSQL não está rodando ou DATABASE_URL incorreta.

**Solução:**
1. Verificar se PostgreSQL está rodando
2. Verificar credenciais no `.env.local`
3. Em desenvolvimento: usar `localhost:5432`
4. Em produção: usar URL do Neon

### Erro de fetch para localhost:3001

**Causa:** Código antigo usando URL hardcoded.

**Solução:** Usar funções diretas do Prisma ou módulos em `/lib` em vez de fetch para APIs internas.

### Imagens não carregam

**Causa:** Domínio não configurado no `next.config.mjs`.

**Solução:** Adicionar domínio em `images.remotePatterns`.

---

## Web Scraping

Os scrapers em `/lib/scrapers` buscam contagem de seguidores de redes sociais:

- `instagram.ts` - Instagram
- `youtube.ts` - YouTube
- `tiktok.ts` - TikTok
- `facebook.ts` - Facebook
- `threads.ts` - Threads
- `kwai.ts` - Kwai

**Uso:**
```typescript
import { buscarSeguidores } from "@/lib/scrapers";

const seguidores = await buscarSeguidores("instagram", "usuario");
```

---

## Deploy

O projeto está configurado para deploy na **Vercel** com banco **Neon** (PostgreSQL serverless).

1. Push para `main` dispara deploy automático
2. Variáveis de ambiente configuradas na Vercel
3. Build usa `next build` com output standalone

---

## Arquivos Importantes

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/prisma.ts` | Cliente Prisma singleton |
| `src/lib/auth.ts` | Configuração NextAuth |
| `src/lib/parceiro.ts` | Dados do parceiro Vakinha |
| `prisma/schema.prisma` | Schema do banco |
| `next.config.mjs` | Configuração Next.js |
| `tailwind.config.ts` | Configuração Tailwind |
