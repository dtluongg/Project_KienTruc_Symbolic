import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './presentation/context/UserContext';
import { SearchProvider } from './presentation/context/SearchContext';
import { CartProvider } from './presentation/context/CartContext';

// Import components
import Navbar from './presentation/components/Navbar';
import Footer from './presentation/components/Footer';
import HomePage from './presentation/pages/HomePage';
import CategoryPage from './presentation/pages/CategoryPage';
import ProductDetailPage from './presentation/pages/ProductDetailPage';
import AllProductsPage from './presentation/pages/AllProductsPage';
import CartPage from './presentation/pages/CartPage';
import CheckoutPage from './presentation/pages/CheckoutPage';
import OrderConfirmationPage from './presentation/pages/OrderConfirmationPage';
import PaymentQRPage from './presentation/pages/PaymentQRPage';
import TestProduct from './test/TestProduct';
import Auth from './presentation/pages/Auth';
import UserProfile from './presentation/pages/UserProfile';
import ChatBotGeminiAI from './presentation/components/ChatBotGeminiAI/ChatBotGeminiAI';
import ManagerPage from './presentation/pages/ManagerPage';
import OrderManagementPage from './presentation/pages/OrderManagementPage';
import ProductManagementPage from './presentation/pages/ProductManagementPage';
<<<<<<< HEAD
=======

>>>>>>> Huy_work
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
      <ChatBotGeminiAI />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/products" element={<AllProductsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment-qr/:orderId" element={<PaymentQRPage />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
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
          <Route path="/manager" element={<ManagerPage />} />
          <Route path="/orders" element={<OrderManagementPage />} />
          <Route path="/product-management" element={<ProductManagementPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

// Wrapper component để sử dụng UserProvider
const AppWrapper = () => {
  return (
    <BrowserRouter>
      <UserProvider>
        <SearchProvider>
          <CartProvider>
          <App />
          </CartProvider>
        </SearchProvider>
      </UserProvider>
    </BrowserRouter>
  );
};

export default AppWrapper; 