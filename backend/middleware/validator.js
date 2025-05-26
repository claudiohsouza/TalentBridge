import Joi from 'joi';
import { ValidationError } from './errorHandler.js';

// Middleware de validação genérico
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const details = error.details.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return next(new ValidationError('Erro de validação nos dados enviados', details));
      }

      // Atualiza req.body com os dados validados e normalizados
      req.body = value;
      next();
    } catch (err) {
      next(new ValidationError('Erro ao processar validação', { general: err.message }));
    }
  };
};

// Mensagens de erro padrão para reutilização
const errorMessages = {
  string: {
    email: 'Deve ser um email válido',
    min: 'Deve ter pelo menos {#limit} caracteres',
    max: 'Deve ter no máximo {#limit} caracteres',
    empty: 'Este campo é obrigatório'
  },
  number: {
    min: 'Deve ser no mínimo {#limit}',
    max: 'Deve ser no máximo {#limit}',
    integer: 'Deve ser um número inteiro'
  },
  any: {
    required: 'Este campo é obrigatório',
    only: 'Valor inválido'
  }
};

// Esquemas de validação para diferentes entidades e operações

// Validação de Login
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': errorMessages.string.email,
    'string.empty': errorMessages.string.empty,
    'any.required': errorMessages.any.required
  }),
  senha: Joi.string().min(6).required().messages({
    'string.min': errorMessages.string.min,
    'string.empty': errorMessages.string.empty,
    'any.required': errorMessages.any.required
  })
});

