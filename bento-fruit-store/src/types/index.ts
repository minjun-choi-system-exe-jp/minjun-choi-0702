// ユーザー関連の型定義
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

// 商品関連の型定義
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: 'bento' | 'fruit';
  imageUrl: string;
  createdAt: Date;
}

// 注文関連の型定義
export interface Order {
  id: number;
  userId: number;
  orderDate: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalPrice: number;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
}

// カート関連の型定義
export interface CartItem {
  product: Product;
  quantity: number;
}

// API レスポンス型定義
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// フォーム関連の型定義
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ProductForm {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: 'bento' | 'fruit';
  imageUrl: string;
}