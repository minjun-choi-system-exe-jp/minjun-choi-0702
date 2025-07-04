import Link from 'next/link'
import { Product, Order } from '@/types'

// サンプルデータ
const sampleProducts: Product[] = [
  {
    id: 1,
    name: '特製幕の内弁当',
    description: '栄養バランスの取れた人気のお弁当です',
    price: 680,
    stock: 50,
    category: 'bento',
    imageUrl: '/images/bento1.jpg',
    createdAt: new Date(),
  },
  {
    id: 2,
    name: '唐揚げ弁当',
    description: 'ジューシーな唐揚げがメインのお弁当',
    price: 580,
    stock: 30,
    category: 'bento',
    imageUrl: '/images/bento2.jpg',
    createdAt: new Date(),
  },
]

const sampleOrders: Order[] = [
  {
    id: 1,
    userId: 1,
    orderDate: new Date(),
    status: 'pending',
    totalPrice: 1260,
    items: [],
  },
  {
    id: 2,
    userId: 2,
    orderDate: new Date(),
    status: 'processing',
    totalPrice: 680,
    items: [],
  },
]

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <header className="mb-8">
        <nav className="flex justify-between items-center bg-white rounded-lg shadow-md p-4">
          <h1 className="text-2xl font-bold text-primary-600">
            管理画面
          </h1>
          <div className="flex space-x-4">
            <Link href="/" className="btn-secondary">
              サイトに戻る
            </Link>
            <button className="text-sm text-gray-600 hover:text-primary-600">
              ログアウト
            </button>
          </div>
        </nav>
      </header>

      {/* ダッシュボード統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">総商品数</h3>
          <p className="text-3xl font-bold text-primary-600">{sampleProducts.length}</p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">総注文数</h3>
          <p className="text-3xl font-bold text-green-600">{sampleOrders.length}</p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">今日の売上</h3>
          <p className="text-3xl font-bold text-blue-600">¥1,940</p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">在庫切れ</h3>
          <p className="text-3xl font-bold text-red-600">0</p>
        </div>
      </div>

      {/* メニュー */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/products" className="card hover:shadow-lg transition-shadow">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">商品管理</h3>
            <p className="text-gray-600">商品の追加、編集、削除</p>
          </div>
        </Link>

        <Link href="/admin/orders" className="card hover:shadow-lg transition-shadow">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">注文管理</h3>
            <p className="text-gray-600">注文の確認、ステータス更新</p>
          </div>
        </Link>

        <Link href="/admin/users" className="card hover:shadow-lg transition-shadow">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">ユーザー管理</h3>
            <p className="text-gray-600">ユーザー情報の確認</p>
          </div>
        </Link>
      </div>

      {/* 最近の注文 */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">最近の注文</h2>
          <Link href="/admin/orders" className="text-primary-600 hover:text-primary-700">
            すべて見る →
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  注文ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  注文日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金額
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sampleOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.orderDate.toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status === 'pending' ? '保留中' :
                       order.status === 'processing' ? '処理中' :
                       order.status === 'shipped' ? '発送済み' :
                       order.status === 'delivered' ? '配達完了' : 'キャンセル'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ¥{order.totalPrice}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 在庫少ない商品 */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">在庫少ない商品</h2>
          <Link href="/admin/products" className="text-primary-600 hover:text-primary-700">
            すべて見る →
          </Link>
        </div>
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
                  在庫数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  価格
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sampleProducts
                .filter(product => product.stock < 50)
                .map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category === 'bento' ? 'お弁当' : '果物'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-semibold ${
                      product.stock < 10 ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      {product.stock}個
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ¥{product.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}