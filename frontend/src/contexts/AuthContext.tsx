import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, LoginRequest, UserRole, ApiResponse } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  verifyToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Função para verificar se o token é válido
  const verifyToken = async (): Promise<boolean> => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log("[AuthContext] Nenhum token encontrado");
      setUser(null);
      return false;
    }

    try {
      console.log("[AuthContext] Verificando token...");
      const response = await authService.verificarToken();
      console.log("[AuthContext] Resposta da verificação:", JSON.stringify(response));
      
      if (response && response.usuario) {
        // Atualizar o usuário com os dados da resposta
        const userData: User = {
          id: response.usuario.id,
          email: response.usuario.email,
          papel: response.usuario.papel
        };
        
        console.log("[AuthContext] Usuário autenticado com sucesso:", 
          JSON.stringify({
            id: userData.id,
            email: userData.email,
            papel: userData.papel
          })
        );
        
        setUser(userData);
        
        // Atualizar localStorage com dados mais recentes
        localStorage.setItem('email', userData.email);
        localStorage.setItem('papel', userData.papel);
        
        return true;
      } else {
        console.warn("[AuthContext] Dados de usuário não encontrados na resposta:", response);
        throw new Error("Dados de usuário não encontrados na resposta");
      }
    } catch (error) {
      console.error('[AuthContext] Erro na verificação do token:', error);
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
    
    try {
      console.log("[AuthContext] Tentando fazer login com:", credentials.email);
      const response = await authService.login(credentials);
      console.log("[AuthContext] Resposta do login:", JSON.stringify({
        token: response.token ? "***" : null,
        papel: response.papel,
        usuario: response.usuario ? {
          id: response.usuario.id,
          email: response.usuario.email,
          papel: response.usuario.papel
        } : null
      }));
      
      if (!response || !response.token) {
        throw new Error("Token não encontrado na resposta");
      }
      
      // Salvar dados no localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('papel', response.papel);
      localStorage.setItem('email', response.usuario.email);
      
      // Atualizar estado do usuário
      const userData = {
        id: response.usuario.id,
        email: response.usuario.email,
        papel: response.papel
      };
      console.log("[AuthContext] Usuário logado com sucesso:", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('[AuthContext] Erro no login:', error);
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
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    verifyToken
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