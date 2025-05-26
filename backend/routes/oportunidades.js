import express from 'express';
import { authMiddleware, checkRole } from './auth.js';
import { validate, oportunidadeSchema } from '../middleware/validator.js';
import { ForbiddenError, NotFoundError } from '../middleware/errorHandler.js';

const router = express.Router();

// Listar todas as oportunidades
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    console.log('[API-oportunidades] Recebida solicitação para listar oportunidades');
    console.log('[API-oportunidades] Usuário:', req.user.id, req.user.email, req.user.papel);
    
    const pool = req.db;
    
    // Consultar filtros
    const { status, tipo, data_inicio, data_fim, termo } = req.query;
    
    // Base da query com aliases corretos e contagem de recomendações
    let query = `
      SELECT o.*, 
             ic.tipo as instituicao_tipo,
             u.nome as instituicao_nome,
             COALESCE(
               (SELECT jsonb_array_elements_text(ic.areas_interesse) LIMIT 1),
               'Não especificada'
             ) as area,
             (SELECT COUNT(*) FROM recomendacoes r WHERE r.oportunidade_id = o.id) as total_recomendacoes
      FROM oportunidades o
      JOIN instituicoes_contratantes ic ON o.instituicao_id = ic.id
      JOIN usuarios u ON ic.usuario_id = u.id
    `;
    
    // Construir cláusulas WHERE
    const whereConditions = [];
    const params = [];
    
    // Remover filtro por papel de usuário - permitir acesso a todos

    if (status) {
      params.push(status);
      whereConditions.push(`o.status = $${params.length}`);
    }
    
    if (tipo) {
      params.push(tipo);
      whereConditions.push(`o.tipo = $${params.length}`);
    }
    
    if (data_inicio) {
      params.push(data_inicio);
      whereConditions.push(`o.data_inicio >= $${params.length}`);
    }
    
    if (data_fim) {
      params.push(data_fim);
      whereConditions.push(`o.data_fim <= $${params.length}`);
    }
    
    if (termo) {
      params.push(`%${termo}%`);
      whereConditions.push(`(o.titulo ILIKE $${params.length} OR o.descricao ILIKE $${params.length})`);
    }
    
    // Adicionar WHERE se houver condições
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    // Ordenação e limites
    query += ` ORDER BY o.data_inicio DESC, o.criado_em DESC`;
    
    console.log('[API-oportunidades] Query SQL:', query);
    console.log('[API-oportunidades] Parâmetros:', params);
    
    const result = await pool.query(query, params);
    
    // Processar resultados
    const oportunidades = result.rows.map(opp => {
      // Garantir que requisitos seja um array
      if (!opp.requisitos) {
        opp.requisitos = [];
      } else if (typeof opp.requisitos === 'string') {
        try {
          opp.requisitos = JSON.parse(opp.requisitos);
          if (!Array.isArray(opp.requisitos)) {
            opp.requisitos = [opp.requisitos];
          }
        } catch (e) {
          console.warn('[API-oportunidades] Erro ao fazer parsing de requisitos:', e);
          opp.requisitos = [];
        }
      }
      
      // Garantir que beneficios seja um array
      if (!opp.beneficios) {
        opp.beneficios = [];
      } else if (typeof opp.beneficios === 'string') {
        try {
          opp.beneficios = JSON.parse(opp.beneficios);
          if (!Array.isArray(opp.beneficios)) {
            opp.beneficios = [opp.beneficios];
          }
        } catch (e) {
          console.warn('[API-oportunidades] Erro ao fazer parsing de beneficios:', e);
          opp.beneficios = [];
        }
      }
      
      // Garantir que o campo area existe
      if (!opp.area) {
        opp.area = 'Não especificada';
      }
      
      // Converter total_recomendacoes para número
      opp.total_recomendacoes = parseInt(opp.total_recomendacoes || 0, 10);
      
      return opp;
    });
    
    console.log(`[API-oportunidades] Retornando ${oportunidades.length} oportunidades`);
    res.json(oportunidades);
  } catch (error) {
    console.error('[API-oportunidades] Erro ao listar oportunidades:', error);
    next(error);
  }
});

