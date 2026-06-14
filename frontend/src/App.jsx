import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Navbar from './components/Navbar';
import HelpButton from './components/HelpButton';
import WhatsAppChat from './components/WhatsAppChat';
import { ThemeProvider } from './contexts/ThemeContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { useSidebar } from './contexts/sidebar-context';

const Landing       = lazy(() => import('./pages/Landing'));
const Feed          = lazy(() => import('./pages/Feed'));
const Login         = lazy(() => import('./pages/Login'));
const Register      = lazy(() => import('./pages/Register'));
const CreatePin     = lazy(() => import('./pages/CreatePin'));
const Profile       = lazy(() => import('./pages/Profile'));
const PublicProfile   = lazy(() => import('./pages/PublicProfile'));
const GitHubCallback  = lazy(() => import('./pages/GitHubCallback'));
const AdminPanel    = lazy(() => import('./pages/AdminPanel'));
const Terms         = lazy(() => import('./pages/Terms'));

function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('nexus_token') !== null;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EFF6FF] dark:bg-[#020B18]">
      <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" aria-label="Cargando página" />
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/registro' || location.pathname === '/github/callback';
  const { isSidebarCollapsed } = useSidebar();

  useEffect(() => {
    const go = () => {
      import('./pages/Feed');
      import('./pages/Landing');
      if (localStorage.getItem('nexus_token')) {
        import('./pages/Profile');
        import('./pages/CreatePin');
      }
    };
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(go, { timeout: 3000 });
      return () => cancelIdleCallback(id);
    }
    const t = setTimeout(go, 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col w-full bg-[#EFF6FF] text-[#0F172A] dark:bg-[#020B18] dark:text-[#F0F8FF] selection:bg-[#2563EB]/30 transition-colors duration-300">
      {!isAuthPage && <Navbar />}
      <main className={`w-full flex-1 flex flex-col transition-all duration-300 ${!isAuthPage ? (isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64') : ''} ${!isAuthPage ? 'pb-14 md:pb-0' : ''}`} style={!isAuthPage ? { paddingTop: 'env(safe-area-inset-top)' } : {}}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"         element={<Landing />} />
            <Route path="/explorar" element={<Feed />} />
            <Route path="/terminos" element={<Terms />} />
            <Route path="/crear"    element={<ProtectedRoute><CreatePin /></ProtectedRoute>} />
            <Route path="/perfil"          element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/usuario/:userId" element={<PublicProfile />} />
            <Route path="/admin"           element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
            <Route path="/login"            element={<Login />} />
            <Route path="/registro"         element={<Register />} />
            <Route path="/github/callback"  element={<GitHubCallback />} />
            <Route path="*"                 element={<Landing />} />
          </Routes>
        </Suspense>
      </main>
      {!isAuthPage && <HelpButton />}
      {!isAuthPage && <WhatsAppChat />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </SidebarProvider>
    </ThemeProvider>
  );
}
