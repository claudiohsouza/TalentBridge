import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, LoginRequest, ApiResponse } from '../types';
import { authService } from '../services/api';
import { usuarioService } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  verifyToken: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar token ao iniciar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await verifyToken();
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Limpar mensagens de erro
  const clearError = () => {
    setError(null);
  };

  // Função para verificar se o token é válido
  const verifyToken = async (): Promise<boolean> => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log("[Auth] Nenhum token encontrado");
      setUser(null);
      return false;
    }

    try {
      console.log("[Auth] Verificando token...");
      const response = await authService.verificarToken();
      
      if (response && response.usuario) {
        // Atualizar o usuário com os dados da resposta
        const userData: User = {
          id: response.usuario.id,
          email: response.usuario.email,
          papel: response.usuario.papel,
          nome: response.usuario.nome || 'Usuário',
          perfil: response.usuario.perfil
        };
        
        console.log("[Auth] Usuário autenticado com sucesso:", userData.email);
        
        setUser(userData);
        return true;
      } else {
        console.warn("[Auth] Dados de usuário não encontrados na resposta");
        throw new Error("Dados de usuário não encontrados na resposta");
      }
    } catch (error) {
      console.error('[Auth] Erro na verificação do token:', error);
      // Limpar dados de autenticação
      localStorage.removeItem('token');
      localStorage.removeItem('papel');
      localStorage.removeItem('email');
      setUser(null);
      return false;
    }
  };

  // Função de login
  const login = async (credentials: LoginRequest): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("[Auth] Tentando fazer login com:", credentials.email);
      const response = await authService.login(credentials);
      
      if (!response || !response.token) {
        throw new Error("Token não encontrado na resposta");
      }
      
      // Salvar dados no localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('papel', response.papel || '');
      localStorage.setItem('email', response.usuario?.email || '');
      
      // Atualizar estado do usuário
      const userData: User = {
        id: response.usuario.id,
        email: response.usuario.email,
        papel: response.papel,
        nome: response.usuario.nome,
        perfil: response.usuario.perfil
      };
      
      console.log("[Auth] Login bem-sucedido:", userData.email);
      setUser(userData);
      console.log("Login realizado com sucesso!");
    } catch (error: any) {
      console.error('[Auth] Erro no login:', error);
      const errorMessage = error.response?.data?.message || error.message || "Erro ao fazer login";
      setError(errorMessage);
      console.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função de atualização do usuário
  const updateUser = async (userData: Partial<User>): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      // Implementar chamada à API para atualizar o usuário
      const response = await usuarioService.atualizarPerfil(userData);
      
      // Atualizar estado local com os dados retornados
      if (response.usuario) {
        const updatedUser = { ...user, ...response.usuario };
        setUser(updatedUser);
      } else {
        // Fallback: se não recebeu dados do servidor, atualiza com os dados locais
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
      }
      
      console.log("Perfil atualizado com sucesso!");
    } catch (error: any) {
      console.error('[Auth] Erro na atualização do usuário:', error);
      const errorMessage = error.response?.data?.message || error.message || "Erro ao atualizar usuário";
      setError(errorMessage);
      console.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('papel');
    localStorage.removeItem('email');
    setUser(null);
    console.log("Logout realizado com sucesso!");
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    verifyToken,
    updateUser,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar o contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}; 