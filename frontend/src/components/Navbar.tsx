import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaHome, FaSignInAlt, FaUserPlus, FaUserGraduate, FaPlus, FaCog, FaUserCircle, FaSignOutAlt, FaBars } from 'react-icons/fa';

type NavbarProps = {
  usuario: { email: string; papel: string } | null;
  onLogout: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ usuario, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const linkClass = (path: string) =>
    `flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 hover:bg-cursor-bg-lighter ${
      location.pathname === path ? 'text-cursor-primary font-medium' : 'text-cursor-text-secondary hover:text-cursor-text-primary'
    }`;

  const getDashboardLinks = () => {
    if (usuario?.papel === 'instituicao') {
      return [
        { to: '/instituicao', icon: <FaUserGraduate />, label: 'Estudantes' }
      ];
    } else if (usuario?.papel === 'empresa') {
      return [
        { to: '/empresa', icon: <FaUserGraduate />, label: 'Estudantes' }
      ];
    }
    return [];
  };

  return (
    <nav className="bg-cursor-bg border-b border-cursor-border sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-cursor-primary to-cursor-accent bg-clip-text text-transparent">TalentBridge</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className={linkClass('/')}>
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to={usuario?.papel === 'instituicao' ? '/instituicao' : '/empresa'} 
                  className={linkClass(usuario?.papel === 'instituicao' ? '/instituicao' : '/empresa')}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/perfil" 
                  className={linkClass('/perfil')}
                >
                  Perfil
                </Link>
                <button 
                  onClick={onLogout}
                  className="ml-2 px-4 py-2 rounded-md bg-cursor-primary hover:bg-cursor-primary-dark text-white font-medium transition-colors duration-200"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={linkClass('/login')}
                >
                  Login
                </Link>
                <Link 
                  to="/cadastro" 
                  className="ml-2 px-4 py-2 rounded-md border border-cursor-primary text-cursor-primary hover:bg-cursor-primary hover:text-white font-medium transition-colors duration-200"
                >
                  Cadastro
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-cursor-text-secondary hover:text-cursor-text-primary hover:bg-cursor-bg-lighter focus:outline-none transition-colors duration-200"
            >
              <svg 
                className="h-6 w-6" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden animate-slide-down">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-cursor-bg-light border-t border-cursor-border">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded-md text-cursor-text-secondary hover:text-cursor-text-primary hover:bg-cursor-bg-lighter transition-colors duration-200"
              onClick={closeMenu}
            >
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to={usuario?.papel === 'instituicao' ? '/instituicao' : '/empresa'} 
                  className="block px-3 py-2 rounded-md text-cursor-text-secondary hover:text-cursor-text-primary hover:bg-cursor-bg-lighter transition-colors duration-200"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/perfil" 
                  className="block px-3 py-2 rounded-md text-cursor-text-secondary hover:text-cursor-text-primary hover:bg-cursor-bg-lighter transition-colors duration-200"
                  onClick={closeMenu}
                >
                  Perfil
                </Link>
                <button 
                  onClick={() => {
                    closeMenu();
                    onLogout();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md bg-cursor-primary hover:bg-cursor-primary-dark text-white font-medium transition-colors duration-200"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block px-3 py-2 rounded-md text-cursor-text-secondary hover:text-cursor-text-primary hover:bg-cursor-bg-lighter transition-colors duration-200"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link 
                  to="/cadastro" 
                  className="block px-3 py-2 rounded-md text-cursor-primary hover:text-cursor-text-primary hover:bg-cursor-bg-lighter transition-colors duration-200"
                  onClick={closeMenu}
                >
                  Cadastro
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;