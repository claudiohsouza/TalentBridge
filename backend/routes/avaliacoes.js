import express from 'express';
import db from '../db-connect.js';
import auth from '../middleware/auth.js';
import { checkRole } from '../middleware/roles.js';

const router = express.Router();
const pool = db.pool;

// Obter categorias de avaliação
router.get('/categorias', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categorias_avaliacao ORDER BY nome'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ erro: 'Erro ao buscar categorias de avaliação' });
  }
});

// Obter avaliações de um jovem
router.get('/jovem/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if the student exists
    const jovemExists = await pool.query(
      'SELECT id FROM jovens WHERE id = $1',
      [id]
    );

    if (jovemExists.rows.length === 0) {
      return res.status(404).json({ erro: 'Jovem não encontrado' });
    }
    
    const result = await pool.query(
      `SELECT a.*, c.nome as categoria_nome, c.descricao as categoria_descricao, c.peso as categoria_peso,
        CASE 
          WHEN a.avaliador_tipo = 'instituicao_ensino' THEN ie.nome
          WHEN a.avaliador_tipo = 'chefe_empresa' THEN ce.nome || ' (' || ce.empresa || ')'
        END as avaliador_nome
      FROM avaliacoes a
      LEFT JOIN categorias_avaliacao c ON a.categoria_id = c.id
      LEFT JOIN usuarios u ON a.avaliador_id = u.id
      LEFT JOIN instituicoes_ensino ie ON u.id = ie.usuario_id
      LEFT JOIN chefes_empresa ce ON u.id = ce.usuario_id
      WHERE a.jovem_id = $1
      ORDER BY a.criado_em DESC`,
      [id]
    );

    // Calcular média ponderada
    const avaliacoes = result.rows;
    if (avaliacoes.length > 0) {
      const { media, total } = avaliacoes.reduce(
        (acc, av) => {
          const peso = av.categoria_peso || 1;
          return {
            media: acc.media + (av.nota * peso),
            total: acc.total + peso
          };
        },
        { media: 0, total: 0 }
      );

      res.json({
        avaliacoes,
        media_geral: total > 0 ? (media / total) : 0,
        total_avaliacoes: avaliacoes.length
      });
    } else {
      res.json({
        avaliacoes: [],
        media_geral: 0,
        total_avaliacoes: 0
      });
    }
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    res.status(500).json({ erro: 'Erro ao buscar avaliações' });
  }
});

// Criar nova avaliação
router.post('/jovem/:id', auth, checkRole(['instituicao_ensino', 'chefe_empresa']), async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { categoria_id, nota, comentario, evidencias } = req.body;
    
    // Validar nota
    if (nota < 0 || nota > 10) {
      return res.status(400).json({ erro: 'Nota deve estar entre 0 e 10' });
    }
    
    // Verificar se a categoria existe
    const categoriaResult = await client.query(
      'SELECT id FROM categorias_avaliacao WHERE id = $1',
      [categoria_id]
    );
    
    if (categoriaResult.rows.length === 0) {
      return res.status(400).json({ erro: 'Categoria de avaliação inválida' });
    }
    
    // Verificar se o jovem existe
    const jovemResult = await client.query(
      'SELECT id FROM jovens WHERE id = $1',
      [id]
    );
    
    if (jovemResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Jovem não encontrado' });
    }
    
    // Iniciar transação
    await client.query('BEGIN');
    
    // Inserir avaliação
    const result = await client.query(
      `INSERT INTO avaliacoes (
        jovem_id, avaliador_tipo, avaliador_id, categoria_id,
        nota, comentario, evidencias
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        id,
        req.user.papel,
        req.user.id,
        categoria_id,
        nota,
        comentario,
        evidencias || []
      ]
    );
    
    // Buscar detalhes da avaliação com categoria
    const avaliacaoResult = await client.query(
      `SELECT a.*, c.nome as categoria_nome, c.descricao as categoria_descricao
      FROM avaliacoes a
      LEFT JOIN categorias_avaliacao c ON a.categoria_id = c.id
      WHERE a.id = $1`,
      [result.rows[0].id]
    );
    
    await client.query('COMMIT');
    
    res.status(201).json(avaliacaoResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar avaliação:', error);
    res.status(500).json({ erro: 'Erro ao criar avaliação' });
  } finally {
    client.release();
  }
});

// Atualizar avaliação
router.put('/:id', auth, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { nota, comentario, evidencias } = req.body;
    
    // Verificar se a avaliação existe e pertence ao avaliador
    const avaliacaoResult = await client.query(
      'SELECT * FROM avaliacoes WHERE id = $1',
      [id]
    );
    
    if (avaliacaoResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Avaliação não encontrada' });
    }
    
    const avaliacao = avaliacaoResult.rows[0];
    
    // Verificar permissão
    if (
      avaliacao.avaliador_id !== req.user.id ||
      avaliacao.avaliador_tipo !== req.user.papel
    ) {
      return res.status(403).json({ erro: 'Sem permissão para editar esta avaliação' });
    }
    
    // Validar nota
    if (nota < 0 || nota > 10) {
      return res.status(400).json({ erro: 'Nota deve estar entre 0 e 10' });
    }
    
    // Atualizar avaliação
    const result = await client.query(
      `UPDATE avaliacoes
      SET nota = $1,
          comentario = $2,
          evidencias = $3,
          atualizado_em = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *`,
      [nota, comentario, evidencias || [], id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar avaliação:', error);
    res.status(500).json({ erro: 'Erro ao atualizar avaliação' });
  } finally {
    client.release();
  }
});

// Excluir avaliação
router.delete('/:id', auth, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    
    // Verificar se a avaliação existe e pertence ao avaliador
    const avaliacaoResult = await client.query(
      'SELECT * FROM avaliacoes WHERE id = $1',
      [id]
    );
    
    if (avaliacaoResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Avaliação não encontrada' });
    }
    
    const avaliacao = avaliacaoResult.rows[0];
    
    // Verificar permissão
    if (
      avaliacao.avaliador_id !== req.user.id ||
      avaliacao.avaliador_tipo !== req.user.papel
    ) {
      return res.status(403).json({ erro: 'Sem permissão para excluir esta avaliação' });
    }
    
    await client.query('DELETE FROM avaliacoes WHERE id = $1', [id]);
    
    res.json({ mensagem: 'Avaliação excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir avaliação:', error);
    res.status(500).json({ erro: 'Erro ao excluir avaliação' });
  } finally {
    client.release();
  }
});

export default router; 