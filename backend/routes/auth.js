import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validate, loginSchema, registroSchema } from '../middleware/validator.js';
import { AuthenticationError, ValidationError } from '../middleware/errorHandler.js';

const router = express.Router();

// Middleware de autenticação (JWT)
export const authMiddleware = (req, res, next) => {
  try {
    console.log('Verificando autenticação...');
    
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      console.log('Token não fornecido nos headers');
      throw new AuthenticationError('Token não fornecido');
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('Token inválido (formato incorreto)');
      throw new AuthenticationError('Token inválido');
    }
    
    console.log('Token encontrado, verificando...');
    const jwtSecret = process.env.JWT_SECRET || 'sua_chave_secreta';
    
    const decoded = jwt.verify(token, jwtSecret);
    console.log('Token verificado com sucesso:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Erro na verificação do token:', err.message);
    next(new AuthenticationError('Token inválido'));
  }
};

// Middleware para verificar o papel do usuário
export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Usuário não autenticado'));
    }
    
    if (!roles.includes(req.user.papel)) {
      return next(new AuthenticationError('Acesso não autorizado para este papel'));
    }
    
    next();
  };
};

// Rota de login
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    console.log('Tentativa de login:', req.body.email);
    const pool = req.db;
    if (!pool) {
      console.error('Pool de conexão não disponível');
      return next(new Error('Erro de conexão com o banco de dados'));
    }
    
    const { email, senha } = req.body;

    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (rows.length === 0) {
      console.log('Usuário não encontrado:', email);
      throw new AuthenticationError('Usuário não encontrado');
    }

    const usuario = rows[0];
    console.log('Usuário encontrado, verificando senha');
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaValida) {
      console.log('Senha inválida para:', email);
      throw new AuthenticationError('Credenciais inválidas');
    }

    console.log('Login bem-sucedido, gerando token');
    const jwtSecret = process.env.JWT_SECRET || 'sua_chave_secreta';
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, papel: usuario.papel, nome: usuario.nome },
      jwtSecret,
      { expiresIn: '24h' }
    );

    console.log('Token gerado, enviando resposta');
    
    // Consultar informações específicas do perfil com base no papel
    let dadosAdicionais = null;
    if (usuario.papel === 'instituicao_ensino') {
      const result = await pool.query(
        'SELECT * FROM instituicoes_ensino WHERE usuario_id = $1',
        [usuario.id]
      );
      if (result.rows.length > 0) {
        dadosAdicionais = result.rows[0];
      }
    } else if (usuario.papel === 'chefe_empresa') {
      const result = await pool.query(
        'SELECT * FROM chefes_empresas WHERE usuario_id = $1',
        [usuario.id]
      );
      if (result.rows.length > 0) {
        dadosAdicionais = result.rows[0];
      }
    } else if (usuario.papel === 'instituicao_contratante') {
      const result = await pool.query(
        'SELECT * FROM instituicoes_contratantes WHERE usuario_id = $1',
        [usuario.id]
      );
      if (result.rows.length > 0) {
        dadosAdicionais = result.rows[0];
      }
    }

    res.json({ 
      token,
      papel: usuario.papel,
      usuario: { 
        id: usuario.id, 
        email: usuario.email, 
        papel: usuario.papel,
        nome: usuario.nome,
        perfil: dadosAdicionais
      }
    });
  } catch (error) {
    console.error('Erro no processo de login:', error);
    next(error);
  }
});