// Obter detalhes de uma oportunidade específica
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    console.log('[API-oportunidades] Recebida solicitação para obter detalhes da oportunidade:', req.params.id);
    
    const pool = req.db;
    if (!pool) {
      console.error('[API-oportunidades] Pool de conexão não disponível');
      throw new Error('Erro de conexão com o banco de dados');
    }
    const { id } = req.params;
    
    // Obter detalhes da oportunidade
    const oportunidadeQuery = await pool.query(
      `SELECT o.*, 
              ic.tipo as instituicao_tipo,
              u.nome as instituicao_nome,
              u.email as instituicao_email
       FROM oportunidades o
       JOIN instituicoes_contratantes ic ON o.instituicao_id = ic.id
       JOIN usuarios u ON ic.usuario_id = u.id
       WHERE o.id = $1`,
      [id]
    );
    
    if (oportunidadeQuery.rows.length === 0) {
      throw new NotFoundError('Oportunidade não encontrada');
    }
    
    const oportunidade = oportunidadeQuery.rows[0];
    
    // Garantir que requisitos seja um array
    if (!oportunidade.requisitos) {
      oportunidade.requisitos = [];
    } else if (typeof oportunidade.requisitos === 'string') {
      try {
        oportunidade.requisitos = JSON.parse(oportunidade.requisitos);
        if (!Array.isArray(oportunidade.requisitos)) {
          oportunidade.requisitos = [oportunidade.requisitos];
        }
      } catch (e) {
        console.warn('[API-oportunidades] Erro ao fazer parsing de requisitos:', e);
        oportunidade.requisitos = [];
      }
    }
    
    // Garantir que beneficios seja um array
    if (!oportunidade.beneficios) {
      oportunidade.beneficios = [];
    } else if (typeof oportunidade.beneficios === 'string') {
      try {
        oportunidade.beneficios = JSON.parse(oportunidade.beneficios);
        if (!Array.isArray(oportunidade.beneficios)) {
          oportunidade.beneficios = [oportunidade.beneficios];
        }
      } catch (e) {
        console.warn('[API-oportunidades] Erro ao fazer parsing de beneficios:', e);
        oportunidade.beneficios = [];
      }
    }
    
    // Verificar se o usuário é o dono da oportunidade
    let isOwner = false;
    if (req.user.papel === 'instituicao_contratante') {
      const instituicao = await pool.query(
        'SELECT id FROM instituicoes_contratantes WHERE usuario_id = $1',
        [req.user.id]
      );
      
      if (instituicao.rows.length > 0) {
        isOwner = instituicao.rows[0].id === oportunidade.instituicao_id;
      }
    }
    
    // Obter recomendações relacionadas à oportunidade
    let recomendacoes = [];
    if (isOwner) {
      // Se for dono, mostra todas as recomendações
      const recomendacoesQuery = await pool.query(
        `SELECT r.*, 
                j.nome as jovem_nome, 
                j.email as jovem_email,
                j.formacao as jovem_formacao,
                j.idade as jovem_idade,
                CASE 
                  WHEN r.recomendador_tipo = 'instituicao_ensino' THEN
                    (SELECT u.nome FROM instituicoes_ensino ie JOIN usuarios u ON ie.usuario_id = u.id WHERE ie.id = r.recomendador_id)
                  WHEN r.recomendador_tipo = 'chefe_empresa' THEN
                    (SELECT u.nome FROM chefes_empresas ce JOIN usuarios u ON ce.usuario_id = u.id WHERE ce.id = r.recomendador_id)
                END as recomendador_nome
         FROM recomendacoes r
         JOIN jovens j ON r.jovem_id = j.id
         WHERE r.oportunidade_id = $1
         ORDER BY r.criado_em DESC`,
        [id]
      );
      
      recomendacoes = recomendacoesQuery.rows;
    } else {
      // Se for instituição de ensino ou chefe de empresa, mostra apenas suas recomendações
      if (req.user.papel === 'instituicao_ensino') {
        const instituicao = await pool.query(
          'SELECT id FROM instituicoes_ensino WHERE usuario_id = $1',
          [req.user.id]
        );
        
        if (instituicao.rows.length > 0) {
          const instituicaoId = instituicao.rows[0].id;
          
          const recomendacoesQuery = await pool.query(
            `SELECT r.*, 
                    j.nome as jovem_nome, 
                    j.email as jovem_email,
                    j.formacao as jovem_formacao,
                    j.idade as jovem_idade
             FROM recomendacoes r
             JOIN jovens j ON r.jovem_id = j.id
             WHERE r.oportunidade_id = $1 
             AND r.recomendador_tipo = 'instituicao_ensino' 
             AND r.recomendador_id = $2
             ORDER BY r.criado_em DESC`,
            [id, instituicaoId]
          );
          
          recomendacoes = recomendacoesQuery.rows;
        }
      } else if (req.user.papel === 'chefe_empresa') {
        const empresa = await pool.query(
          'SELECT id FROM chefes_empresas WHERE usuario_id = $1',
          [req.user.id]
        );
        
        if (empresa.rows.length > 0) {
          const empresaId = empresa.rows[0].id;
          
          const recomendacoesQuery = await pool.query(
            `SELECT r.*, 
                    j.nome as jovem_nome, 
                    j.email as jovem_email,
                    j.formacao as jovem_formacao,
                    j.idade as jovem_idade
             FROM recomendacoes r
             JOIN jovens j ON r.jovem_id = j.id
             WHERE r.oportunidade_id = $1 
             AND r.recomendador_tipo = 'chefe_empresa' 
             AND r.recomendador_id = $2
             ORDER BY r.criado_em DESC`,
            [id, empresaId]
          );
          
          recomendacoes = recomendacoesQuery.rows;
        }
      }
    }
    
    // Montar resposta
    const resposta = {
      ...oportunidade,
      is_owner: isOwner,
      recomendacoes: recomendacoes
    };
    
    res.json(resposta);
  } catch (error) {
    next(error);
  }
});

