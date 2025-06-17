import Link from "next/link";


export default function Home() {
  return (
    <div>main page
    <Link href="auth/login">Login</Link>
    <Link href="auth/admin">Admin</Link>
    </div>
  );
}
