import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChevronRight, FaHome } from 'react-icons/fa';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

const pathMap: Record<string, string> = {
  '': 'Home',
  'login': 'Login',
  'cadastro': 'Cadastro',
  'instituicao': 'Dashboard Instituição',
  'empresa': 'Dashboard Empresa',
  'adicionar': 'Adicionar',
  'config': 'Configurações',
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const location = useLocation();
  
  // Se items for fornecido, usar esses items
  // Caso contrário, gerar automaticamente com base no pathname
  const breadcrumbItems = items || generateBreadcrumbsFromPath(location.pathname);
  
  return (
    <nav className="flex items-center gap-2 py-3 px-4 mb-4 text-sm">
      {breadcrumbItems.map((item, idx) => (
        <React.Fragment key={item.path}>
          {idx > 0 && <FaChevronRight className="mx-1 text-xs text-cursor-text-tertiary" />}
          {idx === breadcrumbItems.length - 1 ? (
            <span className="font-medium text-cursor-text-primary">{item.label}</span>
          ) : (
            <Link 
              to={item.path} 
              className="text-cursor-text-secondary hover:text-cursor-primary transition-colors duration-200"
            >
              {idx === 0 ? <FaHome className="inline mr-1" /> : null}
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// Função auxiliar para gerar breadcrumbs baseado no pathname
const generateBreadcrumbsFromPath = (pathname: string): BreadcrumbItem[] => {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', path: '/' }];
  
  paths.forEach((segment, idx) => {
    const path = '/' + paths.slice(0, idx + 1).join('/');
    breadcrumbs.push({
      label: pathMap[segment] || segment,
      path
    });
  });
  
  return breadcrumbs;
};

export default Breadcrumbs;