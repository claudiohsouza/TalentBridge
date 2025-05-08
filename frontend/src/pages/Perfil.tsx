import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Perfil: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [feedback, setFeedback] = useState<{mensagem: string, tipo: 'success' | 'error'} | null>(null);
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    localizacao: user?.perfil?.localizacao || '',
    // Campos específicos por papel de usuário
    tipo: user?.perfil?.tipo || '',
    areas_ensino: user?.perfil?.areas_ensino || [],
    qtd_alunos: user?.perfil?.qtd_alunos || '',
    empresa: user?.perfil?.empresa || '',
    setor: user?.perfil?.setor || '',
    porte: user?.perfil?.porte || '',
    areas_atuacao: user?.perfil?.areas_atuacao || [],
    areas_interesse: user?.perfil?.areas_interesse || [],
    programas_sociais: user?.perfil?.programas_sociais || []
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || '',
        email: user.email || '',
        localizacao: user.perfil?.localizacao || '',
        // Campos específicos por papel de usuário
        tipo: user.perfil?.tipo || '',
        areas_ensino: user.perfil?.areas_ensino || [],
        qtd_alunos: user.perfil?.qtd_alunos || '',
        empresa: user.perfil?.empresa || '',
        setor: user.perfil?.setor || '',
        porte: user.perfil?.porte || '',
        areas_atuacao: user.perfil?.areas_atuacao || [],
        areas_interesse: user.perfil?.areas_interesse || [],
        programas_sociais: user.perfil?.programas_sociais || []
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Converter string em array (cada linha é um item)
    const arrayValue = value.split('\n').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, [name]: arrayValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await updateUser(formData);
      setFeedback({
        mensagem: 'Perfil atualizado com sucesso!',
        tipo: 'success'
      });
      setEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setFeedback({
        mensagem: 'Erro ao atualizar perfil. Tente novamente.',
        tipo: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center py-12">Usuário não encontrado</div>;
  }

  return (
    <div className="min-h-screen bg-cursor-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="section-title">Meu Perfil</h1>
            <p className="section-subtitle">
              Visualize e edite suas informações
            </p>
          </div>
          <div className="flex space-x-3">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="btn-secondary"
              >
                Editar Perfil
              </button>
            ) : (
              <button
                onClick={() => setEditing(false)}
                className="btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>
            )}
            <Link
              to="/alterar-senha"
              className="btn-primary"
            >
              Alterar Senha
            </Link>
          </div>
        </div>

        <div className="card p-6">
          {feedback && (
            <div className={`p-4 mb-4 rounded-lg ${feedback.tipo === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {feedback.mensagem}
            </div>
          )}
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informações básicas */}
              <div>
                <h3 className="text-lg font-semibold text-cursor-text-primary mb-6">
                  Informações Básicas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="input-field bg-cursor-background-card opacity-75"
                    />
                    <p className="text-xs text-cursor-text-tertiary mt-1">
                      O email não pode ser alterado
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                      Localização
                    </label>
                    <input
                      type="text"
                      name="localizacao"
                      value={formData.localizacao}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Ex: São Paulo, SP"
                    />
                  </div>
                </div>
              </div>
              
              {/* Campos específicos baseados no papel */}
              <div>
                <h3 className="text-lg font-semibold text-cursor-text-primary mb-6">
                  Informações Específicas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.papel === 'instituicao_ensino' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                          Tipo de Instituição
                        </label>
                        <input
                          type="text"
                          name="tipo"
                          value={formData.tipo}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="Ex: Universidade, Escola Técnica"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                          Número de Alunos
                        </label>
                        <input
                          type="number"
                          name="qtd_alunos"
                          value={formData.qtd_alunos}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="Ex: 1000"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                          Áreas de Ensino
                        </label>
                        <textarea
                          name="areas_ensino"
                          value={formData.areas_ensino.join('\n')}
                          onChange={handleArrayChange}
                          rows={4}
                          className="input-field"
                          placeholder="Digite uma área por linha&#10;Ex: Engenharia de Software&#10;Ciência da Computação&#10;Design Digital"
                        />
                        <p className="text-xs text-cursor-text-tertiary mt-1">
                          Digite uma área por linha ou separe por vírgulas
                        </p>
                      </div>
                    </>
                  )}
                  
                  {user.papel === 'chefe_empresa' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                          Nome da Empresa
                        </label>
                        <input
                          type="text"
                          name="empresa"
                          value={formData.empresa}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="Ex: TechCorp"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                          Setor
                        </label>
                        <input
                          type="text"
                          name="setor"
                          value={formData.setor}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="Ex: Tecnologia"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                          Porte da Empresa
                        </label>
                        <input
                          type="text"
                          name="porte"
                          value={formData.porte}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="Ex: Médio"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-cursor-border">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              {/* Visualização das informações básicas */}
              <div>
                <h3 className="text-lg font-semibold text-cursor-text-primary mb-6">
                  Informações Básicas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-cursor-text-secondary">Nome</p>
                    <p className="mt-1 text-cursor-text-primary">{formData.nome}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-cursor-text-secondary">Email</p>
                    <p className="mt-1 text-cursor-text-primary">{formData.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-cursor-text-secondary">Localização</p>
                    <p className="mt-1 text-cursor-text-primary">{formData.localizacao || 'Não informado'}</p>
                  </div>
                </div>
              </div>
              
              {/* Visualização das informações específicas */}
              <div>
                <h3 className="text-lg font-semibold text-cursor-text-primary mb-6">
                  Informações Específicas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.papel === 'instituicao_ensino' && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-cursor-text-secondary">Tipo de Instituição</p>
                        <p className="mt-1 text-cursor-text-primary">{formData.tipo || 'Não informado'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-cursor-text-secondary">Número de Alunos</p>
                        <p className="mt-1 text-cursor-text-primary">{formData.qtd_alunos || 'Não informado'}</p>
                      </div>
                      
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-cursor-text-secondary">Áreas de Ensino</p>
                        {formData.areas_ensino && formData.areas_ensino.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {formData.areas_ensino.map((area: string, index: number) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-cursor-background-light text-cursor-text-primary border border-cursor-border"
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-1 text-cursor-text-tertiary">Nenhuma área informada</p>
                        )}
                      </div>
                    </>
                  )}
                  
                  {user.papel === 'chefe_empresa' && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-cursor-text-secondary">Nome da Empresa</p>
                        <p className="mt-1 text-cursor-text-primary">{formData.empresa || 'Não informado'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-cursor-text-secondary">Setor</p>
                        <p className="mt-1 text-cursor-text-primary">{formData.setor || 'Não informado'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-cursor-text-secondary">Porte da Empresa</p>
                        <p className="mt-1 text-cursor-text-primary">{formData.porte || 'Não informado'}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Perfil;