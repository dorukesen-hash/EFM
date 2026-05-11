"use client";
import React from 'react';
import { ToastContainer } from 'react-toastify';
import { usePathname } from 'next/navigation';

import { Whatsapp } from "./Whatsapp";
import Navbar from './Navbar';
import Footer from "./Footer";

function ClientLayout({ children }) {
  const pathname = usePathname();
  const showHeader = !pathname.startsWith('/admin');
  return (
    <>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
        <Whatsapp/>
        {showHeader && <Navbar />}
        {children}
        {showHeader && <Footer/>}
    </>
  );
}

export default React.memo(ClientLayout);
