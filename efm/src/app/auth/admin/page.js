import { checkSession } from '@/utils/auth'; // checkSession fonksiyonunu import et
import { redirect } from 'next/navigation'; // Yönlendirme için Next.js API'si

export default async function AdminPage() {
    const session = await checkSession(); // Sunucu tarafında session'ı kontrol et

    if (!session) {
        // Eğer session yoksa, login sayfasına yönlendir
        redirect('/');
        return null;  // Yönlendirme yapıldıktan sonra render etmiyoruz
    }

    // Eğer session varsa, admin sayfasını göster
    return (
        <div>
            <h1>Admin Panel</h1>
            <p>Welcome, {session.email}. You have access to the admin panel.</p>
            {/* Admin içeriği burada olabilir */}
        </div>
    );
}
