'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CartItem } from '@/types'
import { CartDB } from '@/lib/indexeddb'

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // カートデータを読み込み
  useEffect(() => {
    const loadCartData = async () => {
      try {
        setLoading(true)
        const items = await CartDB.getAll()
        setCartItems(items)
      } catch (err) {
        setError('カートデータの読み込みに失敗しました')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadCartData()
  }, [])

  const updateQuantity = async (productId: number, newQuantity: number) => {
    try {
      await CartDB.updateQuantity(productId, newQuantity)
      // カートデータを再読み込み
      const updatedItems = await CartDB.getAll()
      setCartItems(updatedItems)
    } catch (err) {
      alert('数量の更新に失敗しました')
      console.error(err)
    }
  }

  const removeItem = async (productId: number) => {
    try {
      await CartDB.removeItem(productId)
      // カートデータを再読み込み
      const updatedItems = await CartDB.getAll()
      setCartItems(updatedItems)
    } catch (err) {
      alert('商品の削除に失敗しました')
      console.error(err)
    }
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
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

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <header className="mb-8">
          <nav className="flex justify-between items-center bg-white rounded-lg shadow-md p-4">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              お弁当・果物通販
            </Link>
            <div className="flex space-x-4">
              <Link href="/login" className="btn-secondary">
                ログイン
              </Link>
            </div>
          </nav>
        </header>

        {/* 空のカート */}
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold mb-4">カートが空です</h1>
          <p className="text-gray-600 mb-8">商品をカートに追加してください</p>
          <Link href="/" className="btn-primary">
            商品を見る
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
          <li className="text-gray-900">カート</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* カート商品一覧 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold mb-6">
              ショッピングカート ({getTotalItems()}点)
            </h1>

            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  {/* 商品画像 */}
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-gray-500">画像</span>
                  </div>

                  {/* 商品情報 */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.product.name}</h3>
                    <p className="text-gray-600 text-sm">{item.product.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.product.category === 'bento' 
                          ? 'bg-orange-100 text-orange-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.product.category === 'bento' ? 'お弁当' : '果物'}
                      </span>
                    </div>
                  </div>

                  {/* 数量調整 */}
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                      disabled={item.quantity >= item.product.stock}
                    >
                      +
                    </button>
                  </div>

                  {/* 価格 */}
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary-600">
                      ¥{item.product.price * item.quantity}
                    </div>
                    <div className="text-sm text-gray-500">
                      ¥{item.product.price} × {item.quantity}
                    </div>
                  </div>

                  {/* 削除ボタン */}
                  <button 
                    onClick={() => removeItem(item.product.id)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            {/* 買い物を続ける */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link href="/" className="btn-secondary">
                ← 買い物を続ける
              </Link>
            </div>
          </div>
        </div>

        {/* 注文サマリー */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">注文サマリー</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>商品合計 ({getTotalItems()}点)</span>
                <span>¥{getTotalPrice()}</span>
              </div>
              <div className="flex justify-between">
                <span>送料</span>
                <span>¥500</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>合計</span>
                  <span className="text-primary-600">¥{getTotalPrice() + 500}</span>
                </div>
              </div>
            </div>

            {/* 注文ボタン */}
            <div className="space-y-3">
              <button className="w-full btn-primary text-lg py-3">
                注文手続きへ
              </button>
              <p className="text-xs text-gray-500 text-center">
                ※ログインが必要です
              </p>
            </div>

            {/* 配送情報 */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold mb-2">配送について</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 送料: ¥500（全国一律）</li>
                <li>• お届け: 注文から2-3営業日</li>
                <li>• 時間指定可能</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}