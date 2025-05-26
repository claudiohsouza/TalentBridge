import React, { useState, useEffect, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  FormErrorMessage,
  VStack,
  Textarea,
  useToast,
  Text,
  HStack
} from '@chakra-ui/react';

const formacaoOptions = [
  { value: 'ensino_medio', label: 'Ensino Médio' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'superior', label: 'Superior' },
  { value: 'pos_graduacao', label: 'Pós-graduação' }
];

const schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
  idade: z.number().min(14, 'Idade deve ser maior ou igual a 14').max(29, 'Idade deve ser menor ou igual a 29'),
  formacao: z.enum(['ensino_medio', 'tecnico', 'superior', 'pos_graduacao'], {
    errorMap: () => ({ message: 'Formação inválida' })
  }),
  curso: z.string().optional(),
  habilidades: z.array(z.string()).min(1, 'Pelo menos uma habilidade deve ser informada'),
  interesses: z.array(z.string()).min(1, 'Pelo menos um interesse deve ser informado'),
  planos_futuros: z.string().min(1, 'Planos futuros são obrigatórios')
});

type FormData = z.infer<typeof schema>;

interface JovemFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: Partial<FormData>;
  isEditing?: boolean;
  onCancel?: () => void;
}

export const JovemForm: React.FC<JovemFormProps> = ({
  onSubmit,
  initialData,
  isEditing = false,
  onCancel
}) => {
  const [habilidades, setHabilidades] = useState<string[]>(initialData?.habilidades || []);
  const [interesses, setInteresses] = useState<string[]>(initialData?.interesses || []);
  const [novaHabilidade, setNovaHabilidade] = useState('');
  const [novoInteresse, setNovoInteresse] = useState('');
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
  });

  const formacao = watch('formacao');

  useEffect(() => {
    setValue('habilidades', habilidades);
    setValue('interesses', interesses);
  }, [habilidades, interesses, setValue]);

  const handleAddHabilidade = () => {
    if (novaHabilidade.trim()) {
      setHabilidades([...habilidades, novaHabilidade.trim()]);
      setNovaHabilidade('');
    }
  };

  const handleRemoveHabilidade = (index: number) => {
    setHabilidades(habilidades.filter((_, i) => i !== index));
  };

  const handleAddInteresse = () => {
    if (novoInteresse.trim()) {
      setInteresses([...interesses, novoInteresse.trim()]);
      setNovoInteresse('');
    }
  };

  const handleRemoveInteresse = (index: number) => {
    setInteresses(interesses.filter((_, i) => i !== index));
  };

  const onFormSubmit = async (data: FormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao salvar jovem',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit(onFormSubmit)}>
      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={!!errors.nome}>
          <FormLabel>Nome</FormLabel>
          <Input {...register('nome')} />
          <FormErrorMessage>{errors.nome?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.email}>
          <FormLabel>Email</FormLabel>
          <Input type="email" {...register('email')} />
          <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
        </FormControl>

        {!isEditing && (
          <FormControl isInvalid={!!errors.senha}>
            <FormLabel>Senha</FormLabel>
            <Input type="password" {...register('senha')} />
            <FormErrorMessage>{errors.senha?.message}</FormErrorMessage>
          </FormControl>
        )}

        <FormControl isInvalid={!!errors.idade}>
          <FormLabel>Idade</FormLabel>
          <Input
            type="number"
            {...register('idade', { valueAsNumber: true })}
          />
          <FormErrorMessage>{errors.idade?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.formacao}>
          <FormLabel>Formação</FormLabel>
          <Select {...register('formacao')}>
            <option value="">Selecione uma formação</option>
            {formacaoOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.formacao?.message}</FormErrorMessage>
        </FormControl>

        {formacao && formacao !== 'ensino_medio' && (
          <FormControl isInvalid={!!errors.curso}>
            <FormLabel>Curso</FormLabel>
            <Input {...register('curso')} />
            <FormErrorMessage>{errors.curso?.message}</FormErrorMessage>
          </FormControl>
        )}

        <FormControl isInvalid={!!errors.habilidades}>
          <FormLabel>Habilidades</FormLabel>
          <Box>
            <Box display="flex" gap={2} mb={2}>
              <Input
                value={novaHabilidade}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNovaHabilidade(e.target.value)}
                placeholder="Adicionar habilidade"
              />
              <Button onClick={handleAddHabilidade}>Adicionar</Button>
            </Box>
            {habilidades.length > 0 && (
              <Box>
                {habilidades.map((habilidade, index) => (
                  <Box
                    key={index}
                    display="flex"
                    alignItems="center"
                    gap={2}
                    mb={1}
                  >
                    <Text>{habilidade}</Text>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleRemoveHabilidade(index)}
                    >
                      Remover
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
          <FormErrorMessage>{errors.habilidades?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.interesses}>
          <FormLabel>Interesses</FormLabel>
          <Box>
            <Box display="flex" gap={2} mb={2}>
              <Input
                value={novoInteresse}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNovoInteresse(e.target.value)}
                placeholder="Adicionar interesse"
              />
              <Button onClick={handleAddInteresse}>Adicionar</Button>
            </Box>
            {interesses.length > 0 && (
              <Box>
                {interesses.map((interesse, index) => (
                  <Box
                    key={index}
                    display="flex"
                    alignItems="center"
                    gap={2}
                    mb={1}
                  >
                    <Text>{interesse}</Text>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleRemoveInteresse(index)}
                    >
                      Remover
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
          <FormErrorMessage>{errors.interesses?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.planos_futuros}>
          <FormLabel>Planos Futuros</FormLabel>
          <Textarea {...register('planos_futuros')} />
          <FormErrorMessage>
            {errors.planos_futuros?.message as string}
          </FormErrorMessage>
        </FormControl>

        <HStack spacing={4} justify="flex-end">
          {onCancel && (
            <Button onClick={onCancel} variant="ghost">
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isSubmitting}
            loadingText="Salvando..."
          >
            {isEditing ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}; 