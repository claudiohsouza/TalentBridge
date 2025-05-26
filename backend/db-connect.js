import { Pool } from 'pg';
import dotenv from 'dotenv';
import winston from 'winston';

// Carregar variáveis de ambiente
dotenv.config();

// Configurar logger específico para o módulo de DB
const dbLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'db-connect' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'database.log' })
  ]
});

// Configurações de conexão
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'Data1',
  port: parseInt(process.env.DB_PORT) || 5432,
  max: 20, // máximo de conexões no pool
  idleTimeoutMillis: 30000, // tempo limite ocioso em milissegundos
  connectionTimeoutMillis: 5000, // tempo limite de conexão em milissegundos
  maxUses: 7500, // número máximo de usos por conexão antes de descartá-la
};

// Criar pool de conexão
const pool = new Pool(dbConfig);

// Log de configuração (sem senhas)
dbLogger.info('Configuração de banco de dados:', {
  host: dbConfig.host,
  database: dbConfig.database,
  user: dbConfig.user,
  port: dbConfig.port
});

// Monitorar eventos do pool
pool.on('connect', (client) => {
  dbLogger.info('Nova conexão de banco de dados estabelecida');
  
  // Configurar cliente para lidar com JSON corretamente
  client.query('SET standard_conforming_strings = on');
});

pool.on('error', (err, client) => {
  dbLogger.error('Erro inesperado no pool de banco de dados:', {
    error: err.message,
    code: err.code
  });
  
  // Tentar reconectar em caso de erro
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    dbLogger.info('Tentando reconectar automaticamente...');
  }
});

pool.on('remove', () => {
  dbLogger.debug('Cliente de banco de dados removido do pool');
});

// Método para verificar conexão
const testarConexao = async () => {
  let client;
  try {
    client = await pool.connect();
    dbLogger.info('Conexão com banco de dados estabelecida com sucesso');
    
    const result = await client.query('SELECT NOW() as now');
    dbLogger.info('Consulta de teste executada:', { timestamp: result.rows[0].now });
    
    // Testar permissões e tabelas importantes
    try {
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      const tableNames = tablesResult.rows.map(row => row.table_name);
      dbLogger.info('Tabelas encontradas:', { count: tableNames.length, tables: tableNames });
    } catch (tableErr) {
      dbLogger.error('Erro ao verificar tabelas:', { error: tableErr.message });
    }
    
    return true;
  } catch (err) {
    dbLogger.error('Erro ao conectar ao banco de dados:', {
      error: err.message,
      stack: err.stack
    });
    return false;
  } finally {
    if (client) client.release();
  }
};

// Método para executar query com retry
const executarQuery = async (text, params, retries = 3) => {
  let client;
  let attempt = 0;
  
  while (attempt < retries) {
    try {
      client = await pool.connect();
      dbLogger.debug('Executando query:', {
        query: text.substring(0, 100) + '...',
        params: params,
        attempt: attempt + 1,
        retries: retries
      });
      
      const result = await client.query(text, params);
      dbLogger.debug('Query executada com sucesso:', {
        rowCount: result.rowCount,
        firstRow: result.rows.length > 0 ? JSON.stringify(result.rows[0]).substring(0, 100) + '...' : null
      });
      return result;
    } catch (err) {
      dbLogger.error('Erro na execução da query:', {
        error: err.message,
        code: err.code,
        query: text.substring(0, 100) + '...',
        params: JSON.stringify(params),
        attempt: attempt + 1,
        retries: retries
      });
      
      attempt++;
      
      if (attempt >= retries) {
        throw err;
      }
      
      // Esperar antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      if (client) client.release();
    }
  }
};

// Método para iniciar uma transação
const iniciarTransacao = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    return client;
  } catch (err) {
    client.release();
    throw err;
  }
};

// Método para converter arrays para formato adequado ao PostgreSQL
const preparaArrayParaDB = (array) => {
  if (!array) return '[]';
  if (Array.isArray(array)) {
    return JSON.stringify(array);
  }
  // Se já for uma string JSON, retornar como está
  try {
    // Verificar se já é uma string JSON válida
    JSON.parse(array);
    return array;
  } catch (e) {
    // Se não for JSON válido, tentar converter para array
    return JSON.stringify([array]);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  dbLogger.info('Encerrando conexões com o banco de dados...');
  await pool.end();
  dbLogger.info('Todas as conexões encerradas.');
  process.exit(0);
});

// Exportar pool e métodos utilitários
export default {
  pool,
  testarConexao,
  executarQuery,
  iniciarTransacao,
  preparaArrayParaDB,
  logger: dbLogger,
  config: dbConfig
}; 