import axios from 'axios';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  ApiResponse,
  Jovem,
  JovemInput,
  Oportunidade,
  OportunidadeInput
} from '../types';

// Configuração do axios
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_API_URL 
    : '',  // Em desenvolvimento, usa o proxy do package.json
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8'
  },
  withCredentials: true,
  timeout: 10000
});

// Função para decodificar caracteres especiais em objetos
const decodeObject = (obj: any): any => {
  if (!obj) return obj;
  
  // Se for um array, decodifica cada item
  if (Array.isArray(obj)) {
    return obj.map(item => decodeObject(item));
  }
  
  // Se for um objeto, decodifica cada propriedade
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = decodeObject(obj[key]);
    }
    return result;
  }
  
  // Se for uma string, decodifica
  if (typeof obj === 'string') {
    try {
      // Decodifica caracteres HTML e depois UTF-8
      const textarea = document.createElement('textarea');
      textarea.innerHTML = obj;
      const decoded = textarea.value;
      return decodeURIComponent(escape(decoded));
    } catch (e) {
      return obj;
    }
  }
  
  // Outros tipos retornam como estão
  return obj;
};

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    
    if (token) {
      console.log('[API] Adicionando token à requisição');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('[API] Nenhum token disponível');
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação e respostas
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    
    // Decodifica os dados da resposta
    if (response.data) {
      response.data = decodeObject(response.data);
    }
    
    return response;
  },
  (error) => {
    console.error('[API] Erro de resposta:', error.response?.status, error.response?.data);
    
    // Tratar erros de autenticação (401)
    if (error.response?.status === 401) {
      console.log('[API] Token expirado ou inválido, redirecionando para login');
      localStorage.removeItem('token');
      localStorage.removeItem('papel');
      localStorage.removeItem('email');
      
      // Apenas redirecionar se não estiver já na página de login ou registro
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/cadastro' && path !== '/') {
        window.location.href = '/login';
      }
    }
    
    // Tratar erros 404
    if (error.response?.status === 404) {
      console.log('[API] Recurso não encontrado');
      error.message = error.response.data.message || 'Recurso não encontrado';
    }
    
    // Tratar erros 500
    if (error.response?.status >= 500) {
      console.error('[API] Erro interno do servidor');
      error.message = 'Erro interno do servidor. Por favor, tente novamente.';
    }
    
    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      console.log('[Auth Service] Tentando login com:', credentials.email);
      const response = await api.post<AuthResponse>('/api/auth/login', credentials);
      console.log('[Auth Service] Login bem-sucedido:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth Service] Erro no serviço de login:', error);
      throw error;
    }
  },
  
  registro: async (data: RegisterRequest): Promise<ApiResponse<User>> => {
    try {
      console.log('[Auth Service] Tentando registro com:', data.email);
      const response = await api.post<ApiResponse<User>>('/api/auth/registro', data);
      console.log('[Auth Service] Registro bem-sucedido:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth Service] Erro no serviço de registro:', error);
      throw error;
    }
  },
  
  verificarToken: async (): Promise<ApiResponse<User>> => {
    try {
      console.log('[Auth Service] Verificando token');
      const response = await api.get<ApiResponse<User>>('/api/auth/verify');
      console.log('[Auth Service] Verificação de token bem-sucedida:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth Service] Erro no serviço de verificação de token:', error);
      throw error;
    }
  }
};

