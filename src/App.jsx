import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './presentation/context/UserContext';

// Import components
import Navbar from './presentation/components/Navbar';
import Footer from './presentation/components/Footer';
import HomePage from './presentation/pages/HomePage';
import CategoryPage from './presentation/pages/CategoryPage';
import ProductDetailPage from './presentation/pages/ProductDetailPage';
import AllProductsPage from './presentation/pages/AllProductsPage';
import TestProduct from './test/TestProduct';
import Auth from './presentation/pages/Auth';
import UserProfile from './presentation/pages/UserProfile';

// Import custom CSS
import './presentation/styles/main.css';

// Route bảo vệ yêu cầu người dùng đã đăng nhập
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-800">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

function App() {
  const { user } = useUser();
  
  return (
    <div className="flex flex-col min-h-screen bg-[#0f111a] text-white">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/products" element={<AllProductsPage />} />
          <Route path="/test" element={<TestProduct />} />
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

// Wrapper component để sử dụng UserProvider
const AppWrapper = () => {
  return (
    <Router>
      <UserProvider>
        <App />
      </UserProvider>
    </Router>
  );
};

export default AppWrapper; 