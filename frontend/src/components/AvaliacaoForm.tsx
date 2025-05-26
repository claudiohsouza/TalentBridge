import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AvaliacaoInput, CategoriaAvaliacao } from '../types';

interface AvaliacaoFormProps {
  jovemId: number;
  onSubmit: (avaliacao: AvaliacaoInput) => Promise<void>;
  onCancel: () => void;
}

export const AvaliacaoForm: React.FC<AvaliacaoFormProps> = ({
  jovemId,
  onSubmit,
  onCancel
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [categorias, setCategorias] = useState<CategoriaAvaliacao[]>([]);
  
  const [formData, setFormData] = useState<AvaliacaoInput>({
    categoria_id: 0,
    nota: 7.0, // Valor padrão
    comentario: '',
    evidencias: []
  });

  // Carregar categorias de avaliação
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        // TODO: Implementar serviço para buscar categorias
        const response = await fetch('/api/categorias-avaliacao');
        const data = await response.json();
        setCategorias(data);
        
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, categoria_id: data[0].id }));
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        setError('Erro ao carregar categorias de avaliação');
      }
    };

    fetchCategorias();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'nota' || name === 'categoria_id' ? Number(value) : value
    }));
  };

  const handleEvidenciaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const evidencias = e.target.value
      .split('\n')
      .map(url => url.trim())
      .filter(url => url !== '');
    
    setFormData(prev => ({ ...prev, evidencias }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      setError('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
          Categoria
        </label>
        <select
          name="categoria_id"
          value={formData.categoria_id}
          onChange={handleChange}
          className="input-field"
          required
        >
          <option value="">Selecione uma categoria</option>
          {categorias.map(categoria => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
          Nota (0-10)
        </label>
        <input
          type="number"
          name="nota"
          value={formData.nota}
          onChange={handleChange}
          min="0"
          max="10"
          step="0.5"
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
          Comentário
        </label>
        <textarea
          name="comentario"
          value={formData.comentario}
          onChange={handleChange}
          className="input-field min-h-[100px]"
          placeholder="Descreva os motivos da sua avaliação..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
          Evidências (uma por linha)
        </label>
        <textarea
          value={formData.evidencias?.join('\n')}
          onChange={handleEvidenciaChange}
          className="input-field min-h-[100px]"
          placeholder="https://exemplo.com/evidencia1&#10;https://exemplo.com/evidencia2"
        />
        <p className="text-xs text-cursor-text-tertiary mt-1">
          Adicione links para documentos, projetos, certificados ou outras evidências que suportem sua avaliação
        </p>
      </div>

      {error && (
        <div className="p-3 bg-cursor-error/10 border border-cursor-error/30 rounded-lg">
          <p className="text-cursor-error text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4 border-t border-cursor-border">
        <button
          type="button"
          onClick={onCancel}
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
          {loading ? 'Enviando...' : 'Enviar Avaliação'}
        </button>
      </div>
    </form>
  );
};

export default AvaliacaoForm; 