'use client'

import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function TopNavbar() {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="container-responsive">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">盡</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-gray-800">2025 學青特會</span>
              <span className="text-xs text-gray-500">盡</span>
            </div>
          </Link>
          
          {/* Logout Button */}
          <div>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium"
            >
              <span>🚪</span>
              <span>登出</span>
            </button>
          </div>
        </div>
      </div>
      
    </nav>
  );
}