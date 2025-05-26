import winston from 'winston';

// Configuração do logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' })
  ]
});

// Classes de erro customizadas
export class ApiError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Recurso não encontrado') {
    super(message, 404);
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Erro de validação', details = null) {
    super(message, 400, details);
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Não autorizado') {
    super(message, 401);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Acesso negado') {
    super(message, 403);
  }
}

export class DatabaseError extends ApiError {
  constructor(message = 'Erro de banco de dados', details = null) {
    super(message, 500, details);
  }
}

// Middleware de tratamento de erros
export const errorHandler = (err, req, res, next) => {
  // Determinar status code
  const statusCode = err.statusCode || 500;
  const isServerError = statusCode >= 500;
  
  // Log do erro (nível error para 5xx, warning para 4xx)
  const logLevel = isServerError ? 'error' : 'warn';
  const errorData = {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
    userRole: req.user?.papel,
    statusCode,
    errorName: err.name,
    details: err.details || {}
  };
  
  // Adicionar stack trace para erros de servidor
  if (isServerError) {
    errorData.stack = err.stack;
  }
  
  logger[logLevel](`${err.name}: ${err.message}`, errorData);

  // Formato de resposta padronizado
  const errorResponse = {
    status: 'error',
    code: statusCode,
    message: err.message || 'Erro interno do servidor'
  };
  
  // Adicionar detalhes se existirem (útil para erros de validação)
  if (err.details) {
    errorResponse.details = err.details;
  }
  
  // Adicionar código de erro se existir
  if (err.code) {
    errorResponse.errorCode = err.code;
  }
  
  // Adicionar stack trace em desenvolvimento
  if (process.env.NODE_ENV === 'development' && err.stack) {
    errorResponse.stack = err.stack;
  }
  
  res.status(statusCode).json(errorResponse);
};

// Middleware para capturar erros 404 (rotas não encontradas)
export const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Rota não encontrada: ${req.originalUrl}`);
  next(error);
};

export default {
  errorHandler,
  notFoundHandler,
  logger,
  ApiError,
  NotFoundError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  DatabaseError
}; 