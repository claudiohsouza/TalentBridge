import express from 'express';
import bcrypt from 'bcrypt';
import { authMiddleware } from './auth.js';
import { validate, atualizacaoUsuarioSchema } from '../middleware/validator.js';
import { ValidationError, NotFoundError } from '../middleware/errorHandler.js';

const router = express.Router();

// Obter perfil do usuário autenticado
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    console.log('[API-usuarios] Recebida solicitação para obter perfil do usuário:', req.user.id);
    
    const pool = req.db;
    if (!pool) {
      console.error('[API-usuarios] Pool de conexão não disponível');
      throw new Error('Erro de conexão com o banco de dados');
    }
    
    const { id } = req.user;
    
    const result = await pool.query(
      'SELECT id, email, papel, verificado, criado_em, atualizado_em FROM usuarios WHERE id = $1', 
      [id]
    );
    
    if (result.rows.length === 0) {
      throw new NotFoundError('Usuário não encontrado');
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Atualizar perfil do usuário autenticado
router.put('/me', authMiddleware, validate(atualizacaoUsuarioSchema), async (req, res, next) => {
  try {
    console.log('[API-usuarios] Recebida solicitação para atualizar perfil do usuário:', req.user.id);
    
    const pool = req.db;
    if (!pool) {
      console.error('[API-usuarios] Pool de conexão não disponível');
      throw new Error('Erro de conexão com o banco de dados');
    }
    
    const { id } = req.user;
    const { email, senhaAtual, novaSenha } = req.body;
    
    // Buscar dados atuais do usuário
    const usuarioAtual = await pool.query(
      'SELECT email, senha FROM usuarios WHERE id = $1', 
      [id]
    );
    
    if (usuarioAtual.rows.length === 0) {
      throw new NotFoundError('Usuário não encontrado');
    }
    
    // Verificar senha atual se tentar mudar email ou senha
    if (senhaAtual) {
      const senhaValida = await bcrypt.compare(senhaAtual, usuarioAtual.rows[0].senha);
      if (!senhaValida) {
        throw new ValidationError('Senha atual incorreta');
      }
    }
    
    let alteracoes = [];
    let params = [];
    
    // Atualizar email se fornecido
    if (email && email !== usuarioAtual.rows[0].email) {
      // Verificar se o novo email já está em uso
      const emailExistente = await pool.query(
        'SELECT id FROM usuarios WHERE email = $1 AND id != $2', 
        [email, id]
      );
      
      if (emailExistente.rows.length > 0) {
        throw new ValidationError('Este email já está em uso');
      }
      
      alteracoes.push(`email = $${params.length + 1}`);
      params.push(email);
    }
    
    // Atualizar senha se fornecida
    if (novaSenha) {
      const senhaHash = await bcrypt.hash(novaSenha, 12);
      alteracoes.push(`senha = $${params.length + 1}`);
      params.push(senhaHash);
    }
    
    // Atualização da data
    alteracoes.push(`atualizado_em = NOW()`);
    
    // Se não há nada para atualizar
    if (params.length === 0) {
      return res.json({
        message: 'Nenhuma alteração foi realizada',
        usuario: {
          id,
          email: usuarioAtual.rows[0].email,
          papel: req.user.papel
        }
      });
    }
    
    // Executar atualização
    params.push(id); // Adicionar ID para a cláusula WHERE
    const query = `
      UPDATE usuarios 
      SET ${alteracoes.join(', ')} 
      WHERE id = $${params.length} 
      RETURNING id, email, papel, verificado, criado_em, atualizado_em
    `;
    
    const result = await pool.query(query, params);
    
    res.json({
      message: 'Perfil atualizado com sucesso',
      usuario: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

export default router; 