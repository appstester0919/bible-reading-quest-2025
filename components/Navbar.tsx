'use client'

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
      <div className="container-responsive">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">盡</span>
            </div>
            <span className="font-bold text-xl text-gray-800 hidden sm:block">2025 學青特會</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink href="/dashboard" icon="📅">日曆</NavLink>
            <NavLink href="/map" icon="🗺️">地圖</NavLink>
            <NavLink href="/leaderboard" icon="🏆">同行榜</NavLink>
            <NavLink href="/profile" icon="👤">個人資料</NavLink>
            <button 
              onClick={handleLogout} 
              className="ml-4 btn-primary text-sm"
            >
              登出
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              <MobileNavLink href="/dashboard" icon="📅" onClick={() => setIsMenuOpen(false)}>
                日曆
              </MobileNavLink>
              <MobileNavLink href="/map" icon="🗺️" onClick={() => setIsMenuOpen(false)}>
                地圖
              </MobileNavLink>
              <MobileNavLink href="/leaderboard" icon="🏆" onClick={() => setIsMenuOpen(false)}>
                同行榜
              </MobileNavLink>
              <MobileNavLink href="/profile" icon="👤" onClick={() => setIsMenuOpen(false)}>
                個人資料
              </MobileNavLink>
              <button 
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                登出
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ href, children, icon }: { href: string; children: React.ReactNode; icon: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
    >
      <span>{icon}</span>
      <span>{children}</span>
    </Link>
  );
}

function MobileNavLink({ href, children, icon, onClick }: { 
  href: string; 
  children: React.ReactNode; 
  icon: string;
  onClick: () => void;
}) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
    >
      <span className="text-lg">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}
