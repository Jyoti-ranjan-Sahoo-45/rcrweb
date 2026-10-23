import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/BrandLogo';
import { NeedHelpWidget } from '../components/NeedHelpWidget';
import { Home, FileText, User, LogOut } from 'lucide-react';

export const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Explore', path: '/app', icon: Home },
    { label: 'Applications', path: '/applications', icon: FileText },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#0a1128] flex justify-center selection:bg-blue-600 selection:text-white">
      {/* Centered Mobile Shell Frame */}
      <div className="w-full max-w-lg min-h-screen bg-slate-50 flex flex-col justify-between shadow-[0_0_60px_-15px_rgba(0,0,0,0.85)] relative border-x border-slate-800/40">
        
        {/* Top App Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3.5 sm:px-5 sm:py-4 flex items-center justify-between shadow-xs">
          <Link to="/app" className="hover:opacity-95 transition active:scale-98">
            <BrandLogo size="md" theme="light" />
          </Link>

          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-blue-600 shadow-xs"
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black border border-blue-200 shadow-xs">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="text-xs sm:text-sm font-bold text-slate-800 hidden sm:inline">
                    {user.name.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 pb-20 px-4 pt-4">
          <Outlet />
        </main>

        {/* Bottom Mobile Navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 border-x border-slate-800/30 px-4 py-2 flex items-center justify-around shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
                  isActive ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
                <span className="text-[11px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Floating Need Help Action Widget */}
        <NeedHelpWidget />
      </div>
    </div>
  );
};
