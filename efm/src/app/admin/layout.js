import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

import { AuthProvider } from '../../utils/context/AuthContext';
import AdminNavbar from "../../components/admin/AdminNavbar";

export const metadata = {
  title: 'Admin Panel',
  description: 'BHM Admin Panel',
};

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <AdminNavbar/>
      <div className="pl-[240px]">
      {children}
      </div>
    </AuthProvider>
  );
}
