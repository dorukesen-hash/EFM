'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { googleSignIn } from '../../lib/auth';


export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (res.ok) {
            router.push('/');
        } else {
            const data = await res.json();
            setError(data.error || 'Login failed');
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto mt-20">
            <h1 className="text-2xl">Login</h1>
            <input name="email" type="email" placeholder="Email" className="border p-2" required />
            <input name="password" type="password" placeholder="Password" className="border p-2" required />
            {error && <p className="text-red-500">{error}</p>}
            <button type="submit" className="bg-blue-500 text-white p-2">Login</button>
            <button onClick={googleSignIn}>Login with Google</button>
        </form>
    );
}