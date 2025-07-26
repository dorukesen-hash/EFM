import { AuthProvider } from '../../utils/context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const metadata = {
  title: 'Admin Panel',
  description: 'EFM Admin Panel',
};

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      {children}
    </AuthProvider>
  );
}
