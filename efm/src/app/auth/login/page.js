// auth/login/page.js

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import styles from './login.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email, password }),
                credentials: 'include', // Cookie için eklendi
            });
            if (response.ok) {
                router.push('/auth/profile'); // Başarılı girişte profile'a yönlendir
            } else {
                const data = await response.json().catch(() => ({}));
                setError(data.error || 'Giriş sırasında bir hata oluştu');
            }
        } catch (err) {
            setError('Giriş sırasında bir hata oluştu');
            console.error('Error during login:', err);
        }
    };

    return (
        <div className={styles['login-container']}>
            <h1>Giriş Yap</h1>
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Şifre</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <div className={styles.error}>{error}</div>}
                <button type="submit">Giriş Yap</button>
            </form>
            <div style={{ marginTop: 16 }}>
                <GoogleLoginButton />
            </div>
        </div>
    );
}
