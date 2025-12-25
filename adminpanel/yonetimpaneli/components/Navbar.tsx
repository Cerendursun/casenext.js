"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import Button from 'devextreme-react/button';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Client-side'da username'i al
    setUsername(authService.getUsername());
  }, []);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  if (pathname === '/login') {
    return null;
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/kullanicilar" className="text-xl font-bold">
              Admin Panel
            </Link>
            <div className="flex space-x-4">
              <Link
                href="/kullanicilar"
                className={`px-3 py-2 rounded ${
                  pathname === '/kullanicilar' ? 'bg-blue-700' : 'hover:bg-blue-700'
                }`}
              >
                Kullanıcılar
              </Link>
              <Link
                href="/siparisler"
                className={`px-3 py-2 rounded ${
                  pathname === '/siparisler' ? 'bg-blue-700' : 'hover:bg-blue-700'
                }`}
              >
                Siparişler
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Hoş geldiniz, {username || 'Kullanıcı'}</span>
            <Button
              text="Çıkış Yap"
              type="normal"
              stylingMode="outlined"
              onClick={handleLogout}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}


