import { Product, Order, User, CartItem } from '@/types'

// IndexedDBのデータベース名とバージョン
const DB_NAME = 'BentoFruitStore'
const DB_VERSION = 1

// オブジェクトストア名
const STORES = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  USERS: 'users',
  CART: 'cart',
  SETTINGS: 'settings'
} as const

// IndexedDBデータベースを開く
export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error('IndexedDBを開けませんでした'))
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // 商品ストア
      if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
        const productStore = db.createObjectStore(STORES.PRODUCTS, { keyPath: 'id' })
        productStore.createIndex('category', 'category', { unique: false })
        productStore.createIndex('name', 'name', { unique: false })
      }

      // 注文ストア
      if (!db.objectStoreNames.contains(STORES.ORDERS)) {
        const orderStore = db.createObjectStore(STORES.ORDERS, { keyPath: 'id' })
        orderStore.createIndex('userId', 'userId', { unique: false })
        orderStore.createIndex('status', 'status', { unique: false })
        orderStore.createIndex('orderDate', 'orderDate', { unique: false })
      }

      // ユーザーストア
      if (!db.objectStoreNames.contains(STORES.USERS)) {
        const userStore = db.createObjectStore(STORES.USERS, { keyPath: 'id' })
        userStore.createIndex('email', 'email', { unique: true })
      }

      // カートストア
      if (!db.objectStoreNames.contains(STORES.CART)) {
        db.createObjectStore(STORES.CART, { keyPath: 'productId' })
      }

      // 設定ストア
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' })
      }
    }
  })
}

// 商品関連の操作
export class ProductDB {
  // 全商品を取得
  static async getAll(): Promise<Product[]> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PRODUCTS], 'readonly')
      const store = transaction.objectStore(STORES.PRODUCTS)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('商品の取得に失敗しました'))
    })
  }

  // IDで商品を取得
  static async getById(id: number): Promise<Product | null> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PRODUCTS], 'readonly')
      const store = transaction.objectStore(STORES.PRODUCTS)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(new Error('商品の取得に失敗しました'))
    })
  }

  // カテゴリで商品を取得
  static async getByCategory(category: 'bento' | 'fruit'): Promise<Product[]> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PRODUCTS], 'readonly')
      const store = transaction.objectStore(STORES.PRODUCTS)
      const index = store.index('category')
      const request = index.getAll(category)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('商品の取得に失敗しました'))
    })
  }

  // 商品を追加
  static async add(product: Product): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PRODUCTS], 'readwrite')
      const store = transaction.objectStore(STORES.PRODUCTS)
      const request = store.add(product)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('商品の追加に失敗しました'))
    })
  }

  // 商品を更新
  static async update(product: Product): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PRODUCTS], 'readwrite')
      const store = transaction.objectStore(STORES.PRODUCTS)
      const request = store.put(product)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('商品の更新に失敗しました'))
    })
  }

  // 商品を削除
  static async delete(id: number): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PRODUCTS], 'readwrite')
      const store = transaction.objectStore(STORES.PRODUCTS)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('商品の削除に失敗しました'))
    })
  }

  // 商品を検索
  static async search(query: string): Promise<Product[]> {
    const products = await this.getAll()
    const searchLower = query.toLowerCase()
    return products.filter(product => 
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower)
    )
  }
}

// カート関連の操作
export class CartDB {
  // カート内容を取得
  static async getAll(): Promise<CartItem[]> {
    const db = await openDB()
    return new Promise(async (resolve, reject) => {
      try {
        const transaction = db.transaction([STORES.CART], 'readonly')
        const store = transaction.objectStore(STORES.CART)
        const request = store.getAll()

        request.onsuccess = async () => {
          const cartData = request.result
          const cartItems: CartItem[] = []

          for (const item of cartData) {
            const product = await ProductDB.getById(item.productId)
            if (product) {
              cartItems.push({
                product,
                quantity: item.quantity
              })
            }
          }

          resolve(cartItems)
        }
        request.onerror = () => reject(new Error('カートの取得に失敗しました'))
      } catch (error) {
        reject(error)
      }
    })
  }

