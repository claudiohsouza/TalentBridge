import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AlterarSenha: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.novaSenha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/usuarios/alterar-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          senhaAtual: formData.senhaAtual,
          novaSenha: formData.novaSenha
        })
      });

      if (!response.ok) {
        throw new Error('Senha atual incorreta');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/perfil');
      }, 2000);
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro ao alterar senha. Verifique se a senha atual está correta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-cursor-text-primary">Alterar Senha</h1>
          <p className="text-cursor-text-secondary mt-1">
            Altere sua senha de acesso ao sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card divide-y divide-cursor-border">
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="senhaAtual" className="block text-sm font-medium text-cursor-text-primary mb-1">
                  Senha Atual
                </label>
                <input
                  type="password"
                  id="senhaAtual"
                  name="senhaAtual"
                  value={formData.senhaAtual}
                  onChange={handleChange}
                  required
                  className="input-field w-full"
                  placeholder="Digite sua senha atual"
                />
              </div>

              <div>
                <label htmlFor="novaSenha" className="block text-sm font-medium text-cursor-text-primary mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  id="novaSenha"
                  name="novaSenha"
                  value={formData.novaSenha}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="input-field w-full"
                  placeholder="Digite a nova senha"
                />
                <p className="mt-1 text-xs text-cursor-text-tertiary">
                  A senha deve ter no mínimo 6 caracteres
                </p>
              </div>

              <div>
                <label htmlFor="confirmarSenha" className="block text-sm font-medium text-cursor-text-primary mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  id="confirmarSenha"
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="input-field w-full"
                  placeholder="Confirme a nova senha"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-cursor-background-light flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary min-w-[120px] flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Alterar Senha'
              )}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-cursor-error/10 border-t border-cursor-error/20">
              <p className="text-sm text-cursor-error">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-cursor-success/10 border-t border-cursor-success/20">
              <p className="text-sm text-cursor-success">
                Senha alterada com sucesso! Redirecionando...
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AlterarSenha; 