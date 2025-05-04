import axios from 'axios';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  Estudante,
  EstudanteInput,
  ApiResponse
} from '../types';

// Configuração do axios
const API_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Importante para enviar cookies nas requisições cross-origin
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8'
  },
  // Timeout em ms
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
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
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
    console.error('Erro de resposta API:', error);
    
    // Tratar erros de autenticação (401)
    if (error.response?.status === 401) {
      console.log('Token expirado ou inválido, redirecionando para login');
      localStorage.removeItem('token');
      localStorage.removeItem('papel');
      localStorage.removeItem('email');
      
      // Apenas redirecionar se não estiver já na página de login ou registro
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/cadastro' && path !== '/') {
        window.location.href = '/login';
      }
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
  }
};

// Serviços de estudantes
export const estudanteService = {
  listarEstudantes: async (): Promise<Estudante[]> => {
    try {
      console.log('[Estudante Service] Listando estudantes');
      const response = await api.get<Estudante[]>('/api/estudantes');
      console.log('[Estudante Service] Estudantes encontrados:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('[Estudante Service] Erro ao listar estudantes:', error);
      throw error;
    }
  },

  getEstudante: async (id: number): Promise<Estudante> => {
    try {
      console.log(`[Estudante Service] Buscando estudante ID ${id}`);
      const response = await api.get<Estudante>(`/api/estudantes/${id}`);
      console.log('[Estudante Service] Estudante encontrado:', response.data);
      return response.data;
    } catch (error) {
      console.error(`[Estudante Service] Erro ao buscar estudante ID ${id}:`, error);
      throw error;
    }
  },
  
  adicionarEstudante: async (estudante: EstudanteInput): Promise<Estudante> => {
    try {
      console.log('[Estudante Service] Adicionando estudante:', estudante.nome);
      const response = await api.post<Estudante>('/api/estudantes', estudante);
      console.log('[Estudante Service] Estudante adicionado:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Estudante Service] Erro ao adicionar estudante:', error);
      throw error;
    }
  },

  atualizarEstudante: async (id: number, estudante: EstudanteInput): Promise<Estudante> => {
    try {
      console.log(`[Estudante Service] Atualizando estudante ID ${id}:`, estudante.nome);
      const response = await api.put<Estudante>(`/api/estudantes/${id}`, estudante);
      console.log('[Estudante Service] Estudante atualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error(`[Estudante Service] Erro ao atualizar estudante ID ${id}:`, error);
      throw error;
    }
  },

  excluirEstudante: async (id: number): Promise<ApiResponse<null>> => {
    try {
      console.log(`[Estudante Service] Excluindo estudante ID ${id}`);
      const response = await api.delete<ApiResponse<null>>(`/api/estudantes/${id}`);
      console.log('[Estudante Service] Estudante excluído');
      return response.data;
    } catch (error) {
      console.error(`[Estudante Service] Erro ao excluir estudante ID ${id}:`, error);
      throw error;
    }
  }
};

export default api; 