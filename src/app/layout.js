import "./globals.css";
import 'react-toastify/dist/ReactToastify.css';
import React from 'react';
import AuthSessionProvider from "./providers/AuthProvider";
import { AuthProvider } from '../utils/context/AuthContext';
import ClientLayout from "../components/ClientLayout";


export const metadata = {
  title: "BHM Avukatlık Bürosu — Enver Furkan Mete | Rize",
  description: "Rize merkezli BHM Avukatlık Bürosu. Aile hukuku, ceza hukuku, idare hukuku, ticaret hukuku, miras ve tazminat davalarında deneyimli avukat Enver Furkan Mete'den profesyonel hukuki danışmanlık ve çözüm odaklı temsil.",
};


export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
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
