import axios from 'axios';
import db from '../db-connect.js';

const pool = db.pool;

export const emecService = {
    async getAreasEnsino() {
        try {
            const result = await pool.query(
                'SELECT valor, ordem FROM opcoes_sistema WHERE categoria = $1 ORDER BY ordem',
                ['area_ensino']
            );
            return result.rows.map(row => ({
                categoria: 'area_ensino',
                valor: row.valor,
                ordem: row.ordem
            }));
        } catch (error) {
            console.error('Erro ao buscar áreas de ensino:', error);
            return [];
        }
    },

    async getAreasAtuacao() {
        try {
            const result = await pool.query(
                'SELECT valor, ordem FROM opcoes_sistema WHERE categoria = $1 ORDER BY ordem',
                ['areas_atuacao']
            );
            return result.rows.map(row => ({
                categoria: 'areas_atuacao',
                valor: row.valor,
                ordem: row.ordem
            }));
        } catch (error) {
            console.error('Erro ao buscar áreas de atuação:', error);
            return [];
        }
    },

    async getAreasInteresse() {
        try {
            const result = await pool.query(
                'SELECT valor, ordem FROM opcoes_sistema WHERE categoria = $1 ORDER BY ordem',
                ['areas_interesse']
            );
            return result.rows.map(row => ({
                categoria: 'areas_interesse',
                valor: row.valor,
                ordem: row.ordem
            }));
        } catch (error) {
            console.error('Erro ao buscar áreas de interesse:', error);
            return [];
        }
    },

    async getProgramasSociais() {
        try {
            const result = await pool.query(
                'SELECT valor, ordem FROM opcoes_sistema WHERE categoria = $1 ORDER BY ordem',
                ['programas_sociais']
            );
            return result.rows.map(row => ({
                categoria: 'programas_sociais',
                valor: row.valor,
                ordem: row.ordem
            }));
        } catch (error) {
            console.error('Erro ao buscar programas sociais:', error);
            return [];
        }
    }
};

export default emecService; 