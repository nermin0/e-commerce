import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { OrdersProvider } from './context/OrdersContext'
import { ProductsProvider } from './context/ProductsContext'

import Layout from './shared/layouts/layout.jsx'
import ProtectedRoute from './shared/components/ProtectedRoute.jsx'

import Home from './pages/home/home.jsx'
import Products from './pages/products/products.jsx'
import ProductPage from './pages/product-page/product-page.jsx'
import Login from './pages/login/login.jsx'
import Register from './pages/register/register.jsx'
import AddProduct from './pages/add-product/add-product.jsx'
import MyProducts from './pages/my-products/my-products.jsx'
import Cart from './pages/cart/cart.jsx'
import Checkout from './pages/checkout/checkout.jsx'
import MyOrders from './pages/my-orders/my-orders.jsx'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <OrdersProvider>
          <ProductsProvider>
            <BrowserRouter>
              <Routes>
                {/* Login and Register have their own full-page layout */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Main layout with Header + Footer */}
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductPage />} />

                  {/* Protected routes */}
                  <Route path="/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
                  <Route path="/my-products" element={<ProtectedRoute><MyProducts /></ProtectedRoute>} />
                  <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                  <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ProductsProvider>
        </OrdersProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
