import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import Onboarding from './components/Onboarding';
import Home from './components/pages/Home';
import Watchlist from './components/pages/Watchlist';
import StockDetail from './components/pages/StockDetail';
import Orders from './components/pages/Orders';
import Search from './components/pages/Search';
import Analytics from './components/pages/Analytics';

function GlobalToast() {
  const { globalToast, setGlobalToast } = useApp();
  if (!globalToast) return null;
  return (
    <Toast
      key={globalToast.id}
      msg={globalToast.msg}
      type={globalToast.type}
      onClose={() => setGlobalToast(null)}
    />
  );
}

function PageContent() {
  const { page } = useApp();
  switch (page) {
    case 'home':      return <Home />;
    case 'watchlist': return <Watchlist />;
    case 'search':    return <Search />;
    case 'orders':    return <Orders />;
    case 'detail':    return <StockDetail />;
    case 'analytics': return <Analytics />;
    default:          return <Home />;
  }
}

function AppLayout() {
  const { page, navigate } = useApp();
  useKeyboardShortcuts(navigate, page);
  return (
    <div className="app">
      <Navbar />
      <main className="main">
        <div key={page} className="page-in">
          <PageContent />
        </div>
      </main>
      <BottomNav />
      <GlobalToast />
    </div>
  );
}

export default function App() {
  const [onboarded] = useState(() => !!localStorage.getItem('rh_onboarded'));
  const [showApp, setShowApp] = useState(onboarded);

  function handleOnboardingComplete() {
    localStorage.setItem('rh_onboarded', '1');
    setShowApp(true);
  }

  if (!showApp) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}
