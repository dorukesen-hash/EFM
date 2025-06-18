'use client';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/utils/firebaseConfig';

export default function GoogleLoginButton() {
    const router = useRouter();

    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();
            // idToken'ı backend'e gönder
            const response = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
                credentials: 'include',
            });
            if (response.ok) {
                router.push('/auth/profile');
            } else {
                alert('Google ile giriş başarısız!');
            }
        } catch (err) {
            alert('Google ile giriş sırasında hata oluştu!');
        }
    };

    return (
        <button onClick={handleGoogleLogin} className="google-login-button">
            Google ile Giriş Yap
        </button>
    );
}
