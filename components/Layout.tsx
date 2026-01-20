import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Dumbbell, LayoutDashboard, LineChart, User as UserIcon, LogOut, Menu, X, Users } from 'lucide-react';
import { Button } from './ui';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const baseNavItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Entrenamientos', path: '/training', icon: <Dumbbell size={20} /> },
    { name: 'Progreso', path: '/progress', icon: <LineChart size={20} /> },
  ];

  // Añadir opción "Mis Atletas" si el usuario es entrenador
  const coachNavItem = user?.role === 'coach'
    ? [{ name: 'Mis Atletas', path: '/coach', icon: <Users size={20} /> }]
    : [];

  const navItems = [
    ...baseNavItems,
    ...coachNavItem,
    { name: 'Perfil', path: '/profile', icon: <UserIcon size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans">
      {/* Barra de navegación superior para móvil */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-500">
            <Dumbbell className="h-6 w-6" />
            <span>TotalGrind</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </header>

      {/* Menú desplegable para móvil */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 top-16 bg-slate-950 p-4 lg:hidden animate-in fade-in slide-in-from-top-5">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
            <Button
              variant="outline"
              className="mt-4 w-full justify-start gap-3 border-red-900/50 text-red-400 hover:bg-red-950 hover:text-red-300"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              Cerrar Sesión
            </Button>
          </nav>
        </div>
      )}

      <div className="flex">
        {/* Barra lateral para escritorio (fija) */}
        <aside className="hidden h-screen w-64 flex-col border-r border-slate-800 bg-slate-900 lg:flex fixed left-0 top-0">
          <div className="flex h-16 items-center border-b border-slate-800 px-6">
            <div className="flex items-center gap-2 font-bold text-xl text-blue-500">
              <Dumbbell className="h-6 w-6" />
              <span>TotalGrind</span>
            </div>
          </div>

          {/* Información del usuario */}
          {user && (
            <div className="px-4 py-3 border-b border-slate-800">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          )}

          <nav className="flex-1 space-y-1 px-4 py-6">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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
              className="w-full justify-start gap-3 text-slate-400 hover:text-red-400 hover:bg-red-950/30"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              Cerrar Sesión
            </Button>
          </div>
        </aside>

        {/* Contenido principal de la página */}
        <main className="flex-1 lg:pl-64">
          <div className="container mx-auto max-w-5xl p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;