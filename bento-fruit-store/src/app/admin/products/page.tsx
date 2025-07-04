'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Product } from '@/types'
import { ProductDB, initializeData } from '@/lib/indexeddb'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [filterCategory, setFilterCategory] = useState<'all' | 'bento' | 'fruit'>('all')

  // 初期データ読み込み
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        await initializeData()
        const allProducts = await ProductDB.getAll()
        setProducts(allProducts)
      } catch (err) {
        setError('商品データの読み込みに失敗しました')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredProducts = products.filter(product =>
    filterCategory === 'all' || product.category === filterCategory
  )

  const handleDelete = async (id: number) => {
    if (confirm('この商品を削除しますか？')) {
      try {
        await ProductDB.delete(id)
        const updatedProducts = await ProductDB.getAll()
        setProducts(updatedProducts)
      } catch (err) {
        alert('商品の削除に失敗しました')
        console.error(err)
      }
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowAddForm(true)
  }

  const handleSave = async (formData: FormData) => {
    try {
      const productData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: parseInt(formData.get('price') as string),
        stock: parseInt(formData.get('stock') as string),
        category: formData.get('category') as 'bento' | 'fruit',
        imageUrl: formData.get('imageUrl') as string,
      }

      if (editingProduct) {
        // 編集
        const updatedProduct: Product = {
          ...editingProduct,
          ...productData,
        }
        await ProductDB.update(updatedProduct)
      } else {
        // 新規追加
        const newProduct: Product = {
          id: Math.max(...products.map(p => p.id), 0) + 1,
          ...productData,
          createdAt: new Date(),
        }
        await ProductDB.add(newProduct)
      }

      // 商品リストを再読み込み
      const updatedProducts = await ProductDB.getAll()
      setProducts(updatedProducts)
      setShowAddForm(false)
      setEditingProduct(null)
    } catch (err) {
      alert('商品の保存に失敗しました')
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
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="text-primary-600 hover:text-primary-700">
              ← 管理画面
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            新規商品追加
          </button>
        </nav>
      </header>

      {/* フィルター */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button 
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterCategory === 'all' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            すべて
          </button>
          <button 
            onClick={() => setFilterCategory('bento')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterCategory === 'bento' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            お弁当
          </button>
          <button 
            onClick={() => setFilterCategory('fruit')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterCategory === 'fruit' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            果物
          </button>
        </div>
      </div>

      {/* 商品一覧テーブル */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                商品名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                カテゴリ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                価格
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                在庫
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                作成日
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg mr-4 flex items-center justify-center">
                      <span className="text-xs text-gray-500">画像</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {product.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.category === 'bento' 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {product.category === 'bento' ? 'お弁当' : '果物'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ¥{product.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-semibold ${
                    product.stock < 10 ? 'text-red-600' : 
                    product.stock < 30 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {product.stock}個
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.createdAt.toLocaleDateString('ja-JP')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      編集
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      削除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 商品追加/編集フォーム */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">
              {editingProduct ? '商品編集' : '新規商品追加'}
            </h2>
            <form action={handleSave}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    商品名
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingProduct?.name || ''}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    説明
                  </label>
                  <textarea
                    name="description"
                    defaultValue={editingProduct?.description || ''}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      価格
                    </label>
                    <input
                      type="number"
                      name="price"
                      defaultValue={editingProduct?.price || ''}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      在庫数
                    </label>
                    <input
                      type="number"
                      name="stock"
                      defaultValue={editingProduct?.stock || ''}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    カテゴリ
                  </label>
                  <select
                    name="category"
                    defaultValue={editingProduct?.category || 'bento'}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="bento">お弁当</option>
                    <option value="fruit">果物</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    画像URL
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    defaultValue={editingProduct?.imageUrl || ''}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-4 mt-6">
                <button type="submit" className="flex-1 btn-primary">
                  {editingProduct ? '更新' : '追加'}
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingProduct(null)
                  }}
                  className="flex-1 btn-secondary"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}