'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Product } from '@/types'
import { ProductDB, CartDB, initializeData } from '@/lib/indexeddb'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'bento' | 'fruit'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 初期データ読み込み
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        await initializeData()
        const allProducts = await ProductDB.getAll()
        setProducts(allProducts)
        setFilteredProducts(allProducts)
      } catch (err) {
        setError('商品データの読み込みに失敗しました')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // カテゴリフィルター
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products)
    } else {
      setFilteredProducts(products.filter(product => product.category === selectedCategory))
    }
  }, [products, selectedCategory])

  // カートに追加
  const handleAddToCart = async (productId: number) => {
    try {
      await CartDB.addItem(productId, 1)
      alert('カートに追加しました！')
    } catch (err) {
      alert('カートへの追加に失敗しました')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            再読み込み
          </button>
        </div>
      </div>
    )
  }
  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <header className="mb-8">
        <nav className="flex justify-between items-center bg-white rounded-lg shadow-md p-4">
          <h1 className="text-2xl font-bold text-primary-600">
            お弁当・果物通販
          </h1>
          <div className="flex space-x-4">
            <Link href="/cart" className="btn-primary">
              カート
            </Link>
            <Link href="/login" className="btn-secondary">
              ログイン
            </Link>
            <Link href="/admin" className="text-sm text-gray-600 hover:text-primary-600">
              管理画面
            </Link>
          </div>
        </nav>
      </header>

      {/* メインコンテンツ */}
      <main>
        {/* ヒーローセクション */}
        <section className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4">
            新鮮なお弁当と果物をお届け
          </h2>
          <p className="text-lg mb-6">
            毎日作りたての美味しいお弁当と、産地直送の新鮮な果物をご提供しています。
          </p>
          <Link href="#products" className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            商品を見る
          </Link>
        </section>

        {/* 商品一覧 */}
        <section id="products">
          <h2 className="text-2xl font-bold mb-6">おすすめ商品</h2>
          
          {/* カテゴリフィルター */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setSelectedCategory('all')}
              className={selectedCategory === 'all' ? 'btn-primary' : 'btn-secondary'}
            >
              すべて
            </button>
            <button
              onClick={() => setSelectedCategory('bento')}
              className={selectedCategory === 'bento' ? 'btn-primary' : 'btn-secondary'}
            >
              お弁当
            </button>
            <button
              onClick={() => setSelectedCategory('fruit')}
              className={selectedCategory === 'fruit' ? 'btn-primary' : 'btn-secondary'}
            >
              果物
            </button>
          </div>

          {/* 商品グリッド */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="card hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500">画像</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-primary-600">
                    ¥{product.price}
                  </span>
                  <span className="text-sm text-gray-500">
                    在庫: {product.stock}個
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Link 
                    href={`/products/${product.id}`}
                    className="flex-1 text-center btn-secondary"
                  >
                    詳細
                  </Link>
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className="flex-1 btn-primary"
                  >
                    カートに追加
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="mt-16 bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600">
          © 2025 お弁当・果物通販サイト. All rights reserved.
        </p>
      </footer>
    </div>
  )
}