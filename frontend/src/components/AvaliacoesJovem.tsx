import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PermissionGuard } from './PermissionGuard';
import {
  Avaliacao,
  CategoriaAvaliacao,
  HistoricoDesenvolvimento,
  JovemBadge
} from '../types';

interface AvaliacoesJovemProps {
  jovemId: number;
  avaliacoes: Avaliacao[];
  historico: HistoricoDesenvolvimento[];
  badges: JovemBadge[];
  mediaGeral: number;
  onAddAvaliacao: (avaliacao: Avaliacao) => void;
  onAddHistorico: (historico: HistoricoDesenvolvimento) => void;
}

export const AvaliacoesJovem: React.FC<AvaliacoesJovemProps> = ({
  jovemId,
  avaliacoes,
  historico,
  badges,
  mediaGeral,
  onAddAvaliacao,
  onAddHistorico
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'avaliacoes' | 'historico' | 'badges'>('avaliacoes');
  const [showAvaliacaoForm, setShowAvaliacaoForm] = useState(false);

  const renderAvaliacoes = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">
          Avaliações
          <span className="ml-2 text-sm font-normal text-cursor-text-secondary">
            Média geral: {mediaGeral.toFixed(1)}
          </span>
        </h3>
        
        <PermissionGuard permissions={['create:jovem', 'recommend:jovem']}>
          <button
            onClick={() => setShowAvaliacaoForm(true)}
            className="btn-primary"
          >
            Nova Avaliação
          </button>
        </PermissionGuard>
      </div>

      <div className="grid gap-4">
        {avaliacoes.map(avaliacao => (
          <div key={avaliacao.id} className="card p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{avaliacao.categoria?.nome}</h4>
                <p className="text-sm text-cursor-text-secondary">
                  Nota: {avaliacao.nota.toFixed(1)}/10
                </p>
              </div>
              <span className="text-sm text-cursor-text-tertiary">
                {new Date(avaliacao.criado_em).toLocaleDateString()}
              </span>
            </div>
            
            {avaliacao.comentario && (
              <p className="mt-2 text-sm">{avaliacao.comentario}</p>
            )}
            
            {avaliacao.evidencias && avaliacao.evidencias.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium">Evidências:</p>
                <ul className="list-disc list-inside text-sm text-cursor-text-secondary">
                  {avaliacao.evidencias.map((evidencia, index) => (
                    <li key={index}>
                      <a
                        href={evidencia}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-cursor-primary"
                      >
                        {evidencia}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderHistorico = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Histórico de Desenvolvimento</h3>
        
        <PermissionGuard permission="create:jovem">
          <button
            onClick={() => {/* Implementar formulário de histórico */}}
            className="btn-primary"
          >
            Adicionar Registro
          </button>
        </PermissionGuard>
      </div>

      <div className="grid gap-4">
        {historico.map(item => (
          <div key={item.id} className="card p-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-cursor-background-light">
                  {item.tipo}
                </span>
                <h4 className="font-medium mt-2">{item.titulo}</h4>
                {item.instituicao && (
                  <p className="text-sm text-cursor-text-secondary">
                    {item.instituicao}
                  </p>
                )}
              </div>
              
              <div className="text-right">
                <span className="text-sm text-cursor-text-tertiary">
                  {item.data_inicio && `${new Date(item.data_inicio).toLocaleDateString()}`}
                  {item.data_conclusao && ` - ${new Date(item.data_conclusao).toLocaleDateString()}`}
                </span>
                
                {item.validado ? (
                  <span className="block text-xs text-green-500">Validado</span>
                ) : (
                  <PermissionGuard permission="create:jovem">
                    <button
                      onClick={() => {/* Implementar validação */}}
                      className="text-xs text-cursor-primary hover:text-cursor-primary-dark"
                    >
                      Validar
                    </button>
                  </PermissionGuard>
                )}
              </div>
            </div>
            
            {item.descricao && (
              <p className="mt-2 text-sm">{item.descricao}</p>
            )}
            
            {item.comprovante_url && (
              <a
                href={item.comprovante_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-sm text-cursor-primary hover:text-cursor-primary-dark block"
              >
                Ver comprovante
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderBadges = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Badges e Conquistas</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {badges.map(jovemBadge => (
          <div key={jovemBadge.badge_id} className="card p-4 text-center">
            {jovemBadge.badge?.icone_url ? (
              <img
                src={jovemBadge.badge.icone_url}
                alt={jovemBadge.badge.nome}
                className="w-16 h-16 mx-auto mb-2"
              />
            ) : (
              <div className="w-16 h-16 bg-cursor-background-light rounded-full mx-auto mb-2" />
            )}
            
            <h4 className="font-medium">{jovemBadge.badge?.nome}</h4>
            
            {jovemBadge.badge?.descricao && (
              <p className="text-sm text-cursor-text-secondary mt-1">
                {jovemBadge.badge.descricao}
              </p>
            )}
            
            <p className="text-xs text-cursor-text-tertiary mt-2">
              Conquistado em {new Date(jovemBadge.data_conquista).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b border-cursor-border">
        <button
          className={`pb-2 px-1 text-sm font-medium transition-colors duration-200 ${
            activeTab === 'avaliacoes'
              ? 'text-cursor-primary border-b-2 border-cursor-primary'
              : 'text-cursor-text-secondary hover:text-cursor-text-primary'
          }`}
          onClick={() => setActiveTab('avaliacoes')}
        >
          Avaliações
        </button>
        
        <button
          className={`pb-2 px-1 text-sm font-medium transition-colors duration-200 ${
            activeTab === 'historico'
              ? 'text-cursor-primary border-b-2 border-cursor-primary'
              : 'text-cursor-text-secondary hover:text-cursor-text-primary'
          }`}
          onClick={() => setActiveTab('historico')}
        >
          Histórico
        </button>
        
        <button
          className={`pb-2 px-1 text-sm font-medium transition-colors duration-200 ${
            activeTab === 'badges'
              ? 'text-cursor-primary border-b-2 border-cursor-primary'
              : 'text-cursor-text-secondary hover:text-cursor-text-primary'
          }`}
          onClick={() => setActiveTab('badges')}
        >
          Badges
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'avaliacoes' && renderAvaliacoes()}
        {activeTab === 'historico' && renderHistorico()}
        {activeTab === 'badges' && renderBadges()}
      </div>
    </div>
  );
};

export default AvaliacoesJovem; 