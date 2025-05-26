import api from './api';
import { OpcoesService, OpcaoPadrao, OpcoesResponse } from '../types';

export const opcoesService: OpcoesService = {
  // Buscar todas as opções disponíveis
  obterTodasOpcoes: async (): Promise<OpcoesResponse> => {
    try {
      console.log('[Opcoes Service] Buscando todas as opções');
      const response = await api.get<OpcoesResponse>('/api/opcoes');
      console.log('[Opcoes Service] Opções recebidas:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Opcoes Service] Erro ao buscar opções:', error);
      throw error;
    }
  },

  // Buscar opções de uma categoria específica
  obterOpcoesPorCategoria: async (categoria: string): Promise<OpcaoPadrao[]> => {
    try {
      console.log(`[Opcoes Service] Buscando opções da categoria: ${categoria}`);
      const response = await api.get<OpcaoPadrao[]>(`/api/opcoes/${categoria}`);
      console.log(`[Opcoes Service] Opções da categoria ${categoria} recebidas:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`[Opcoes Service] Erro ao buscar opções da categoria ${categoria}:`, error);
      throw error;
    }
  },

  // Inicializar opções do sistema
  inicializarOpcoes: async (limpar: boolean = false): Promise<any> => {
    try {
      console.log('[Opcoes Service] Inicializando opções do sistema');
      const response = await api.post('/api/opcoes/init', { limpar });
      console.log('[Opcoes Service] Opções inicializadas:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Opcoes Service] Erro ao inicializar opções:', error);
      throw error;
    }
  },

  // Constantes para os tipos de categorias
  CATEGORIAS: {
    AREAS_ENSINO: 'area_ensino',
    AREAS_ATUACAO: 'area_atuacao',
    AREAS_INTERESSE: 'area_interesse',
    PROGRAMAS_SOCIAIS: 'programa_social',
    TIPOS_INSTITUICAO: 'tipos_instituicao',
    TIPOS_INSTITUICAO_ENSINO: 'tipos_instituicao_ensino',
    SETORES_EMPRESA: 'setores_empresa',
    PORTES_EMPRESA: 'portes_empresa'
  }
}; 