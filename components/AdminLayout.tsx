import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, ShieldAlert, Activity, ArrowLeft } from 'lucide-react';
import { Button } from './ui';
import { useAdminAuth } from '../contexts/AdminAuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { logout, user } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Navegación exclusiva para admin
  const adminNavItems = [
    { name: 'Panel Principal', path: '/admin', icon: <LayoutDashboard size={20} />, end: true },
    { name: 'Usuarios', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Actividad', path: '/admin/activity', icon: <Activity size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans">
      {/* Barra de navegación superior para móvil */}
      <header className="sticky top-0 z-40 w-full border-b border-purple-900 bg-slate-950/80 backdrop-blur-md lg:hidden">
        <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
          <div className="flex items-center gap-2 font-bold text-base sm:text-lg md:text-xl text-purple-500 min-w-0">
            <ShieldAlert size={24} className="flex-shrink-0" />
            <span className="truncate">Admin Panel</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => window.location.hash = '/'} className="text-slate-400 hover:text-slate-300" title="Volver a la App">
              <ArrowLeft size={20} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-red-500" title="Cerrar Sesión">
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Barra lateral para escritorio (fija) */}
        <aside className="hidden h-screen w-64 flex-col border-r border-slate-800 bg-slate-950 lg:flex fixed left-0 top-0">
          <div className="flex h-16 items-center border-b border-purple-900/50 px-6 bg-slate-900/30">
            <div className="flex items-center gap-2 font-bold text-xl text-purple-500">
              <ShieldAlert size={28} />
              <span>Admin Panel</span>
            </div>
          </div>

          {/* Información del usuario admin */}
          {user && (
            <div className="px-4 py-4 border-b border-slate-800 bg-slate-900/10">
              <p className="text-sm font-medium text-purple-400 truncate flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                {user.name} (Admin)
              </p>
              <p className="text-xs text-slate-500 truncate ml-4">{user.email}</p>
            </div>
          )}

          <nav className="flex-1 space-y-1 px-4 py-6">
            {adminNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-purple-900/30 text-purple-400 border border-purple-900/50' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-50'
                  }`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </nav>
          
          <div className="border-t border-slate-800 p-4 space-y-2">
             <Button
              variant="outline"
              className="w-full justify-start gap-3 border-slate-800 text-slate-400 hover:text-slate-300 hover:bg-slate-900"
              onClick={() => window.location.hash = '/'}
            >
              ← Volver a la App
            </Button>
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

        {/* Contenido principal de la página admin */}
        <main className="flex-1 lg:pl-64 pb-20 lg:pb-0">
          <div className="container mx-auto max-w-6xl p-3 sm:p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Barra de navegación inferior para móvil */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-purple-900 bg-slate-950/90 backdrop-blur-md pb-safe lg:hidden h-16 px-2">
        {adminNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
                isActive ? 'text-purple-400' : 'text-slate-400 hover:text-slate-50'
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

export default AdminLayout;
