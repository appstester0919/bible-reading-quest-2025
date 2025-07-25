'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BottomNavigation() {
  const pathname = usePathname();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const navItems = [
    {
      href: '/dashboard',
      icon: '📅',
      label: '日曆',
      isActive: pathname === '/dashboard'
    },
    {
      href: '/map',
      icon: '🗺️',
      label: '地圖',
      isActive: pathname === '/map'
    },
    {
      href: '/leaderboard',
      icon: '🏆',
      label: '同行榜',
      isActive: pathname === '/leaderboard'
    },
    {
      href: '/profile',
      icon: '👤',
      label: '個人',
      isActive: pathname === '/profile'
    }
  ];

  // 測試版本 - 總是顯示導航欄
  return (
    <div 
      style={{ 
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        border: '2px solid #6366f1',
        padding: isDesktop ? '16px 32px' : '12px 16px',
        maxWidth: '95vw',
        width: isDesktop ? 'auto' : '90vw'
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: isDesktop ? '12px' : '8px',
        justifyContent: 'space-between'
      }}>
        {navItems.map((item, index) => (
          <div key={item.href} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Link
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: isDesktop ? 'row' : 'column',
                gap: isDesktop ? '12px' : '4px',
                padding: isDesktop ? '16px 20px' : '8px 4px',
                borderRadius: '12px',
                textDecoration: 'none',
                backgroundColor: item.isActive ? '#6366f1' : '#f8fafc',
                color: item.isActive ? 'white' : '#1e293b',
                fontWeight: '600',
                fontSize: isDesktop ? '16px' : '12px',
                border: item.isActive ? 'none' : '1px solid #e2e8f0',
                transition: 'all 0.3s ease',
                minWidth: isDesktop ? '120px' : 'auto',
                width: '100%',
                justifyContent: 'center'
              }}
            >
              <span style={{ fontSize: isDesktop ? '24px' : '18px' }}>{item.icon}</span>
              <span style={{ fontSize: isDesktop ? '16px' : '10px' }}>{item.label}</span>
            </Link>
            {index < navItems.length - 1 && isDesktop && (
              <div style={{ 
                width: '2px', 
                height: '40px', 
                backgroundColor: '#e2e8f0', 
                margin: '0 12px' 
              }}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}