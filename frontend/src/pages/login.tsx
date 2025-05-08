import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginRequest, UserRole } from '../types';

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
      const papelUsuario = localStorage.getItem('papel') as UserRole;
      console.log("Login bem-sucedido, papel:", papelUsuario);
      
      // Redirecionar com base no papel
      if (papelUsuario === 'instituicao_ensino') {
        navigate('/instituicao-ensino');
      } else if (papelUsuario === 'chefe_empresa') {
        navigate('/chefe-empresa');
      } else if (papelUsuario === 'instituicao_contratante') {
        navigate('/instituicao-contratante');
      } else {
        // Caso padrão, redireciona para a home
        navigate('/');
      }
      
      // Mostrar mensagem de sucesso
      setErro('');
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cursor-background relative flex items-center justify-center overflow-hidden">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-cursor-background-light to-cursor-background opacity-40"></div>
      </div>
      
      {/* Animated blurred blobs */}
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-cursor-primary/20 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-cursor-secondary/20 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-md w-full px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-cursor-primary to-cursor-secondary bg-clip-text text-transparent">
              TalentBridge
            </span>
          </h1>
        </div>
        
        <div className="card p-6 animate-fade-in">
          <h2 className="section-title mb-6">Login</h2>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-cursor-text-secondary text-sm mb-2">Email</label>
              <input
                type="email"
                name="email"
                placeholder="email@exemplo.com"
                className="input-field"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-cursor-text-secondary text-sm mb-2">Senha</label>
              <input
                type="password"
                name="senha"
                placeholder="••••••••"
                className="input-field"
                value={formData.senha}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            
            {erro && (
              <div className="p-3 bg-cursor-error/10 border border-cursor-error/30 rounded-lg">
                <p className="text-cursor-error text-sm">{erro}</p>
              </div>
            )}
            
            <button 
              type="submit" 
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </>
              ) : 'Entrar'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-cursor-text-secondary">
              Não tem conta?{' '}
              <Link to="/cadastro" className="text-cursor-primary hover:text-cursor-primary-dark transition-colors">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}