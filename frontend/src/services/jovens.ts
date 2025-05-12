import api from './api';
import { Jovem } from '../types';

export const jovensService = {
  // Listar jovens
  listarJovens: async (): Promise<Jovem[]> => {
    try {
      console.log('[JovensService] Listando jovens');
      const response = await api.get('/api/jovens');
      console.log('[JovensService] Jovens listados com sucesso:', response.data.length);
      return response.data;
    } catch (error: any) {
      console.error('[JovensService] Erro ao listar jovens:', error.response?.data || error.message);
      throw error;
    }
  },

  // Obter um jovem específico
  obterJovem: async (id: number): Promise<Jovem> => {
    try {
      console.log(`[JovensService] Buscando jovem com ID: ${id}`);
      const response = await api.get(`/api/jovens/${id}`);
      console.log('[JovensService] Jovem encontrado:', response.data);
      
      // Garantir que habilidades e interesses sejam sempre arrays
      const jovem = {
        ...response.data,
        habilidades: Array.isArray(response.data.habilidades) ? response.data.habilidades : [],
        interesses: Array.isArray(response.data.interesses) ? response.data.interesses : [],
        historico: Array.isArray(response.data.historico) ? response.data.historico : [],
        badges: Array.isArray(response.data.badges) ? response.data.badges : [],
        avaliacoes: Array.isArray(response.data.avaliacoes) ? response.data.avaliacoes : []
      };
      
      return jovem;
    } catch (error: any) {
      console.error(`[JovensService] Erro ao buscar jovem ${id}:`, error.response?.data || error.message);
      if (error.response?.status === 404) {
        throw new Error('Jovem não encontrado');
      }
      throw new Error(error.response?.data?.message || 'Erro ao carregar dados do jovem');
    }
  },

  // Criar novo jovem
  criarJovem: async (jovem: Omit<Jovem, 'id'>): Promise<Jovem> => {
    try {
      console.log('[JovensService] Criando novo jovem:', jovem);
      const response = await api.post('/api/jovens', jovem);
      console.log('[JovensService] Jovem criado com sucesso:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[JovensService] Erro ao criar jovem:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Erro ao criar jovem');
    }
  },

  // Atualizar jovem
  atualizarJovem: async (id: number, jovem: Partial<Jovem>): Promise<Jovem> => {
    try {
      console.log(`[JovensService] Atualizando jovem ${id}:`, jovem);
      const response = await api.put(`/api/jovens/${id}`, jovem);
      console.log('[JovensService] Jovem atualizado com sucesso:', response.data);
      return response.data;
    } catch (error: any) {
      console.error(`[JovensService] Erro ao atualizar jovem ${id}:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Erro ao atualizar jovem');
    }
  },

  // Excluir jovem
  excluirJovem: async (id: number): Promise<void> => {
    try {
      console.log(`[JovensService] Excluindo jovem ${id}`);
      await api.delete(`/api/jovens/${id}`);
      console.log(`[JovensService] Jovem ${id} excluído com sucesso`);
    } catch (error: any) {
      console.error(`[JovensService] Erro ao excluir jovem ${id}:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Erro ao excluir jovem');
    }
  }
}; 