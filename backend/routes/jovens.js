import express from 'express';
import { validate, jovemSchema, recomendacaoSchema } from '../middleware/validator.js';
import { authMiddleware, checkRole } from '../routes/auth.js';
import { ForbiddenError, NotFoundError, DatabaseError } from '../middleware/errorHandler.js';
import db from '../db-connect.js';

const router = express.Router();

// Listar jovens - todos os tipos de usuário podem visualizar
router.get('/', authMiddleware, checkRole(['instituicao_ensino', 'chefe_empresa', 'instituicao_contratante']), async (req, res) => {
  try {
    const result = await db.executarQuery(`
      SELECT 
        j.id,
        j.nome,
        j.email,
        j.idade,
        j.formacao,
        j.curso,
        j.habilidades,
        j.interesses,
        j.planos_futuros,
        j.status,
        j.criado_em,
        j.atualizado_em
      FROM jovens j
      ORDER BY j.nome
    `);

    const jovens = result.rows.map(jovem => {
      let parsedHabilidades = [];
      let parsedInteresses = [];
      
      try {
        parsedHabilidades = jovem.habilidades ? JSON.parse(jovem.habilidades) : [];
      } catch (e) {
        console.log(`Erro ao parsear habilidades para jovem ${jovem.id}:`, e.message);
        // Se não for JSON válido, tenta tratar como string simples
        parsedHabilidades = jovem.habilidades ? [jovem.habilidades] : [];
      }
      
      try {
        parsedInteresses = jovem.interesses ? JSON.parse(jovem.interesses) : [];
      } catch (e) {
        console.log(`Erro ao parsear interesses para jovem ${jovem.id}:`, e.message);
        // Se não for JSON válido, tenta tratar como string simples
        parsedInteresses = jovem.interesses ? [jovem.interesses] : [];
      }
      
      return {
        ...jovem,
        habilidades: parsedHabilidades,
        interesses: parsedInteresses
      };
    });

    res.json(jovens);
  } catch (error) {
    console.error('Erro ao listar jovens:', error);
    res.status(500).json({ message: 'Erro ao listar jovens' });
  }
});

// Rota para o formulário de criação de jovem
router.get('/novo', authMiddleware, (req, res) => {
  res.json({ 
    message: 'Formulário para criar um novo jovem',
    campos_obrigatorios: ['nome', 'email', 'idade'],
    campos_opcionais: ['formacao', 'habilidades', 'interesses', 'planos_futuros']
  });
});

// Obter um jovem específico - todos os tipos de usuário podem visualizar
router.get('/:id', authMiddleware, checkRole(['instituicao_ensino', 'chefe_empresa', 'instituicao_contratante']), async (req, res) => {
  try {
    console.log('Buscando jovem com ID:', req.params.id);
    
    const result = await db.executarQuery(`
      SELECT 
        j.id,
        j.nome,
        j.email,
        j.idade,
        j.formacao,
        j.curso,
        j.habilidades,
        j.interesses,
        j.planos_futuros,
        j.status,
        j.criado_em,
        j.atualizado_em
      FROM jovens j
      WHERE j.id = $1
    `, [req.params.id]);

    console.log('Resultado da busca:', result.rows.length > 0 ? 'Jovem encontrado' : 'Jovem não encontrado');

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Jovem não encontrado' });
    }

    let parsedHabilidades = [];
    let parsedInteresses = [];
    
    try {
      parsedHabilidades = result.rows[0].habilidades ? JSON.parse(result.rows[0].habilidades) : [];
    } catch (e) {
      console.log(`Erro ao parsear habilidades para jovem ${result.rows[0].id}:`, e.message);
      // Se não for JSON válido, tenta tratar como string simples
      parsedHabilidades = result.rows[0].habilidades ? [result.rows[0].habilidades] : [];
    }
    
    try {
      parsedInteresses = result.rows[0].interesses ? JSON.parse(result.rows[0].interesses) : [];
    } catch (e) {
      console.log(`Erro ao parsear interesses para jovem ${result.rows[0].id}:`, e.message);
      // Se não for JSON válido, tenta tratar como string simples
      parsedInteresses = result.rows[0].interesses ? [result.rows[0].interesses] : [];
    }

    const jovem = {
      ...result.rows[0],
      habilidades: parsedHabilidades,
      interesses: parsedInteresses
    };

    console.log('Retornando dados do jovem:', { id: jovem.id, nome: jovem.nome });
    res.json(jovem);
  } catch (error) {
    console.error('Erro ao buscar jovem:', error);
    res.status(500).json({ message: 'Erro ao buscar jovem' });
  }
});

