import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import errorHandlerModule from './middleware/errorHandler.js';
import fs from 'fs';

const { errorHandler, notFoundHandler, logger } = errorHandlerModule;

// Importar rotas
import authRoutes from './routes/auth.js';
import estudantesRoutes from './routes/estudantes.js';
import usuariosRoutes from './routes/usuarios.js';

// Carregar variáveis de ambiente
dotenv.config();

// Exibir as variáveis de ambiente carregadas para debug
console.log('============== AMBIENTE CARREGADO ==============');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '******' : 'NÃO DEFINIDO');
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '******' : 'NÃO DEFINIDO');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('================================================');

// Definir valores padrão para variáveis de ambiente
const env = {
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || '1234',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_NAME: process.env.DB_NAME || 'Data1',
  DB_PORT: parseInt(process.env.DB_PORT) || 5432,
  JWT_SECRET: process.env.JWT_SECRET || 'sua_chave_secreta',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  PORT: parseInt(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos padrão
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 100 requisições padrão
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};

// Inicializar app
const app = express();

// Middlewares
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));

// Definir charset para todas as respostas
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use(helmet({
  // Configurar helmet para permitir conexões do frontend
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Configuração CORS mais permissiva
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['set-cookie']
}));

// Para requisições OPTIONS (preflight)
app.options('*', cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['set-cookie']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX
});
app.use(limiter);

// Logging
app.use(morgan('dev'));

// Conexão com PostgreSQL
const pool = new Pool({
  user: env.DB_USER,
  host: env.DB_HOST,
  database: env.DB_NAME,
  password: env.DB_PASSWORD,
  port: env.DB_PORT,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Adicionar configurações de codificação para garantir UTF-8
  options: '-c client_encoding=UTF8'
});

// Teste de conexão com o banco
pool.connect()
  .then(() => logger.info('Conexão com o banco de dados estabelecida'))
  .catch(err => {
    logger.error('Erro ao conectar ao banco de dados:', err);
    console.error('Erro ao conectar ao banco de dados. Certifique-se de que PostgreSQL está instalado e rodando.');
    console.error('Detalhes:', err.message);
    process.exit(1);
  });

// Compartilhar pool em todo o app
app.locals.pool = pool;

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    db_connected: !!pool.totalCount,
    config: {
      frontendUrl: env.FRONTEND_URL,
      port: env.PORT
    }
  });
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/estudantes', estudantesRoutes);
app.use('/api/usuario', usuariosRoutes);

// Registrar a rota legada para compatibilidade
app.post('/api/registro', (req, res, next) => {
  req.url = '/auth/registro';
  app.handle(req, res, next);
});

// Middlewares de erro
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar servidor
const PORT = env.PORT;
app.listen(PORT, () => {
  logger.info(`Servidor rodando em http://localhost:${PORT}`);
  logger.info('Ambiente:', env.NODE_ENV);
  
  // Log de rotas registradas
  logger.info('Rotas registradas:');
  logger.info('GET  /api/health');
  logger.info('POST /api/auth/login');
  logger.info('POST /api/auth/registro');
  logger.info('GET  /api/auth/verify');
  logger.info('GET  /api/estudantes');
  logger.info('GET  /api/estudantes/:id');
  logger.info('POST /api/estudantes');
  logger.info('PUT  /api/estudantes/:id');
  logger.info('GET  /api/usuario/me');
  logger.info('PUT  /api/usuario/me');
});

// Gerenciar encerramento
process.on('SIGINT', () => {
  logger.info('Encerrando servidor...');
  pool.end();
  process.exit(0);
});

export default app;