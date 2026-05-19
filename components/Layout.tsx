import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, LayoutDashboard, LineChart, User as UserIcon, LogOut, Menu, X, Users, Shield } from 'lucide-react';
import { Button } from './ui';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Items de navegación base (para atletas y coaches)
  const baseNavItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Entrenamientos', path: '/training', icon: <Dumbbell size={20} /> },
    { name: 'Progreso', path: '/progress', icon: <LineChart size={20} /> },
  ];

  // Añadir opción "Mis Atletas" si el usuario es entrenador
  const coachNavItem = user?.role === 'coach'
    ? [{ name: 'Mis Atletas', path: '/coach', icon: <Users size={20} /> }]
    : [];

  // Navegación específica para admin (solo Admin y Perfil)
  const adminNavItems = [
    { name: 'Admin', path: '/admin', icon: <Shield size={20} /> },
    { name: 'Perfil', path: '/profile', icon: <UserIcon size={20} /> },
  ];

  // Navegación normal para atletas/coaches
  const regularNavItems = [
    ...baseNavItems,
    ...coachNavItem,
    { name: 'Perfil', path: '/profile', icon: <UserIcon size={20} /> },
  ];

  // Usar navegación según rol
  const navItems = user?.role === 'admin' ? adminNavItems : regularNavItems;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans">
      {/* Barra de navegación superior para móvil */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md lg:hidden">
        <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 font-bold text-base sm:text-lg md:text-xl text-brandRed-500 min-w-0 hover:opacity-80 transition-opacity"
          >
            <img src="/logo.png" alt="Total Grind Logo" className="h-6 sm:h-8 w-6 sm:w-8 object-contain flex-shrink-0" />
            <span className="truncate">TotalGrind</span>
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Barra lateral para escritorio (fija) */}
        <aside className="hidden h-screen w-64 flex-col border-r border-slate-800 bg-slate-900 lg:flex fixed left-0 top-0">
          <div className="flex h-16 items-center border-b border-slate-800 px-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 font-bold text-xl text-brandRed-500 hover:opacity-80 transition-opacity"
            >
              <img src="/logo.png" alt="Total Grind Logo" className="h-8 w-8 object-contain" />
              <span>TotalGrind</span>
            </button>
          </div>

          {/* Información del usuario */}
          {user && (
            <div className="px-4 py-3 border-b border-slate-800">
              <p className="text-sm font-medium text-slate-50 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          )}

          <nav className="flex-1 space-y-1 px-4 py-6">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-slate-800 text-brandRed-500' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-50'
                  }`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-slate-800 p-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-slate-400 hover:text-red-500 hover:bg-red-950/30"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              Cerrar Sesión
            </Button>
          </div>
        </aside>

        {/* Contenido principal de la página */}
        <main className="flex-1 lg:pl-64 pb-20 lg:pb-0">
          <div className="container mx-auto max-w-5xl p-3 sm:p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Barra de navegación inferior para móvil */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-800 bg-slate-950/90 backdrop-blur-md pb-safe lg:hidden h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
                isActive ? 'text-brandRed-500' : 'text-slate-400 hover:text-slate-50'
              }`
            }
          >
            {React.cloneElement(item.icon as React.ReactElement, { size: 24 })}
            <span className="text-[10px] font-medium truncate w-full text-center px-1">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Layout;