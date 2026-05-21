import "./globals.css";
import 'react-toastify/dist/ReactToastify.css';
import React from 'react';
import AuthSessionProvider from "./providers/AuthProvider";
import { AuthProvider } from '../utils/context/AuthContext';
import ClientLayout from "../components/ClientLayout";


export const metadata = {
  title: "Av. Enver Furkan Mete | Rize",
  description: "Rize merkezli avukat Enver Furkan Mete. Aile hukuku, ceza hukuku, idare hukuku, ticaret hukuku, miras ve tazminat davalarında profesyonel hukuki danışmanlık ve çözüm odaklı temsil.",
};


export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="description" content={metadata.description} />
        <title>{metadata.title}</title>
      </head>
      <body className="bg-background text-primary relative min-h-screen">
        <AuthSessionProvider>
          <AuthProvider>
            <ClientLayout>{children}</ClientLayout>
          </AuthProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
