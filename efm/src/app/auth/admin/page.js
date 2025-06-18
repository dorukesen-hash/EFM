"use client";
import { useUser } from '@/utils/UserContext';


export default function AdminPage() {
    const { user, loading } = useUser();
    if (loading) return <div>Yükleniyor...</div>;
    if (!user) return <div>Kullanıcı bulunamadı.</div>;
    return (
        <div>
            <h1>Admin Panel</h1>
            <div>
                <strong>Adı:</strong> {user.displayName || user.name || '-'}
            </div>
            <div>
                <strong>Email:</strong> {user.email || '-'}
            </div>
            <div>
                <strong>Admin mi?:</strong> {user.isAdmin ? 'Evet' : 'Hayır'}
            </div>
        </div>
    );
}
