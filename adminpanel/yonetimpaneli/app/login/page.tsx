"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import Button from 'devextreme-react/button';
import TextBox from 'devextreme-react/text-box';
import Validator, { RequiredRule } from 'devextreme-react/validator';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Zaten giriş yapılmışsa yönlendir
    if (authService.isAuthenticated()) {
      router.push('/kullanicilar');
    }
  }, [router]);

  function handleLogin() {
    setError('');
    
    if (!username || !password) {
      setError('Lütfen kullanıcı adı ve şifre giriniz.');
      return;
    }

    const success = authService.login(username, password);
    
    if (success) {
      router.push('/kullanicilar');
    } else {
      setError('Giriş başarısız. Lütfen bilgilerinizi kontrol ediniz.');
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Paneli Giriş</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Kullanıcı Adı</label>
            <TextBox
              value={username}
              onValueChanged={(e) => setUsername(e.value)}
              placeholder="Kullanıcı adınızı giriniz"
              width="100%"
            >
              <Validator>
                <RequiredRule message="Kullanıcı adı gereklidir" />
              </Validator>
            </TextBox>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Şifre</label>
            <TextBox
              mode="password"
              value={password}
              onValueChanged={(e) => setPassword(e.value)}
              placeholder="Şifrenizi giriniz"
              width="100%"
            >
              <Validator>
                <RequiredRule message="Şifre gereklidir" />
              </Validator>
            </TextBox>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <Button
            text="Giriş Yap"
            type="default"
            stylingMode="contained"
            width="100%"
            onClick={handleLogin}
          />
        </div>
      </div>
    </div>
  );
}
