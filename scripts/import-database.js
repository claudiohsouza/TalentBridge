/**
 * Script para importação do esquema e dados iniciais do banco de dados
 * 
 * Este script automatiza a criação do esquema do banco de dados e a importação
 * de dados iniciais para o projeto TalentBridge.
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Cores para o terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Configurações do banco de dados
let config = {
  user: 'postgres',
  password: '1234',
  host: 'localhost',
  port: 5432,
  database: 'Data1'
};

// Verificar se há um arquivo .env para carregar configurações
try {
  if (fs.existsSync(path.join(__dirname, '../backend/.env'))) {
    require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
    
    config = {
      user: process.env.DB_USER || config.user,
      password: process.env.DB_PASSWORD || config.password,
      host: process.env.DB_HOST || config.host,
      port: parseInt(process.env.DB_PORT) || config.port,
      database: process.env.DB_NAME || config.database
    };
    
    console.log(`${colors.blue}Configurações carregadas do arquivo .env${colors.reset}`);
  }
} catch (error) {
  console.log(`${colors.yellow}Aviso: Erro ao carregar arquivo .env, usando configurações padrão${colors.reset}`);
}

// Criar interface de leitura para input do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Pergunta para confirmar execução
function confirmarAcao(mensagem) {
  return new Promise((resolve) => {
    rl.question(`${colors.yellow}${mensagem} (s/N): ${colors.reset}`, (answer) => {
      resolve(answer.toLowerCase() === 's');
    });
  });
}

// Execução de script SQL
async function executarScriptSQL(caminhoArquivo, pool) {
  try {
    console.log(`${colors.blue}Executando script: ${caminhoArquivo}${colors.reset}`);
    const conteudo = fs.readFileSync(caminhoArquivo, 'utf8');
    
    // Dividir o script em comandos individuais
    const comandos = conteudo
      .replace(/\r\n/g, '\n')
      .split(';\n')
      .filter(cmd => cmd.trim());
    
    let executados = 0;
    
    for (const comando of comandos) {
      if (comando.trim()) {
        try {
          await pool.query(comando);
          executados++;
        } catch (err) {
          console.error(`${colors.red}Erro ao executar comando:${colors.reset}\n${comando.substring(0, 150)}...\n${colors.red}${err.message}${colors.reset}`);
        }
      }
    }
    
    console.log(`${colors.green}Script executado com sucesso: ${executados} comandos executados${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}Erro ao executar script SQL:${colors.reset}`, error);
    return false;
  }
}

// Função principal
async function main() {
  console.log(`${colors.cyan}===============================================`);
  console.log(`      IMPORTAÇÃO DE BANCO DE DADOS - TALENTBRIDGE`);
  console.log(`===============================================${colors.reset}`);
  
  // Mostrar configurações
  console.log(`\n${colors.blue}Configurações:${colors.reset}`);
  console.log(`- Host: ${config.host}`);
  console.log(`- Porta: ${config.port}`);
  console.log(`- Banco de Dados: ${config.database}`);
  console.log(`- Usuário: ${config.user}`);
  
  const continuar = await confirmarAcao('Deseja continuar com essas configurações?');
  if (!continuar) {
    console.log(`${colors.yellow}Operação cancelada pelo usuário.${colors.reset}`);
    rl.close();
    return;
  }
  
  // Criar pool de conexão
  const pool = new Pool(config);
  
  try {
    // Testar conexão
    console.log(`\n${colors.blue}Testando conexão com o banco de dados...${colors.reset}`);
    await pool.query('SELECT NOW()');
    console.log(`${colors.green}Conexão estabelecida com sucesso!${colors.reset}`);
    
    // Verificar se o esquema já existe
    const { rows } = await pool.query(`
      SELECT COUNT(*) FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'usuarios'
    `);
    
    const tabelaExiste = parseInt(rows[0].count) > 0;
    
    if (tabelaExiste) {
      const recriar = await confirmarAcao('A tabela "usuarios" já existe. Deseja recriar todas as tabelas? (ISSO APAGARÁ TODOS OS DADOS)');
      if (!recriar) {
        console.log(`${colors.yellow}Operação de criação de esquema cancelada.${colors.reset}`);
      } else {
        // Executar script de schema
        const schemaPath = path.join(__dirname, '../backend/db/schema.sql');
        await executarScriptSQL(schemaPath, pool);
      }
    } else {
      // Executar script de schema
      const schemaPath = path.join(__dirname, '../backend/db/schema.sql');
      await executarScriptSQL(schemaPath, pool);
    }
    
    // Perguntar se deseja importar dados de seed
    const importarSeed = await confirmarAcao('Deseja importar dados iniciais (seed)?');
    if (importarSeed) {
      const seedPath = path.join(__dirname, '../backend/db/seed.sql');
      if (fs.existsSync(seedPath)) {
        await executarScriptSQL(seedPath, pool);
      } else {
        console.log(`${colors.yellow}Arquivo de seed não encontrado: ${seedPath}${colors.reset}`);
      }
    }
    
    console.log(`\n${colors.green}Operação concluída com sucesso!${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}Erro ao configurar banco de dados:${colors.reset}`, error);
  } finally {
    await pool.end();
    rl.close();
  }
}

// Executar script
main().catch(error => {
  console.error(`${colors.red}Erro não tratado:${colors.reset}`, error);
  process.exit(1);
}); 