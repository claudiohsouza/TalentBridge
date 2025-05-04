import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { toast } from 'react-hot-toast';
import { UserRole } from '../types';

interface FormData {
  email: string;
  senha: string;
  confirmarSenha: string;
  papel: string;
}

interface FormErrors {
  email?: string;
  senha?: string;
  confirmarSenha?: string;
  geral?: string;
}

export default function Cadastro() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    senha: '',
    confirmarSenha: '',
    papel: 'instituicao'
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo quando ele é modificado
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validarFormulario = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validar email
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
      isValid = false;
    }

    // Validar senha
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
      isValid = false;
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
      isValid = false;
    }

    // Validar confirmação de senha
    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      await authService.registro({
        email: formData.email,
        senha: formData.senha,
        papel: formData.papel as UserRole
      });
      
      toast.success('Cadastro realizado com sucesso!');
      setSucesso(true);
      
      // Redirecionamento automático após 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      
      if (error.response?.data?.erro) {
        setErrors({ geral: error.response.data.erro });
        toast.error(error.response.data.erro);
      } else {
        setErrors({ geral: 'Erro ao conectar com o servidor' });
        toast.error('Erro ao conectar com o servidor');
      }
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
          {sucesso ? (
            <div className="text-center py-8">
              <div className="h-16 w-16 mx-auto rounded-full bg-cursor-primary/20 flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-cursor-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-medium text-cursor-text-primary mb-3">Cadastro Realizado!</h2>
              <p className="text-cursor-text-secondary mb-2">Sua conta foi criada com sucesso.</p>
              <p className="text-cursor-text-tertiary">Redirecionando para o login...</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-medium text-cursor-text-primary mb-6">Cadastro</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-cursor-text-tertiary text-sm mb-1">Tipo de Usuário</label>
                  <select
                    name="papel"
                    className="w-full p-3 rounded-lg bg-cursor-bg text-cursor-text-primary border border-cursor-border focus:border-cursor-primary focus:outline-none"
                    value={formData.papel}
                    onChange={handleChange}
                  >
                    <option value="instituicao">Instituição</option>
                    <option value="empresa">Empresa</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-cursor-text-tertiary text-sm mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="email@exemplo.com"
                    className={`w-full p-3 rounded-lg bg-cursor-bg text-cursor-text-primary border ${
                      errors.email ? 'border-red-500' : 'border-cursor-border'
                    } focus:border-cursor-primary focus:outline-none`}
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-cursor-text-tertiary text-sm mb-1">Senha</label>
                  <input
                    type="password"
                    name="senha"
                    placeholder="••••••••"
                    className={`w-full p-3 rounded-lg bg-cursor-bg text-cursor-text-primary border ${
                      errors.senha ? 'border-red-500' : 'border-cursor-border'
                    } focus:border-cursor-primary focus:outline-none`}
                    value={formData.senha}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                  {errors.senha && <p className="text-red-500 text-sm mt-1">{errors.senha}</p>}
                </div>
                
                <div>
                  <label className="block text-cursor-text-tertiary text-sm mb-1">Confirmar Senha</label>
                  <input
                    type="password"
                    name="confirmarSenha"
                    placeholder="••••••••"
                    className={`w-full p-3 rounded-lg bg-cursor-bg text-cursor-text-primary border ${
                      errors.confirmarSenha ? 'border-red-500' : 'border-cursor-border'
                    } focus:border-cursor-primary focus:outline-none`}
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                    required
                  />
                  {errors.confirmarSenha && <p className="text-red-500 text-sm mt-1">{errors.confirmarSenha}</p>}
                </div>
                
                {errors.geral && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-500 text-sm">{errors.geral}</p>
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
                      Cadastrando...
                    </span>
                  ) : 'Cadastrar'}
                </button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-cursor-text-secondary">
                  Já tem conta?{' '}
                  <Link to="/login" className="text-cursor-primary hover:underline">
                    Faça login
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}