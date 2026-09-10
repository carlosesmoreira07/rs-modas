import React from 'react';
import { Route, Routes, BrowserRouter as Router, Outlet } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { StoreProvider } from './lib/store';
import { DemoNotice, Header, Footer } from './components/chrome';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductPage from './pages/ProductPage';
import AdminPage from './pages/AdminPage';

function Layout() {
    return (
        <div className="flex min-h-[100dvh] flex-col">
            <DemoNotice />
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

function App() {
    return (
        <StoreProvider>
            <Router>
                <ScrollToTop />
                <Routes>
                    <Route element={<Layout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/catalogo" element={<CatalogPage />} />
                        <Route path="/produto/:id" element={<ProductPage />} />
                        <Route path="/painel" element={<AdminPage />} />
                        <Route path="*" element={<HomePage />} />
                    </Route>
                </Routes>
            </Router>
        </StoreProvider>
    );
}

export default App;
