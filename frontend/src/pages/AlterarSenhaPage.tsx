import React, { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const AlterarSenhaPage: React.FC = () => {
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== confirmarSenha) {
      toast.error('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      await axios.put('/api/usuario/me', { senha });
      toast.success('Senha alterada com sucesso!');
      setSenha('');
      setConfirmarSenha('');
    } catch (err: any) {
      toast.error(err.response?.data?.erro || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
      <Toaster position="top-right" />
      <div className="bg-gray-800 bg-opacity-90 p-8 rounded-lg shadow-md w-full max-w-md mt-10 animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 text-gray-100 text-center">Alterar Senha</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-300 mb-1">Nova Senha</label>
            <input
              type="password"
              className="w-full p-2 border rounded bg-gray-900 text-gray-100 border-gray-700"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Confirmar Nova Senha</label>
            <input
              type="password"
              className="w-full p-2 border rounded bg-gray-900 text-gray-100 border-gray-700"
              value={confirmarSenha}
              onChange={e => setConfirmarSenha(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            className="bg-gray-700 text-gray-100 p-2 rounded hover:bg-gray-600 transition"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Alterar Senha'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AlterarSenhaPage; 