// Criar novo jovem - apenas instituições de ensino podem criar
router.post('/', authMiddleware, checkRole(['instituicao_ensino']), validate(jovemSchema), async (req, res) => {
  try {
    // Verificar se o email já está em uso
    const emailCheck = await db.executarQuery(
      'SELECT id FROM jovens WHERE email = $1',
      [req.body.email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    const result = await db.executarQuery(
      `INSERT INTO jovens (
        nome, email, idade, formacao, curso,
        habilidades, interesses, planos_futuros, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        req.body.nome,
        req.body.email,
        req.body.idade,
        req.body.formacao,
        req.body.curso,
        JSON.stringify(req.body.habilidades),
        JSON.stringify(req.body.interesses),
        req.body.planos_futuros,
        'Ativo'
      ]
    );

    res.status(201).json({
      message: 'Jovem cadastrado com sucesso',
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Erro ao cadastrar jovem:', error);
    res.status(500).json({ message: 'Erro ao cadastrar jovem' });
  }
});

// Rota para recomendação de jovens para oportunidades
router.post('/recomendar', authMiddleware, checkRole(['instituicao_ensino', 'chefe_empresa']), validate(recomendacaoSchema), async (req, res, next) => {
  try {
    const { jovem_id, oportunidade_id, justificativa } = req.body;
    
    if (!jovem_id || !oportunidade_id || !justificativa) {
      return res.status(400).json({ message: 'Dados incompletos para recomendação' });
    }
    
    // Verificar se o jovem existe
    const jovemExiste = await db.executarQuery('SELECT id FROM jovens WHERE id = $1', [jovem_id]);
    if (jovemExiste.rows.length === 0) {
      return next(new NotFoundError('Jovem não encontrado'));
    }
    
    // Verificar se a oportunidade existe
    const oportunidadeExiste = await db.executarQuery('SELECT id FROM oportunidades WHERE id = $1', [oportunidade_id]);
    if (oportunidadeExiste.rows.length === 0) {
      return next(new NotFoundError('Oportunidade não encontrada'));
    }
    
    // Determinar o tipo e id do recomendador
    let recomendadorTipo = req.user.papel;
    let recomendadorId;
    
    if (recomendadorTipo === 'instituicao_ensino') {
      const result = await db.executarQuery(
        'SELECT id FROM instituicoes_ensino WHERE usuario_id = $1',
        [req.user.id]
      );
      
      if (result.rows.length === 0) {
        return res.status(400).json({ message: 'Perfil de instituição não encontrado' });
      }
      
      recomendadorId = result.rows[0].id;
      
      // Verificar se o jovem está vinculado a esta instituição
      const vinculo = await db.executarQuery(
        'SELECT id FROM jovens_instituicoes WHERE jovem_id = $1 AND instituicao_id = $2',
        [jovem_id, recomendadorId]
      );
      
      if (vinculo.rows.length === 0) {
        return next(new ForbiddenError('Jovem não está vinculado a esta instituição'));
      }
    } 
    else if (recomendadorTipo === 'chefe_empresa') {
      const result = await db.executarQuery(
        'SELECT id FROM chefes_empresas WHERE usuario_id = $1',
        [req.user.id]
      );
      
      if (result.rows.length === 0) {
        return res.status(400).json({ message: 'Perfil de empresa não encontrado' });
      }
      
      recomendadorId = result.rows[0].id;
      
      // Verificar se o jovem está vinculado a esta empresa
      const vinculo = await db.executarQuery(
        'SELECT id FROM jovens_empresas WHERE jovem_id = $1 AND chefe_empresa_id = $2',
        [jovem_id, recomendadorId]
      );
      
      if (vinculo.rows.length === 0) {
        return next(new ForbiddenError('Jovem não está vinculado a esta empresa'));
      }
    }
    
    // Verificar se já existe uma recomendação similar
    const recomendacaoExistente = await db.executarQuery(
      `SELECT id FROM recomendacoes 
       WHERE jovem_id = $1 
       AND oportunidade_id = $2 
       AND recomendador_tipo = $3 
       AND recomendador_id = $4`,
      [jovem_id, oportunidade_id, recomendadorTipo, recomendadorId]
    );
    
    if (recomendacaoExistente.rows.length > 0) {
      return res.status(400).json({ message: 'Recomendação já existe' });
    }
    
    // Inserir recomendação
    try {
      const result = await db.executarQuery(
        `INSERT INTO recomendacoes 
         (jovem_id, oportunidade_id, recomendador_tipo, recomendador_id, justificativa, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [jovem_id, oportunidade_id, recomendadorTipo, recomendadorId, justificativa, 'pendente']
      );
      
      res.status(201).json({
        success: true,
        message: 'Recomendação realizada com sucesso',
        recomendacao: result.rows[0]
      });
    } catch (dbError) {
      return next(new DatabaseError('Erro ao salvar recomendação', { error: dbError.message }));
    }
  } catch (error) {
    next(error);
  }
});

// Atualizar jovem - apenas instituições de ensino podem atualizar
router.put('/:id', authMiddleware, checkRole(['instituicao_ensino']), validate(jovemSchema), async (req, res) => {
  try {
    // Verificar se o jovem existe
    const jovemCheck = await db.executarQuery(
      'SELECT id FROM jovens WHERE id = $1',
      [req.params.id]
    );

    if (jovemCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Jovem não encontrado' });
    }

    // Verificar se o email já está em uso por outro jovem
    const emailCheck = await db.executarQuery(
      'SELECT id FROM jovens WHERE email = $1 AND id != $2',
      [req.body.email, req.params.id]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    // Atualizar jovem
    await db.executarQuery(
      `UPDATE jovens SET 
        nome = $1,
        email = $2,
        idade = $3,
        formacao = $4,
        curso = $5,
        habilidades = $6,
        interesses = $7,
        planos_futuros = $8
      WHERE id = $9`,
      [
        req.body.nome,
        req.body.email,
        req.body.idade,
        req.body.formacao,
        req.body.curso,
        JSON.stringify(req.body.habilidades),
        JSON.stringify(req.body.interesses),
        req.body.planos_futuros,
        req.params.id
      ]
    );

    res.json({ message: 'Jovem atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar jovem:', error);
    res.status(500).json({ message: 'Erro ao atualizar jovem' });
  }
});

// Excluir jovem - apenas instituições de ensino podem excluir
router.delete('/:id', authMiddleware, checkRole(['instituicao_ensino']), async (req, res) => {
  try {
    // Verificar se o jovem existe
    const jovemCheck = await db.executarQuery(
      'SELECT id FROM jovens WHERE id = $1',
      [req.params.id]
    );

    if (jovemCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Jovem não encontrado' });
    }

    // Excluir jovem
    await db.executarQuery(
      'DELETE FROM jovens WHERE id = $1',
      [req.params.id]
    );

    res.json({ message: 'Jovem excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir jovem:', error);
    res.status(500).json({ message: 'Erro ao excluir jovem' });
  }
});

export default router; 