  // カートに商品を追加
  static async addItem(productId: number, quantity: number): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.CART], 'readwrite')
      const store = transaction.objectStore(STORES.CART)
      
      // 既存のアイテムをチェック
      const getRequest = store.get(productId)
      
      getRequest.onsuccess = () => {
        const existingItem = getRequest.result
        const newQuantity = existingItem ? existingItem.quantity + quantity : quantity
        
        const putRequest = store.put({
          productId,
          quantity: newQuantity
        })
        
        putRequest.onsuccess = () => resolve()
        putRequest.onerror = () => reject(new Error('カートへの追加に失敗しました'))
      }
      
      getRequest.onerror = () => reject(new Error('カートの確認に失敗しました'))
    })
  }

  // カートの商品数量を更新
  static async updateQuantity(productId: number, quantity: number): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.CART], 'readwrite')
      const store = transaction.objectStore(STORES.CART)
      
      if (quantity <= 0) {
        // 数量が0以下の場合は削除
        const request = store.delete(productId)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(new Error('カートからの削除に失敗しました'))
      } else {
        const request = store.put({ productId, quantity })
        request.onsuccess = () => resolve()
        request.onerror = () => reject(new Error('カートの更新に失敗しました'))
      }
    })
  }

  // カートから商品を削除
  static async removeItem(productId: number): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.CART], 'readwrite')
      const store = transaction.objectStore(STORES.CART)
      const request = store.delete(productId)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('カートからの削除に失敗しました'))
    })
  }

  // カートをクリア
  static async clear(): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.CART], 'readwrite')
      const store = transaction.objectStore(STORES.CART)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('カートのクリアに失敗しました'))
    })
  }
}

// 注文関連の操作
export class OrderDB {
  // 全注文を取得
  static async getAll(): Promise<Order[]> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.ORDERS], 'readonly')
      const store = transaction.objectStore(STORES.ORDERS)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('注文の取得に失敗しました'))
    })
  }

  // 注文を追加
  static async add(order: Order): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.ORDERS], 'readwrite')
      const store = transaction.objectStore(STORES.ORDERS)
      const request = store.add(order)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('注文の追加に失敗しました'))
    })
  }

  // 注文ステータスを更新
  static async updateStatus(orderId: number, status: Order['status']): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.ORDERS], 'readwrite')
      const store = transaction.objectStore(STORES.ORDERS)
      
      const getRequest = store.get(orderId)
      getRequest.onsuccess = () => {
        const order = getRequest.result
        if (order) {
          order.status = status
          const putRequest = store.put(order)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject(new Error('注文ステータスの更新に失敗しました'))
        } else {
          reject(new Error('注文が見つかりません'))
        }
      }
      getRequest.onerror = () => reject(new Error('注文の取得に失敗しました'))
    })
  }
}

// 初期データを設定
export const initializeData = async (): Promise<void> => {
  try {
    const products = await ProductDB.getAll()
    
    // 商品データが空の場合、サンプルデータを追加
    if (products.length === 0) {
      const sampleProducts: Product[] = [
        {
          id: 1,
          name: '特製幕の内弁当',
          description: '栄養バランスの取れた人気のお弁当です。白米、焼き魚、煮物、サラダなど、バラエティ豊かなおかずが詰まっています。',
          price: 680,
          stock: 50,
          category: 'bento',
          imageUrl: '/images/bento1.jpg',
          createdAt: new Date('2025-01-01'),
        },
        {
          id: 2,
          name: '唐揚げ弁当',
          description: 'ジューシーな唐揚げがメインのお弁当。特製タレで味付けした唐揚げと、ご飯、副菜がセットになっています。',
          price: 580,
          stock: 30,
          category: 'bento',
          imageUrl: '/images/bento2.jpg',
          createdAt: new Date('2025-01-01'),
        },
        {
          id: 3,
          name: '青森りんご',
          description: '甘くて新鮮な青森産りんご。シャキシャキとした食感と自然な甘さが特徴です。',
          price: 150,
          stock: 100,
          category: 'fruit',
          imageUrl: '/images/apple.jpg',
          createdAt: new Date('2025-01-01'),
        },
        {
          id: 4,
          name: '熊本みかん',
          description: 'ジューシーで甘い熊本産みかん。ビタミンCが豊富で、皮も薄く食べやすいです。',
          price: 120,
          stock: 80,
          category: 'fruit',
          imageUrl: '/images/orange.jpg',
          createdAt: new Date('2025-01-01'),
        },
        {
          id: 5,
          name: '海鮮弁当',
          description: '新鮮な海鮮がたっぷり入った豪華なお弁当です。',
          price: 980,
          stock: 20,
          category: 'bento',
          imageUrl: '/images/seafood.jpg',
          createdAt: new Date('2025-01-01'),
        },
        {
          id: 6,
          name: '山形さくらんぼ',
          description: '甘くてジューシーな山形産さくらんぼです。',
          price: 300,
          stock: 60,
          category: 'fruit',
          imageUrl: '/images/cherry.jpg',
          createdAt: new Date('2025-01-01'),
        },
      ]

      for (const product of sampleProducts) {
        await ProductDB.add(product)
      }
    }
  } catch (error) {
    console.error('初期データの設定に失敗しました:', error)
  }
}