import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import errorHandlerModule from './middleware/errorHandler.js';
import fs from 'fs';
import db from './db-connect.js';

const { errorHandler, notFoundHandler, logger } = errorHandlerModule;

// Importar rotas
import authRoutes from './routes/auth.js';
import usuariosRoutes from './routes/usuarios.js';
import jovensRoutes from './routes/jovens.js';
import oportunidadesRoutes from './routes/oportunidades.js';
import opcoesRoutes from './routes/opcoes.js';
import avaliacoesRoutes from './routes/avaliacoes.js';

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
  PORT: parseInt(process.env.PORT) || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos padrão
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 100 requisições padrão
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};

// Inicializar app
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Definir charset para todas as respostas
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Configuração de segurança com helmet
app.use(helmet({
  // Configurar helmet para permitir conexões do frontend
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Configuração CORS
const corsOptions = {
  origin: env.NODE_ENV === 'production' 
    ? env.FRONTEND_URL
    : [env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 3600
};

app.use(cors(corsOptions));

// Limitador de taxa para prevenção de ataques de força bruta
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Muitas requisições, tente novamente mais tarde'
  }
});

// Aplicar limitador em todas as rotas (exceto em desenvolvimento)
if (env.NODE_ENV === 'production') {
  app.use(limiter);
}

// Logger para requisições HTTP
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: fs.createWriteStream('./access.log', { flags: 'a' })
  }));
}

// Teste de conexão com o banco
db.testarConexao()
  .then(success => {
    if (success) {
      logger.info('Conexão com o banco de dados validada com sucesso!');
    } else {
      logger.error('Falha ao validar conexão com o banco de dados');
    }
  })
  .catch(err => {
    logger.error('Erro crítico de conexão com o banco de dados', { error: err.message });
  });

// Expor conexão ao banco para uso nos módulos de rota
app.locals.db = db.pool;
console.log('Pool de banco de dados exposto em app.locals.db:', !!app.locals.db);

// Injetar o pool e utils no objeto de request
app.use((req, res, next) => {
  req.db = db.pool;
  req.dbUtils = db; // Acesso aos métodos utilitários
  next();
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/jovens', jovensRoutes);
app.use('/api/oportunidades', oportunidadesRoutes);
app.use('/api/opcoes', opcoesRoutes);
app.use('/api/avaliacoes', avaliacoesRoutes);

// Rota padrão
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API TalentBridge funcionando!',
    version: '1.0.0'
  });
});

// Middleware para permitir pre-flight requests em todas as rotas
app.options('*', cors(corsOptions));

// Middleware de tratamento para 404
app.use((req, res, next) => {
  console.log('Rota não encontrada:', req.originalUrl);
  next();
}, notFoundHandler);

// Middleware de tratamento de erros
app.use(errorHandler);

// Iniciar servidor
const PORT = env.PORT;
const server = app.listen(PORT, () => {
  logger.info(`Servidor rodando em http://localhost:${PORT}`);
  logger.info(`Ambiente: ${env.NODE_ENV}`);
  logger.info(`CORS permitindo origem: ${JSON.stringify(corsOptions.origin)}`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  logger.error('Erro não tratado:', { error: err.message, stack: err.stack });
  
  // Fechamento controlado
  server.close(() => {
    logger.error('Servidor fechado devido a erro não tratado.');
    process.exit(1);
  });
});

export default app;