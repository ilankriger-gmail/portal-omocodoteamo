# Configuração do Ambiente Vercel

Para garantir que o upload de imagens funcione corretamente no ambiente de produção da Vercel, é necessário configurar as seguintes variáveis de ambiente no dashboard da Vercel:

## Variáveis de Ambiente para Cloudinary

Adicione as seguintes variáveis de ambiente no painel de configuração do projeto na Vercel:

| Nome da Variável | Valor | Descrição |
| --- | --- | --- |
| `CLOUDINARY_CLOUD_NAME` | `dwnbmcg00` | Nome da conta no Cloudinary |
| `CLOUDINARY_API_KEY` | `172667994195663` | Chave de API do Cloudinary |
| `CLOUDINARY_API_SECRET` | `aHMCEq33FURqb9I1Bz9nxYY14d4` | Segredo da API do Cloudinary |

## Passos para Configuração

1. Acesse o [Dashboard da Vercel](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá para "Settings" > "Environment Variables"
4. Adicione cada uma das variáveis acima
5. Clique em "Save" para salvar as alterações

## Redeploy

Após configurar as variáveis de ambiente, faça um novo deploy do projeto:

1. No dashboard da Vercel, vá para a aba "Deployments"
2. Clique em "Redeploy" no último deployment
3. Selecione "Redeploy with existing build cache"

Com isso, o upload de imagens deverá funcionar corretamente no ambiente de produção.