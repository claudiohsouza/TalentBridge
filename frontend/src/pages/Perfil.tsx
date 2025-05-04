import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { FaKey, FaEnvelope, FaIdBadge, FaUser, FaChevronRight } from 'react-icons/fa';
import Breadcrumbs from '../components/Breadcrumbs';

const Perfil: React.FC = () => {
  const [email, setEmail] = useState('');
  const [papel, setPapel] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [senhaParaEmail, setSenhaParaEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [alterandoSenha, setAlterandoSenha] = useState(false);
  const [alterandoEmail, setAlterandoEmail] = useState(false);

  useEffect(() => {
    async function fetchPerfil() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/usuario/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmail(res.data.email);
        setPapel(res.data.papel);
      } catch {
        toast.error('Erro ao carregar perfil');
      }
    }
    fetchPerfil();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (alterandoSenha) {
      if (novaSenha !== confirmarSenha) {
        toast.error('As senhas não coincidem');
        setLoading(false);
        return;
      }

      if (novaSenha.length < 6) {
        toast.error('A nova senha deve ter pelo menos 6 caracteres');
        setLoading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const dados: any = {};

      if (alterandoEmail) {
        if (!novoEmail) {
          toast.error('Digite o novo email');
          setLoading(false);
          return;
        }
        if (!senhaParaEmail) {
          toast.error('Digite sua senha atual para alterar o email');
          setLoading(false);
          return;
        }
        dados.email = novoEmail;
        dados.senhaAtual = senhaParaEmail;
      }

      if (alterandoSenha) {
        dados.senhaAtual = senhaAtual;
        dados.novaSenha = novaSenha;
      }

      const res = await axios.put('http://localhost:5000/api/usuario/me', dados, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (alterandoEmail) {
        setEmail(res.data.email);
        localStorage.setItem('email', res.data.email);
        setNovoEmail('');
        setSenhaParaEmail('');
        setAlterandoEmail(false);
      }
      
      if (alterandoSenha) {
        setSenhaAtual('');
        setNovaSenha('');
        setConfirmarSenha('');
        setAlterandoSenha(false);
      }

      toast.success('Perfil atualizado com sucesso!');
    } catch (err: any) {
      toast.error(err.response?.data?.erro || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cursor-bg">
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Breadcrumbs 
          items={[
            { label: 'Home', path: '/' },
            { label: 'Meu Perfil', path: '/perfil' }
          ]}
        />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-cursor-primary to-cursor-accent bg-clip-text text-transparent">
              Meu Perfil
            </span>
          </h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Menu lateral */}
          <div className="md:col-span-1">
            <div className="bg-cursor-bg-light border border-cursor-border rounded-xl p-5 shadow-cursor">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-full bg-cursor-primary/20 flex items-center justify-center">
                  <FaUser className="text-cursor-primary text-lg" />
                </div>
                <div>
                  <h3 className="font-medium text-cursor-text-primary">{email}</h3>
                  <p className="text-sm text-cursor-text-tertiary">
                    {papel.charAt(0).toUpperCase() + papel.slice(1)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setAlterandoEmail(!alterandoEmail);
                    setAlterandoSenha(false);
                    setNovoEmail('');
                    setSenhaParaEmail('');
                  }}
                  className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors ${
                    alterandoEmail 
                      ? 'bg-cursor-primary text-white' 
                      : 'text-cursor-text-secondary hover:bg-cursor-bg-lighter hover:text-cursor-text-primary'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FaEnvelope /> Alterar email
                  </span>
                  <FaChevronRight className={`text-xs transition-transform ${alterandoEmail ? 'rotate-90' : ''}`} />
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setAlterandoSenha(!alterandoSenha);
                    setAlterandoEmail(false);
                    setSenhaAtual('');
                    setNovaSenha('');
                    setConfirmarSenha('');
                  }}
                  className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors ${
                    alterandoSenha 
                      ? 'bg-cursor-primary text-white' 
                      : 'text-cursor-text-secondary hover:bg-cursor-bg-lighter hover:text-cursor-text-primary'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FaKey /> Alterar senha
                  </span>
                  <FaChevronRight className={`text-xs transition-transform ${alterandoSenha ? 'rotate-90' : ''}`} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Formulário */}
          <div className="md:col-span-2">
            <div className="bg-cursor-bg-light border border-cursor-border rounded-xl p-6 shadow-cursor">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h2 className="text-xl font-medium text-cursor-text-primary mb-4">
                    {alterandoEmail ? 'Alterar Email' : alterandoSenha ? 'Alterar Senha' : 'Informações da Conta'}
                  </h2>
                  
                  {!alterandoEmail && !alterandoSenha && (
                    <>
                      <div className="space-y-4">
                        <div className="bg-cursor-bg p-4 rounded-lg border border-cursor-border">
                          <label className="block text-cursor-text-tertiary text-sm mb-1">
                            Endereço de Email
                          </label>
                          <div className="text-cursor-text-primary font-medium">{email}</div>
                        </div>
                        
                        <div className="bg-cursor-bg p-4 rounded-lg border border-cursor-border">
                          <label className="block text-cursor-text-tertiary text-sm mb-1">
                            Papel no Sistema
                          </label>
                          <div className="text-cursor-text-primary font-medium">
                            {papel.charAt(0).toUpperCase() + papel.slice(1)}
                          </div>
                        </div>
                        
                        <p className="text-cursor-text-secondary mt-4 text-sm">
                          Selecione uma opção no menu à esquerda para alterar suas informações.
                        </p>
                      </div>
                    </>
                  )}

                  {alterandoEmail && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-cursor-text-tertiary text-sm mb-1">
                          Novo Email
                        </label>
                        <input
                          type="email"
                          className="w-full p-3 rounded-lg bg-cursor-bg text-cursor-text-primary border border-cursor-border focus:border-cursor-primary focus:outline-none"
                          value={novoEmail}
                          onChange={e => setNovoEmail(e.target.value)}
                          placeholder="seu.novo@email.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-cursor-text-tertiary text-sm mb-1">
                          Senha Atual (para confirmar)
                        </label>
                        <input
                          type="password"
                          className="w-full p-3 rounded-lg bg-cursor-bg text-cursor-text-primary border border-cursor-border focus:border-cursor-primary focus:outline-none"
                          value={senhaParaEmail}
                          onChange={e => setSenhaParaEmail(e.target.value)}
                          placeholder="Digite sua senha atual"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {alterandoSenha && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-cursor-text-tertiary text-sm mb-1">
                          Senha Atual
                        </label>
                        <input
                          type="password"
                          className="w-full p-3 rounded-lg bg-cursor-bg text-cursor-text-primary border border-cursor-border focus:border-cursor-primary focus:outline-none"
                          value={senhaAtual}
                          onChange={e => setSenhaAtual(e.target.value)}
                          placeholder="Digite sua senha atual"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-cursor-text-tertiary text-sm mb-1">
                          Nova Senha
                        </label>
                        <input
                          type="password"
                          className="w-full p-3 rounded-lg bg-cursor-bg text-cursor-text-primary border border-cursor-border focus:border-cursor-primary focus:outline-none"
                          value={novaSenha}
                          onChange={e => setNovaSenha(e.target.value)}
                          placeholder="Mínimo de 6 caracteres"
                          required
                          minLength={6}
                        />
                      </div>
                      <div>
                        <label className="block text-cursor-text-tertiary text-sm mb-1">
                          Confirmar Nova Senha
                        </label>
                        <input
                          type="password"
                          className="w-full p-3 rounded-lg bg-cursor-bg text-cursor-text-primary border border-cursor-border focus:border-cursor-primary focus:outline-none"
                          value={confirmarSenha}
                          onChange={e => setConfirmarSenha(e.target.value)}
                          placeholder="Digite novamente a nova senha"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>

                {(alterandoSenha || alterandoEmail) && (
                  <div className="flex justify-end mt-6 pt-4 border-t border-cursor-border">
                    <button
                      type="button"
                      onClick={() => {
                        setAlterandoSenha(false);
                        setAlterandoEmail(false);
                      }}
                      className="px-4 py-2 rounded-md text-cursor-text-secondary hover:text-cursor-text-primary mr-3"
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-md bg-cursor-primary hover:bg-cursor-primary-dark text-white transition-colors"
                      disabled={loading}
                    >
                      {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;