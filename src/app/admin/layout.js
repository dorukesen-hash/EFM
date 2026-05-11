'use client';

import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import AdminNavbar from "../../components/admin/AdminNavbar";

export default function AdminLayout({ children }) {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <AdminNavbar/>
      <div className="pl-[240px]">
        {children}
      </div>
    </>
  );
}
