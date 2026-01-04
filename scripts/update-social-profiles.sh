#!/bin/bash

echo "Atualizando perfis de redes sociais..."
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/update-social-profiles.ts

echo ""
echo "Verifique os perfis atualizados no painel administrativo: /admin/redes"