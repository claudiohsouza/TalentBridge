import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validate, loginSchema, registroSchema } from '../middleware/validator.js';
import { AuthenticationError } from '../middleware/errorHandler.js';

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
    console.log('JWT_SECRET usado:', jwtSecret ? 'Definido' : 'Usando padrão');
    
    const decoded = jwt.verify(token, jwtSecret);
    console.log('Token verificado com sucesso:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Erro na verificação do token:', err.message);
    throw new AuthenticationError('Token inválido');
  }
};

// Rota de login
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    console.log('Tentativa de login:', req.body.email);
    const { email, senha } = req.body;
    const { pool } = req.app.locals;

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
      { id: usuario.id, email: usuario.email, papel: usuario.papel },
      jwtSecret,
      { expiresIn: '24h' }
    );

    console.log('Token gerado, enviando resposta');
    res.json({ 
      token,
      papel: usuario.papel,
      usuario: { id: usuario.id, email: usuario.email, papel: usuario.papel }
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
    const { email, senha, papel } = req.body;
    const { pool } = req.app.locals;

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
    const novoUsuario = await pool.query(
      `INSERT INTO usuarios (email, senha, papel)
       VALUES ($1, $2, $3)
       RETURNING id, email, papel, criado_em`,
      [email, senhaHash, papel]
    );

    console.log('Usuário registrado com sucesso:', email);
    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      usuario: novoUsuario.rows[0]
    });
  } catch (error) {
    console.error('Erro no processo de registro:', error);
    next(error);
  }
});

// Verificar token
router.get('/verify', authMiddleware, (req, res) => {
  console.log('Token verificado, enviando dados do usuário');
  res.json({ 
    status: 'ok', 
    usuario: req.user,
    message: 'Token válido'
  });
});

export default router; 