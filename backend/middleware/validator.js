import Joi from 'joi';
import { ValidationError } from './errorHandler.js';

// Middleware de validação genérico
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      throw new ValidationError('Erro de validação nos dados enviados', details);
    }

    // Atualiza req.body com os dados validados e normalizados
    req.body = value;
    next();
  };
};

// Esquemas de validação para diferentes entidades e operações

// Validação de Login
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email inválido',
    'string.empty': 'Email é obrigatório',
    'any.required': 'Email é obrigatório'
  }),
  senha: Joi.string().min(6).required().messages({
    'string.min': 'A senha deve ter pelo menos 6 caracteres',
    'string.empty': 'Senha é obrigatória',
    'any.required': 'Senha é obrigatória'
  })
});

// Validação de Registro
export const registroSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email inválido',
    'string.empty': 'Email é obrigatório',
    'any.required': 'Email é obrigatório'
  }),
  senha: Joi.string().min(6).required().messages({
    'string.min': 'A senha deve ter pelo menos 6 caracteres',
    'string.empty': 'Senha é obrigatória',
    'any.required': 'Senha é obrigatória'
  }),
  papel: Joi.string().valid('instituicao', 'empresa').required().messages({
    'any.only': 'Papel deve ser instituicao ou empresa',
    'string.empty': 'Papel é obrigatório',
    'any.required': 'Papel é obrigatório'
  })
});

// Validação de Atualização de Usuário
export const atualizacaoUsuarioSchema = Joi.object({
  email: Joi.string().email().optional().messages({
    'string.email': 'Email inválido'
  }),
  senhaAtual: Joi.string().min(6).optional().messages({
    'string.min': 'A senha atual deve ter pelo menos 6 caracteres'
  }),
  novaSenha: Joi.string().min(6).optional().messages({
    'string.min': 'A nova senha deve ter pelo menos 6 caracteres'
  })
}).custom((value, helpers) => {
  // Se novaSenha for fornecida, senhaAtual também deve ser
  if (value.novaSenha && !value.senhaAtual) {
    return helpers.error('any.invalid', { message: 'Senha atual é necessária para alterar a senha' });
  }
  
  // Se email for fornecido, senhaAtual também deve ser
  if (value.email && !value.senhaAtual) {
    return helpers.error('any.invalid', { message: 'Senha atual é necessária para alterar o email' });
  }
  
  return value;
});

// Validação de Criação de Estudante
export const estudanteSchema = Joi.object({
  nome: Joi.string().required().messages({
    'string.empty': 'Nome é obrigatório',
    'any.required': 'Nome é obrigatório'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email inválido',
    'string.empty': 'Email é obrigatório',
    'any.required': 'Email é obrigatório'
  }),
  media_geral: Joi.number().min(0).max(10).allow(null).optional().messages({
    'number.min': 'Média geral deve ser no mínimo 0',
    'number.max': 'Média geral deve ser no máximo 10'
  }),
  estabilidade_estresse: Joi.number().integer().min(1).max(5).allow(null).optional().messages({
    'number.base': 'Estabilidade/Estresse deve ser um número',
    'number.integer': 'Estabilidade/Estresse deve ser um número inteiro',
    'number.min': 'Estabilidade/Estresse deve ser no mínimo 1',
    'number.max': 'Estabilidade/Estresse deve ser no máximo 5'
  }),
  habilidades: Joi.array().items(Joi.string()).allow(null).optional(),
  planos_futuros: Joi.string().allow('', null).optional()
});

export default {
  validate,
  loginSchema,
  registroSchema,
  atualizacaoUsuarioSchema,
  estudanteSchema
}; 