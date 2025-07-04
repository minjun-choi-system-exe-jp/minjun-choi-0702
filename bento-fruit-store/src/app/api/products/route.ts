import { NextRequest, NextResponse } from 'next/server'
import { Product } from '@/types'

// サンプルデータ（実際の実装では、データベースから取得）
const products: Product[] = [
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

// GET /api/products - 商品一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    let filteredProducts = [...products]

    // カテゴリフィルター
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(product => product.category === category)
    }

    // 検索フィルター
    if (search) {
      const searchLower = search.toLowerCase()
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      )
    }

    // ページネーション
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: {
        products: paginatedProducts,
        pagination: {
          page,
          limit,
          total: filteredProducts.length,
          totalPages: Math.ceil(filteredProducts.length / limit),
        }
      }
    })
  } catch (error) {
    console.error('商品一覧取得エラー:', error)
    return NextResponse.json(
      { success: false, error: '商品一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST /api/products - 商品追加（管理者用）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // バリデーション
    const { name, description, price, stock, category, imageUrl } = body
    
    if (!name || !description || !price || !stock || !category) {
      return NextResponse.json(
        { success: false, error: '必須フィールドが不足しています' },
        { status: 400 }
      )
    }

    if (price <= 0 || stock < 0) {
      return NextResponse.json(
        { success: false, error: '価格と在庫数は正の値である必要があります' },
        { status: 400 }
      )
    }

    if (!['bento', 'fruit'].includes(category)) {
      return NextResponse.json(
        { success: false, error: 'カテゴリは bento または fruit である必要があります' },
        { status: 400 }
      )
    }

    // 新しい商品を作成
    const newProduct: Product = {
      id: Math.max(...products.map(p => p.id)) + 1,
      name,
      description,
      price: parseInt(price),
      stock: parseInt(stock),
      category,
      imageUrl: imageUrl || '/images/default.jpg',
      createdAt: new Date(),
    }

    // 実際の実装では、データベースに保存
    products.push(newProduct)

    return NextResponse.json({
      success: true,
      data: newProduct
    }, { status: 201 })

  } catch (error) {
    console.error('商品追加エラー:', error)
    return NextResponse.json(
      { success: false, error: '商品の追加に失敗しました' },
      { status: 500 }
    )
  }
}