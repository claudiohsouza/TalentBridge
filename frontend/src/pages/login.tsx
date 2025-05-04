import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { LoginRequest } from '../types';

export default function Login() {
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    senha: ''
  });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    
    try {
      console.log("Tentando login com:", formData.email);
      
      await login(formData);
      
      // Obter papel do localStorage (definido pela função login do AuthContext)
      const papelUsuario = localStorage.getItem('papel');
      console.log("Login bem-sucedido, papel:", papelUsuario);
      
      // Redirecionar com base no papel
      if (papelUsuario === 'instituicao') {
        navigate('/instituicao');
      } else {
        navigate('/empresa');
      }
      
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      console.error('Erro detalhado no login:', error);
      
      // Mostrando detalhes do erro para debug
      console.log("Status:", error.response?.status);
      console.log("Dados:", error.response?.data);
      
      let mensagemErro = 'Erro ao fazer login. Tente novamente.';
      
      if (error.response) {
        // Erros com resposta do servidor
        if (error.response.status === 401) {
          mensagemErro = 'Email ou senha incorretos';
        } else if (error.response.data?.erro) {
          mensagemErro = error.response.data.erro;
        } else if (error.response.data?.message) {
          mensagemErro = error.response.data.message;
        }
      } else if (error.request) {
        // Erros sem resposta (problemas de rede)
        mensagemErro = 'Erro de conexão com o servidor. Verifique sua internet.';
      }
      
      setErro(mensagemErro);
      toast.error(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cursor-bg relative flex items-center justify-center overflow-hidden">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-cursor-bg-lighter to-cursor-bg opacity-40"></div>
      </div>
      
      {/* Animated blurred blobs */}
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-cursor-primary/20 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-cursor-accent/20 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-md w-full px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-cursor-primary to-cursor-accent bg-clip-text text-transparent">
              TalentBridge
            </span>
          </h1>
        </div>
        
        <div className="bg-cursor-bg-light border border-cursor-border rounded-xl p-6 shadow-cursor animate-fade-in">
          <h2 className="text-2xl font-medium text-cursor-text-primary mb-6">Login</h2>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-cursor-text-tertiary text-sm mb-1">Email</label>
              <input
                type="email"
                name="email"
                placeholder="email@exemplo.com"
                className="w-full p-3 rounded-lg bg-cursor-bg text-cursor-text-primary border border-cursor-border focus:border-cursor-primary focus:outline-none"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-cursor-text-tertiary text-sm mb-1">Senha</label>
              <input
                type="password"
                name="senha"
                placeholder="••••••••"
                className="w-full p-3 rounded-lg bg-cursor-bg text-cursor-text-primary border border-cursor-border focus:border-cursor-primary focus:outline-none"
                value={formData.senha}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            
            {erro && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-500 text-sm">{erro}</p>
              </div>
            )}
            
            <button 
              type="submit" 
              className="w-full p-3 rounded-lg bg-cursor-primary hover:bg-cursor-primary-dark text-white font-medium transition-colors"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </span>
              ) : 'Entrar'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-cursor-text-secondary">
              Não tem conta?{' '}
              <Link to="/cadastro" className="text-cursor-primary hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}