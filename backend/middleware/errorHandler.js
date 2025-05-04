import winston from 'winston';

// Configuração do logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
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

// Middleware de tratamento de erros
export const errorHandler = (err, req, res, next) => {
  // Log do erro
  logger.error(`${err.name}: ${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    stack: err.stack,
    details: err.details || {}
  });

  // Determinar status code
  const statusCode = err.statusCode || 500;
  
  // Formato de resposta padronizado
  const errorResponse = {
    erro: err.message || 'Erro interno do servidor',
    statusCode,
    success: false
  };
  
  // Adicionar detalhes se existirem (útil para erros de validação)
  if (err.details) {
    errorResponse.detalhes = err.details;
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
  ForbiddenError
}; 