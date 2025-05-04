/**
 * Tipos comuns para o frontend
 */

// Tipos de usuário
export type UserRole = 'instituicao' | 'empresa';

export interface User {
  id?: number;
  email: string;
  papel: UserRole;
  verificado?: boolean;
  criado_em?: string;
  atualizado_em?: string;
}

// Autenticação
export interface AuthResponse {
  token: string;
  papel: UserRole;
  usuario: User;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  email: string;
  senha: string;
  papel: UserRole;
}

// Estudante
export interface Estudante {
  id: number;
  nome: string;
  email: string;
  media_geral: number | null;
  estabilidade_estresse: number | null;
  habilidades: string[] | null;
  planos_futuros: string | null;
  instituicao_id: number;
  instituicao_email: string;
  criado_em: string;
  atualizado_em: string;
}

export interface EstudanteInput {
  nome: string;
  email: string;
  media_geral?: number;
  estabilidade_estresse?: number;
  habilidades?: string[];
  planos_futuros?: string;
}

// Respostas de API
export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  status?: string;
  usuario?: User;
  token?: string;
  papel?: UserRole;
}

// Rotas
export interface BreadcrumbItem {
  label: string;
  path: string;
}

// Estado global da aplicação
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
} 