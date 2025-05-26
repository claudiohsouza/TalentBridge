import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usuarioService } from '../services/api';

const AlterarSenhaPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{mensagem: string, tipo: 'success' | 'error'} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (novaSenha.length < 6) {
      setFeedback({
        mensagem: 'A nova senha deve ter pelo menos 6 caracteres.',
        tipo: 'error'
      });
      return;
    }
    
    if (novaSenha !== confirmarSenha) {
      setFeedback({
        mensagem: 'As senhas não coincidem.',
        tipo: 'error'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await usuarioService.alterarSenha({
        senhaAtual,
        novaSenha
      });
      
      setFeedback({
        mensagem: 'Senha alterada com sucesso!',
        tipo: 'success'
      });
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      
      // Redirecionar para perfil após alguns segundos
      setTimeout(() => {
        navigate('/perfil');
      }, 2000);
    } catch (err: any) {
      setFeedback({
        mensagem: err.response?.data?.message || 'Erro ao alterar senha',
        tipo: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/perfil');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl animate-fade-in">
      <div className="mb-8">
        <h1 className="section-title">Alterar Senha</h1>
        <p className="section-subtitle">
          Atualize sua senha de acesso
        </p>
      </div>
      
      <div className="card p-6">
        {feedback && (
          <div className={`p-4 mb-6 rounded-lg ${feedback.tipo === 'success' ? 'bg-cursor-success/10 text-cursor-success' : 'bg-cursor-error/10 text-cursor-error'}`}>
            {feedback.mensagem}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="senha-atual" className="block text-cursor-text-secondary text-sm font-medium mb-2">
              Senha Atual*
            </label>
            <input
              id="senha-atual"
              type="password"
              className="input-field"
              value={senhaAtual}
              onChange={e => setSenhaAtual(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <div>
            <label htmlFor="nova-senha" className="block text-cursor-text-secondary text-sm font-medium mb-2">
              Nova Senha*
            </label>
            <input
              id="nova-senha"
              type="password"
              className="input-field"
              value={novaSenha}
              onChange={e => setNovaSenha(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
            <p className="text-xs text-cursor-text-tertiary mt-1">
              Mínimo de 6 caracteres
            </p>
          </div>
          
          <div>
            <label htmlFor="confirmar-senha" className="block text-cursor-text-secondary text-sm font-medium mb-2">
              Confirmar Nova Senha*
            </label>
            <input
              id="confirmar-senha"
              type="password"
              className="input-field"
              value={confirmarSenha}
              onChange={e => setConfirmarSenha(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Salvando...
                </>
              ) : (
                'Salvar Nova Senha'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlterarSenhaPage; 