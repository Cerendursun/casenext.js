"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/lib/auth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Client-side'da auth kontrolü yap
    const checkAuth = () => {
      if (pathname === '/login') {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      setIsLoading(false);

      if (!authenticated) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [pathname, router]);

  // İlk render'da (server-side) her zaman göster - hydration mismatch'i önlemek için
  if (isLoading || isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Yükleniyor...</div>
      </div>
    );
  }

  // Login sayfasındaysa direkt göster
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Auth kontrolü başarısızsa loading göster (yönlendirme useEffect'te yapılıyor)
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Yönlendiriliyor...</div>
      </div>
    );
  }

  return <>{children}</>;
}