// Serviços de usuário
export const usuarioService = {
  getPerfil: async (): Promise<User> => {
    try {
      console.log('[User Service] Buscando perfil do usuário');
      const response = await api.get<User>('/api/usuario/me');
      console.log('[User Service] Perfil recuperado:', response.data);
      return response.data;
    } catch (error) {
      console.error('[User Service] Erro ao buscar perfil:', error);
      throw error;
    }
  },
  
  atualizarPerfil: async (data: { email?: string, senhaAtual?: string, novaSenha?: string }): Promise<ApiResponse<User>> => {
    try {
      console.log('[User Service] Atualizando perfil');
      const response = await api.put<ApiResponse<User>>('/api/usuario/me', data);
      console.log('[User Service] Perfil atualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('[User Service] Erro ao atualizar perfil:', error);
      throw error;
    }
  },

  alterarSenha: async (data: { senhaAtual: string, novaSenha: string }): Promise<ApiResponse<void>> => {
    try {
      console.log('[User Service] Alterando senha');
      const response = await api.put<ApiResponse<void>>('/api/usuario/alterar-senha', data);
      console.log('[User Service] Senha alterada com sucesso');
      return response.data;
    } catch (error) {
      console.error('[User Service] Erro ao alterar senha:', error);
      throw error;
    }
  }
};

// Serviços de Jovens
export const jovemService = {
  listarJovens: async (): Promise<Jovem[]> => {
    try {
      const response = await api.get<Jovem[]>('/api/jovens');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar jovens:', error);
      throw error;
    }
  },

  getJovem: async (id: number): Promise<Jovem> => {
    try {
      const response = await api.get<Jovem>(`/api/jovens/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar jovem:', error);
      throw error;
    }
  },

  adicionarJovem: async (data: JovemInput): Promise<Jovem> => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.papel !== 'instituicao_ensino') {
        throw new Error('Apenas instituições de ensino podem adicionar jovens');
      }

      console.log('Adicionando jovem:', data);
      const response = await api.post<Jovem>('/api/jovens', data);
      console.log('Jovem adicionado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar jovem:', error);
      throw error;
    }
  },

  atualizarJovem: async (id: number, data: JovemInput): Promise<Jovem> => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.papel !== 'instituicao_ensino') {
        throw new Error('Apenas instituições de ensino podem atualizar jovens');
      }

      console.log('Atualizando jovem:', id, data);
      const response = await api.put<Jovem>(`/api/jovens/${id}`, data);
      console.log('Jovem atualizado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar jovem:', error);
      throw error;
    }
  },

  excluirJovem: async (id: number): Promise<void> => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.papel !== 'instituicao_ensino') {
        throw new Error('Apenas instituições de ensino podem excluir jovens');
      }

      await api.delete(`/api/jovens/${id}`);
    } catch (error) {
      console.error('Erro ao excluir jovem:', error);
      throw error;
    }
  }
};

// Serviços de Oportunidades
export const oportunidadeService = {
  listarOportunidades: async (): Promise<Oportunidade[]> => {
    try {
      console.log('[Oportunidade Service] Listando oportunidades');
      const response = await api.get<Oportunidade[]>('/api/oportunidades');
      console.log('[Oportunidade Service] Oportunidades encontradas:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('[Oportunidade Service] Erro ao listar oportunidades:', error);
      throw error;
    }
  },

  getOportunidade: async (id: number): Promise<Oportunidade> => {
    try {
      console.log(`[Oportunidade Service] Buscando oportunidade ID ${id}`);
      const response = await api.get<Oportunidade>(`/api/oportunidades/${id}`);
      console.log('[Oportunidade Service] Oportunidade encontrada:', response.data);
      return response.data;
    } catch (error) {
      console.error(`[Oportunidade Service] Erro ao buscar oportunidade ID ${id}:`, error);
      throw error;
    }
  },
  
  adicionarOportunidade: async (oportunidade: OportunidadeInput): Promise<Oportunidade> => {
    try {
      console.log('[Oportunidade Service] Adicionando oportunidade:', oportunidade.titulo);
      const response = await api.post<Oportunidade>('/api/oportunidades', oportunidade);
      console.log('[Oportunidade Service] Oportunidade adicionada:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Oportunidade Service] Erro ao adicionar oportunidade:', error);
      throw error;
    }
  },

  atualizarOportunidade: async (id: number, oportunidade: OportunidadeInput): Promise<Oportunidade> => {
    try {
      console.log(`[Oportunidade Service] Atualizando oportunidade ID ${id}:`, oportunidade.titulo);
      const response = await api.put<Oportunidade>(`/api/oportunidades/${id}`, oportunidade);
      console.log('[Oportunidade Service] Oportunidade atualizada:', response.data);
      return response.data;
    } catch (error) {
      console.error(`[Oportunidade Service] Erro ao atualizar oportunidade ID ${id}:`, error);
      throw error;
    }
  },

  excluirOportunidade: async (id: number): Promise<ApiResponse<null>> => {
    try {
      console.log(`[Oportunidade Service] Excluindo oportunidade ID ${id}`);
      const response = await api.delete<ApiResponse<null>>(`/api/oportunidades/${id}`);
      console.log('[Oportunidade Service] Oportunidade excluída');
      return response.data;
    } catch (error) {
      console.error(`[Oportunidade Service] Erro ao excluir oportunidade ID ${id}:`, error);
      throw error;
    }
  }
};

// Serviço para obter opções do sistema
export const opcoesService = {
  // Buscar todas as opções disponíveis
  obterTodasOpcoes: async () => {
    const response = await fetch('/api/opcoes', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Erro ao carregar opções do sistema');
    }
    
    return response.json();
  },
  
  // Buscar opções específicas por categoria
  obterOpcoesPorCategoria: async (categoria: string) => {
    const response = await fetch(`/api/opcoes/${categoria}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao carregar opções da categoria: ${categoria}`);
    }
    
    return response.json();
  }
};

export default api; 