import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserRole } from './types';

// Páginas
import Login from './pages/login';
import Cadastro from './pages/cadastro';
import DashboardInstituicaoEnsino from './pages/DashboardInstituicaoEnsino';
import DashboardChefeEmpresa from './pages/DashboardChefeEmpresa';
import DashboardInstituicaoContratante from './pages/DashboardInstituicaoContratante';
import Home from './pages/Home';
import Perfil from './pages/Perfil';
import AlterarSenhaPage from './pages/AlterarSenhaPage';
import JovensList from './pages/JovensList';
import JovemDetails from './pages/JovemDetails';
import OportunidadesList from './pages/OportunidadesList';
import OportunidadeDetails from './pages/OportunidadeDetails';
import NovaOportunidade from './pages/NovaOportunidade';
import NovoJovem from './pages/NovoJovem';

// Componente para rotas protegidas
type ProtectedRouteProps = {
  children: JSX.Element;
  allowedRole?: UserRole;
};

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRole && user.papel !== allowedRole) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
          <Route path="/alterar-senha" element={<ProtectedRoute><AlterarSenhaPage /></ProtectedRoute>} />

          {/* Rotas para Instituição de Ensino */}
          <Route 
            path="/instituicao-ensino" 
            element={<ProtectedRoute allowedRole="instituicao_ensino"><DashboardInstituicaoEnsino /></ProtectedRoute>} 
          />
          <Route 
            path="/instituicao-ensino/jovens" 
            element={<ProtectedRoute allowedRole="instituicao_ensino"><JovensList /></ProtectedRoute>} 
          />
          <Route 
            path="/instituicao-ensino/jovens/novo" 
            element={<ProtectedRoute allowedRole="instituicao_ensino"><NovoJovem /></ProtectedRoute>} 
          />
          <Route 
            path="/instituicao-ensino/jovens/:id" 
            element={<ProtectedRoute allowedRole="instituicao_ensino"><JovemDetails /></ProtectedRoute>} 
          />

          {/* Rotas para Chefe de Empresa */}
          <Route 
            path="/chefe-empresa" 
            element={<ProtectedRoute allowedRole="chefe_empresa"><DashboardChefeEmpresa /></ProtectedRoute>} 
          />
          <Route 
            path="/chefe-empresa/jovens" 
            element={<ProtectedRoute allowedRole="chefe_empresa"><JovensList /></ProtectedRoute>} 
          />
          <Route 
            path="/chefe-empresa/jovens/:id" 
            element={<ProtectedRoute allowedRole="chefe_empresa"><JovemDetails /></ProtectedRoute>} 
          />
          <Route 
            path="/chefe-empresa/oportunidades" 
            element={<ProtectedRoute allowedRole="chefe_empresa"><OportunidadesList /></ProtectedRoute>} 
          />
          <Route 
            path="/chefe-empresa/oportunidades/:id" 
            element={<ProtectedRoute allowedRole="chefe_empresa"><OportunidadeDetails /></ProtectedRoute>} 
          />

          {/* Rotas para Instituição Contratante */}
          <Route 
            path="/instituicao-contratante" 
            element={<ProtectedRoute allowedRole="instituicao_contratante"><DashboardInstituicaoContratante /></ProtectedRoute>} 
          />
          <Route 
            path="/instituicao-contratante/jovens" 
            element={<ProtectedRoute allowedRole="instituicao_contratante"><JovensList /></ProtectedRoute>} 
          />
          <Route 
            path="/instituicao-contratante/jovens/:id" 
            element={<ProtectedRoute allowedRole="instituicao_contratante"><JovemDetails /></ProtectedRoute>} 
          />
          <Route 
            path="/instituicao-contratante/oportunidades" 
            element={<ProtectedRoute allowedRole="instituicao_contratante"><OportunidadesList /></ProtectedRoute>} 
          />
          <Route 
            path="/instituicao-contratante/oportunidades/nova" 
            element={<ProtectedRoute allowedRole="instituicao_contratante"><NovaOportunidade /></ProtectedRoute>} 
          />
          <Route 
            path="/instituicao-contratante/oportunidades/:id" 
            element={<ProtectedRoute allowedRole="instituicao_contratante"><OportunidadeDetails /></ProtectedRoute>} 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;