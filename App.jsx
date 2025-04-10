import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import TestProduct from './test/TestProduct';

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
// Import Bootstrap JS
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// Import custom CSS
import './styles/main.css';

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<CategoryPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/test" element={<TestProduct />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App; 