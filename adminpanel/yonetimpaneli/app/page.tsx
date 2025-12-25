import { redirect } from 'next/navigation';
import { authService } from '@/lib/auth';

export default function Home() {
  // Kullanıcı login değilse login sayfasına, login ise kullanıcılar sayfasına yönlendir
  if (authService.isAuthenticated()) {
    redirect('/kullanicilar');
  } else {
    redirect('/login');
  }

  return null; // boş döndür
}