// Validação de Registro
export const registroSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': errorMessages.string.email,
    'string.empty': errorMessages.string.empty,
    'any.required': errorMessages.any.required
  }),
  senha: Joi.string().min(6).required().messages({
    'string.min': errorMessages.string.min,
    'string.empty': errorMessages.string.empty,
    'any.required': errorMessages.any.required
  }),
  nome: Joi.string().required().messages({
    'string.empty': errorMessages.string.empty,
    'any.required': errorMessages.any.required
  }),
  papel: Joi.string().valid('instituicao_ensino', 'chefe_empresa', 'instituicao_contratante').required().messages({
    'any.only': 'Papel deve ser instituicao_ensino, chefe_empresa ou instituicao_contratante',
    'string.empty': errorMessages.string.empty,
    'any.required': errorMessages.any.required
  }),
  // Campos para instituição de ensino
  tipo: Joi.string().when('papel', {
    is: 'instituicao_ensino',
    then: Joi.required().messages({
      'string.empty': 'Tipo da instituição é obrigatório',
      'any.required': 'Tipo da instituição é obrigatório'
    }),
    otherwise: Joi.optional()
  }),
  // Campos para chefe de empresa
  empresa: Joi.string().when('papel', {
    is: 'chefe_empresa',
    then: Joi.required().messages({
      'string.empty': 'Nome da empresa é obrigatório',
      'any.required': 'Nome da empresa é obrigatório'
    }),
    otherwise: Joi.optional()
  }),
  setor: Joi.string().when('papel', {
    is: 'chefe_empresa',
    then: Joi.required().messages({
      'string.empty': 'Setor da empresa é obrigatório',
      'any.required': 'Setor da empresa é obrigatório'
    }),
    otherwise: Joi.optional()
  }),
  porte: Joi.string().when('papel', {
    is: 'chefe_empresa',
    then: Joi.required().messages({
      'string.empty': 'Porte da empresa é obrigatório',
      'any.required': 'Porte da empresa é obrigatório'
    }),
    otherwise: Joi.optional()
  }),
  // Campos comuns para todos os perfis
  localizacao: Joi.string().required().messages({
    'string.empty': 'Localização é obrigatória',
    'any.required': 'Localização é obrigatória'
  }),
  // Campos específicos para cada tipo
  areas_ensino: Joi.array().items(Joi.string()).when('papel', {
    is: 'instituicao_ensino',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  qtd_alunos: Joi.number().integer().min(0).when('papel', {
    is: 'instituicao_ensino',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  areas_atuacao: Joi.array().items(Joi.string()).when('papel', {
    is: 'chefe_empresa',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  areas_interesse: Joi.array().items(Joi.string()).when('papel', {
    is: 'instituicao_contratante',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  programas_sociais: Joi.array().items(Joi.string()).when('papel', {
    is: 'instituicao_contratante',
    then: Joi.required(),
    otherwise: Joi.optional()
  })
}).custom((value, helpers) => {
  // Validação específica por papel
  if (value.papel === 'instituicao_ensino' && (!value.areas_ensino || !value.qtd_alunos)) {
    return helpers.error('any.invalid', { message: 'Áreas de ensino e quantidade de alunos são obrigatórios para instituições de ensino' });
  }
  
  if (value.papel === 'chefe_empresa' && (!value.empresa || !value.setor || !value.porte || !value.areas_atuacao)) {
    return helpers.error('any.invalid', { message: 'Empresa, setor, porte e áreas de atuação são obrigatórios para chefes de empresa' });
  }
  
  if (value.papel === 'instituicao_contratante' && (!value.areas_interesse || !value.programas_sociais)) {
    return helpers.error('any.invalid', { message: 'Áreas de interesse e programas sociais são obrigatórios para instituições contratantes' });
  }
  
  return value;
});

// Validação de Atualização de Usuário
export const atualizacaoUsuarioSchema = Joi.object({
  email: Joi.string().email().optional().messages({
    'string.email': errorMessages.string.email
  }),
  nome: Joi.string().optional(),
  senhaAtual: Joi.string().min(6).optional().messages({
    'string.min': errorMessages.string.min
  }),
  novaSenha: Joi.string().min(6).optional().messages({
    'string.min': errorMessages.string.min
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

// Validação de Jovem
export const jovemSchema = Joi.object({
  nome: Joi.string().required().messages({
    'string.empty': errorMessages.string.empty,
    'any.required': errorMessages.any.required
  }),
  email: Joi.string().email().required().messages({
    'string.email': errorMessages.string.email,
    'string.empty': errorMessages.string.empty,
    'any.required': errorMessages.any.required
  }),
  idade: Joi.number().integer().min(14).max(24).required().messages({
    'number.base': 'Idade deve ser um número',
    'number.integer': errorMessages.number.integer,
    'number.min': 'Idade mínima é 14 anos',
    'number.max': 'Idade máxima é 24 anos',
    'any.required': errorMessages.any.required
  }),
  formacao: Joi.string().valid(
    'Ensino Médio',
    'Ensino Médio Técnico',
    'Graduação',
    'Pós-Graduação'
  ).required().messages({
    'string.empty': errorMessages.string.empty,
    'any.required': errorMessages.any.required,
    'any.only': 'Formação deve ser uma das opções válidas'
  }),
  curso: Joi.string().valid(
    'Administração',
    'Análise e Desenvolvimento de Sistemas',
    'Ciência da Computação',
    'Engenharia de Software',
    'Engenharia Civil',
    'Engenharia Elétrica',
    'Engenharia Mecânica',
    'Marketing',
    'Recursos Humanos',
    'Técnico em Informática',
    'Técnico em Administração',
    'Técnico em Eletrônica',
    'Técnico em Mecânica'
  ).required().messages({
    'string.empty': errorMessages.string.empty,
    'any.required': errorMessages.any.required,
    'any.only': 'Curso deve ser uma das opções válidas'
  }),
  habilidades: Joi.array().items(
    Joi.string().valid(
      'Programação',
      'Análise de Dados',
      'Design Gráfico',
      'Marketing Digital',
      'Gestão de Projetos',
      'Comunicação',
      'Liderança',
      'Trabalho em Equipe',
      'Inglês',
      'Excel Avançado',
      'Power BI',
      'SQL',
      'Python',
      'JavaScript',
      'React',
      'Node.js'
    )
  ).min(1).required().messages({
    'array.base': 'Habilidades deve ser uma lista',
    'array.min': 'Selecione pelo menos uma habilidade',
    'any.required': errorMessages.any.required,
    'any.only': 'Habilidade selecionada não é válida'
  }),
  interesses: Joi.array().items(
    Joi.string().valid(
      'Desenvolvimento de Software',
      'Análise de Dados',
      'Inteligência Artificial',
      'Design e UX',
      'Marketing Digital',
      'Gestão de Projetos',
      'Empreendedorismo',
      'Inovação',
      'Sustentabilidade',
      'Educação',
      'Saúde',
      'Finanças',
      'Recursos Humanos',
      'Vendas',
      'Logística',
      'Indústria 4.0'
    )
  ).min(1).required().messages({
    'array.base': 'Interesses deve ser uma lista',
    'array.min': 'Selecione pelo menos um interesse',
    'any.required': errorMessages.any.required,
    'any.only': 'Interesse selecionado não é válido'
  }),
  planos_futuros: Joi.string().allow('').optional()
});

// Validação de Oportunidade
export const oportunidadeSchema = Joi.object({
  titulo: Joi.string().required().messages({
    'string.empty': errorMessages.string.empty,
    'any.required': errorMessages.any.required
  }),
  descricao: Joi.string().required().messages({
    'string.empty': errorMessages.string.empty,
    'any.required': errorMessages.any.required
  }),
  tipo: Joi.string().required().messages({
    'string.empty': errorMessages.string.empty,
    'any.required': errorMessages.any.required
  }),
  requisitos: Joi.array().items(Joi.string()).allow(null).optional(),
  beneficios: Joi.array().items(Joi.string()).allow(null).optional(),
  data_inicio: Joi.date().iso().allow(null).optional(),
  data_fim: Joi.date().iso().min(Joi.ref('data_inicio')).allow(null).optional().messages({
    'date.min': 'Data fim deve ser posterior à data início'
  })
});

// Validação de Recomendação
export const recomendacaoSchema = Joi.object({
  jovem_id: Joi.number().integer().required().messages({
    'number.base': 'ID do jovem deve ser um número',
    'any.required': errorMessages.any.required
  }),
  oportunidade_id: Joi.number().integer().required().messages({
    'number.base': 'ID da oportunidade deve ser um número',
    'any.required': errorMessages.any.required
  }),
  justificativa: Joi.string().required().messages({
    'string.empty': errorMessages.string.empty,
    'any.required': errorMessages.any.required
  })
});

export default {
  validate,
  loginSchema,
  registroSchema,
  atualizacaoUsuarioSchema,
  jovemSchema,
  oportunidadeSchema,
  recomendacaoSchema
}; 