// Rota de registro
router.post('/registro', validate(registroSchema), async (req, res, next) => {
  try {
    console.log('Tentativa de registro:', req.body.email);
    const { email, senha, papel, nome, ...dadosPerfil } = req.body;

    // Verificar a disponibilidade do pool de conexão
    let pool;
    
    // Tentar obter o pool de várias maneiras
    if (req.db) {
      pool = req.db;
      console.log('Usando pool de req.db');
    } else if (req.app && req.app.locals && req.app.locals.db) {
      pool = req.app.locals.db;
      console.log('Usando pool de req.app.locals.db');
    } else {
      console.error('ERRO CRÍTICO: Conexão de banco de dados não disponível');
      return next(new Error('Erro de conexão com o banco de dados'));
    }

    console.log('Pool de conexão obtido com sucesso. Prosseguindo com o cadastro.');

    // Verificar se o papel é válido
    if (!['instituicao_ensino', 'chefe_empresa', 'instituicao_contratante'].includes(papel)) {
      throw new AuthenticationError('Papel inválido');
    }

    const usuarioExistente = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1', 
      [email]
    );

    if (usuarioExistente.rows.length > 0) {
      console.log('Email já cadastrado:', email);
      throw new AuthenticationError('Email já cadastrado');
    }

    console.log('Criando novo usuário');
    const senhaHash = await bcrypt.hash(senha, 12);
    
    // Iniciar transação
    await pool.query('BEGIN');

    try {
      // Inserir usuário base
      const novoUsuario = await pool.query(
        `INSERT INTO usuarios (email, senha, papel, nome, verificado)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, papel, nome, criado_em`,
        [email, senhaHash, papel, nome, false]
      );
      
      const usuarioId = novoUsuario.rows[0].id;
      let perfilData = null;
      
      // Inserir perfil específico baseado no papel
      if (papel === 'instituicao_ensino') {
        const { tipo, localizacao, areas_ensino, qtd_alunos } = dadosPerfil;
        
        // Usar a função utilitária para tratar arrays se disponível
        let areas_ensino_json;
        if (req.dbUtils && req.dbUtils.preparaArrayParaDB) {
          areas_ensino_json = req.dbUtils.preparaArrayParaDB(areas_ensino);
        } else {
          areas_ensino_json = Array.isArray(areas_ensino) ? JSON.stringify(areas_ensino) : '[]';
        }
        
        console.log('Preparando areas_ensino para DB:', areas_ensino, '->', areas_ensino_json);
        
        const result = await pool.query(
          `INSERT INTO instituicoes_ensino (usuario_id, tipo, localizacao, areas_ensino, qtd_alunos)
           VALUES ($1, $2, $3, $4::jsonb, $5)
           RETURNING *`,
          [usuarioId, tipo, localizacao, areas_ensino_json, qtd_alunos]
        );
        
        perfilData = result.rows[0];
      } 
      else if (papel === 'chefe_empresa') {
        const { empresa, setor, porte, localizacao, areas_atuacao } = dadosPerfil;
        
        // Usar a função utilitária para tratar arrays se disponível
        let areas_atuacao_json;
        if (req.dbUtils && req.dbUtils.preparaArrayParaDB) {
          areas_atuacao_json = req.dbUtils.preparaArrayParaDB(areas_atuacao);
        } else {
          areas_atuacao_json = Array.isArray(areas_atuacao) ? JSON.stringify(areas_atuacao) : '[]';
        }
        
        console.log('Preparando areas_atuacao para DB:', areas_atuacao, '->', areas_atuacao_json);
        
        const result = await pool.query(
          `INSERT INTO chefes_empresas (usuario_id, empresa, setor, porte, localizacao, areas_atuacao)
           VALUES ($1, $2, $3, $4, $5, $6::jsonb)
           RETURNING *`,
          [usuarioId, empresa, setor, porte, localizacao, areas_atuacao_json]
        );
        
        perfilData = result.rows[0];
      } 
      else if (papel === 'instituicao_contratante') {
        const { tipo, localizacao, areas_interesse, programas_sociais } = dadosPerfil;
        
        // Usar a função utilitária para tratar arrays se disponível
        let areas_interesse_json, programas_sociais_json;
        if (req.dbUtils && req.dbUtils.preparaArrayParaDB) {
          areas_interesse_json = req.dbUtils.preparaArrayParaDB(areas_interesse);
          programas_sociais_json = req.dbUtils.preparaArrayParaDB(programas_sociais);
        } else {
          areas_interesse_json = Array.isArray(areas_interesse) ? JSON.stringify(areas_interesse) : '[]';
          programas_sociais_json = Array.isArray(programas_sociais) ? JSON.stringify(programas_sociais) : '[]';
        }
        
        const result = await pool.query(
          `INSERT INTO instituicoes_contratantes (usuario_id, tipo, localizacao, areas_interesse, programas_sociais)
           VALUES ($1, $2, $3, $4::jsonb, $5::jsonb)
           RETURNING *`,
          [usuarioId, tipo, localizacao, areas_interesse_json, programas_sociais_json]
        );
        
        perfilData = result.rows[0];
      }
      
      await pool.query('COMMIT');
      
      // Gerar token para login automático após registro
      const jwtSecret = process.env.JWT_SECRET || 'sua_chave_secreta';
      const token = jwt.sign(
        { id: usuarioId, email, papel, nome },
        jwtSecret,
        { expiresIn: '24h' }
      );
      
      res.status(201).json({
        mensagem: 'Usuário registrado com sucesso',
        usuario: {
          id: usuarioId,
          email,
          papel,
          nome
        },
        token
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Erro no registro:', error);
    next(error);
  }
});

// Rota para verificar token
router.get('/verificar', authMiddleware, (req, res) => {
  res.json({
    usuario: req.user,
    valido: true
  });
});

export default router; 