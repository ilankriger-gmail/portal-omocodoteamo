import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary com as credenciais
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dwnbmcg00',
  api_key: process.env.CLOUDINARY_API_KEY || '172667994195663',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'aHMCEq33FURqb9I1Bz9nxYY14d4',
  secure: true,
});

// Função principal para verificar a conexão com o Cloudinary
async function main() {
  console.log('🧪 Iniciando teste de conexão com o Cloudinary...');

  try {
    // Tentar obter as informações da conta para verificar a conexão
    const result = await cloudinary.api.ping();

    console.log('✅ Conexão com o Cloudinary bem-sucedida!');
    console.log('ℹ️ Detalhes:', result);

    // Verificar as configurações de upload
    const uploadPreset = await cloudinary.api.usage();
    console.log('ℹ️ Uso:', uploadPreset);

    console.log('\n📁 Detalhes da conta:');
    const account = await cloudinary.api.account_info();
    console.log(`- Nome da conta: ${account.account.name}`);
    console.log(`- Nome da nuvem: ${cloudinary.config().cloud_name}`);
    console.log(`- Plano: ${account.account.plan}`);

    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar ao Cloudinary:');
    console.error(error);
    return false;
  }
}

// Executar o teste
main().then((success) => {
  if (success) {
    console.log('\n🎉 Tudo pronto! O Cloudinary está corretamente configurado.');
  } else {
    console.log('\n⚠️ Configuração do Cloudinary apresenta problemas.');
    console.log('Verifique as variáveis de ambiente e credenciais.');
  }
});