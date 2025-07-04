'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Product } from '@/types'
import { ProductDB, CartDB } from '@/lib/indexeddb'

interface ProductPageProps {
  params: {
    id: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuantity, setSelectedQuantity] = useState(1)

  // 商品データを読み込み
  useEffect(() => {
    const loadProductData = async () => {
      try {
        setLoading(true)
        const productId = parseInt(params.id)
        
        if (isNaN(productId)) {
          setError('無効な商品IDです')
          return
        }

        const productData = await ProductDB.getById(productId)
        if (!productData) {
          setError('商品が見つかりません')
          return
        }

        setProduct(productData)

        // 関連商品を取得（同じカテゴリの他の商品）
        const categoryProducts = await ProductDB.getByCategory(productData.category)
        const related = categoryProducts
          .filter(p => p.id !== productData.id)
          .slice(0, 3)
        setRelatedProducts(related)

      } catch (err) {
        setError('商品データの読み込みに失敗しました')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadProductData()
  }, [params.id])

  // カートに追加
  const handleAddToCart = async () => {
    if (!product) return

    try {
      await CartDB.addItem(product.id, selectedQuantity)
      alert(`${product.name} を ${selectedQuantity}個 カートに追加しました！`)
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

  if (error || !product) {

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{error || '商品が見つかりません'}</h1>
          <Link href="/" className="btn-primary">
            トップページに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <header className="mb-8">
        <nav className="flex justify-between items-center bg-white rounded-lg shadow-md p-4">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            お弁当・果物通販
          </Link>
          <div className="flex space-x-4">
            <Link href="/cart" className="btn-primary">
              カート
            </Link>
            <Link href="/login" className="btn-secondary">
              ログイン
            </Link>
          </div>
        </nav>
      </header>

      {/* パンくずリスト */}
      <nav className="mb-6">
        <ol className="flex space-x-2 text-sm text-gray-600">
          <li><Link href="/" className="hover:text-primary-600">トップ</Link></li>
          <li>/</li>
          <li><Link href="/" className="hover:text-primary-600">商品一覧</Link></li>
          <li>/</li>
          <li className="text-gray-900">{product.name}</li>
        </ol>
      </nav>

      {/* 商品詳細 */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 商品画像 */}
          <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 text-lg">商品画像</span>
          </div>

          {/* 商品情報 */}
          <div>
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                product.category === 'bento' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {product.category === 'bento' ? 'お弁当' : '果物'}
              </span>
            </div>

            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            
            <div className="text-4xl font-bold text-primary-600 mb-6">
              ¥{product.price}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">商品説明</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">在庫数:</span>
                <span className={`font-semibold ${
                  product.stock > 10 ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {product.stock}個
                </span>
              </div>
            </div>

            {/* 数量選択とカート追加 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label htmlFor="quantity" className="text-sm font-medium">
                  数量:
                </label>
                <select
                  id="quantity"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 btn-primary text-lg py-3"
                  disabled={product.stock === 0}
                >
                  {product.stock > 0 ? 'カートに追加' : '在庫切れ'}
                </button>
                <button className="btn-secondary text-lg py-3 px-6">
                  お気に入り
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 関連商品 */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6">関連商品</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedProducts.map((relatedProduct) => (
              <Link 
                key={relatedProduct.id} 
                href={`/products/${relatedProduct.id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500">画像</span>
                </div>
                <h3 className="font-semibold mb-2">{relatedProduct.name}</h3>
                <p className="text-2xl font-bold text-primary-600">
                  ¥{relatedProduct.price}
                </p>
              </Link>
            ))}
        </div>
      </section>
    </div>
  )
}