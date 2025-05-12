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
  const [user, setUser] = useState<User | null>(() => {
    // Tentar recuperar dados do usuário do localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Erro ao parsear usuário salvo:', e);
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para verificar e atualizar o token
  const verifyToken = async (): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return false;
    }

    try {
      const response = await usuarioService.getPerfil();
      setUser(response);
      localStorage.setItem('user', JSON.stringify(response));
      return true;
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Verificar token ao montar o componente
  useEffect(() => {
    verifyToken();
  }, []);

  // Limpar mensagens de erro
  const clearError = () => {
    setError(null);
  };

  // Função de login
  const login = async (credentials: LoginRequest): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      const { token, usuario } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));
      setUser(usuario);
    } catch (error: any) {
      console.error('[Auth] Erro no login:', error);
      const errorMessage = error.response?.data?.message || error.message || "Erro ao fazer login";
      setError(errorMessage);
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
      
      const response = await usuarioService.atualizarPerfil(userData);
      
      if (response.usuario) {
        const updatedUser = { ...user, ...response.usuario };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      console.log("Perfil atualizado com sucesso!");
    } catch (error: any) {
      console.error('[Auth] Erro na atualização do usuário:', error);
      const errorMessage = error.response?.data?.message || error.message || "Erro ao atualizar usuário";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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