// Criar nova oportunidade (apenas instituições contratantes)
router.post('/', authMiddleware, checkRole(['instituicao_contratante']), validate(oportunidadeSchema), async (req, res, next) => {
  try {
    console.log('[API-oportunidades] Recebida solicitação para criar oportunidade');
    
    const pool = req.db;
    if (!pool) {
      console.error('[API-oportunidades] Pool de conexão não disponível');
      throw new Error('Erro de conexão com o banco de dados');
    }
    const { titulo, descricao, tipo, requisitos, beneficios, data_inicio, data_fim } = req.body;
    
    // Obter ID da instituição contratante
    const instituicao = await pool.query(
      'SELECT id FROM instituicoes_contratantes WHERE usuario_id = $1',
      [req.user.id]
    );
    
    if (instituicao.rows.length === 0) {
      return res.status(400).json({ message: 'Perfil de instituição contratante não encontrado' });
    }
    
    const instituicaoId = instituicao.rows[0].id;
    
    // Inserir oportunidade
    const result = await pool.query(
      `INSERT INTO oportunidades
       (instituicao_id, titulo, descricao, tipo, requisitos, beneficios, data_inicio, data_fim, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        instituicaoId,
        titulo,
        descricao,
        tipo,
        requisitos ? JSON.stringify(requisitos) : null,
        beneficios ? JSON.stringify(beneficios) : null,
        data_inicio || null,
        data_fim || null,
        'Aberta'
      ]
    );
    
    res.status(201).json({
      success: true,
      message: 'Oportunidade criada com sucesso',
      oportunidade: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Atualizar status de uma oportunidade
router.put('/:id/status', authMiddleware, checkRole(['instituicao_contratante']), async (req, res, next) => {
  try {
    console.log('[API-oportunidades] Recebida solicitação para atualizar status da oportunidade:', req.params.id);
    
    const pool = req.db;
    if (!pool) {
      console.error('[API-oportunidades] Pool de conexão não disponível');
      throw new Error('Erro de conexão com o banco de dados');
    }
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status não fornecido' });
    }
    
    // Verificar se o status é válido
    const statusesValidos = ['Aberta', 'Fechada', 'Encerrada', 'Cancelada'];
    if (!statusesValidos.includes(status)) {
      return res.status(400).json({ message: 'Status inválido' });
    }
    
    // Verificar se a oportunidade existe e pertence à instituição
    const instituicao = await pool.query(
      'SELECT id FROM instituicoes_contratantes WHERE usuario_id = $1',
      [req.user.id]
    );
    
    if (instituicao.rows.length === 0) {
      return res.status(400).json({ message: 'Perfil de instituição contratante não encontrado' });
    }
    
    const instituicaoId = instituicao.rows[0].id;
    
    const oportunidade = await pool.query(
      'SELECT * FROM oportunidades WHERE id = $1 AND instituicao_id = $2',
      [id, instituicaoId]
    );
    
    if (oportunidade.rows.length === 0) {
      throw new NotFoundError('Oportunidade não encontrada ou não pertence a esta instituição');
    }
    
    // Atualizar status
    const result = await pool.query(
      `UPDATE oportunidades
       SET status = $1,
           atualizado_em = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );
    
    res.json({
      success: true,
      message: 'Status da oportunidade atualizado com sucesso',
      oportunidade: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Atualizar status de uma recomendação
router.put('/recomendacao/:id/status', authMiddleware, checkRole(['instituicao_contratante']), async (req, res, next) => {
  try {
    console.log('[API-oportunidades] Recebida solicitação para atualizar status da recomendação:', req.params.id);
    
    const pool = req.db;
    if (!pool) {
      console.error('[API-oportunidades] Pool de conexão não disponível');
      throw new Error('Erro de conexão com o banco de dados');
    }
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status não fornecido' });
    }
    
    // Verificar se o status é válido
    const statusesValidos = ['pendente', 'aprovada', 'rejeitada'];
    if (!statusesValidos.includes(status)) {
      return res.status(400).json({ message: 'Status inválido' });
    }
    
    // Verificar se a recomendação existe
    const recomendacaoQuery = await pool.query(
      `SELECT r.*, o.instituicao_id 
       FROM recomendacoes r
       JOIN oportunidades o ON r.oportunidade_id = o.id
       WHERE r.id = $1`,
      [id]
    );
    
    if (recomendacaoQuery.rows.length === 0) {
      throw new NotFoundError('Recomendação não encontrada');
    }
    
    // Verificar se a instituição contratante é a dona da oportunidade
    const recomendacao = recomendacaoQuery.rows[0];
    const instituicao = await pool.query(
      'SELECT id FROM instituicoes_contratantes WHERE usuario_id = $1',
      [req.user.id]
    );
    
    if (instituicao.rows.length === 0) {
      return res.status(400).json({ message: 'Perfil de instituição contratante não encontrado' });
    }
    
    const instituicaoId = instituicao.rows[0].id;
    
    if (recomendacao.instituicao_id !== instituicaoId) {
      throw new ForbiddenError('Sem permissão para atualizar esta recomendação');
    }
    
    // Atualizar status
    const result = await pool.query(
      `UPDATE recomendacoes
       SET status = $1,
           atualizado_em = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );
    
    res.json({
      success: true,
      message: 'Status da recomendação atualizado com sucesso',
      recomendacao: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

export default router; 