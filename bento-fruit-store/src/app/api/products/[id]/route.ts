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
]

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/products/[id] - 個別商品取得
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const productId = parseInt(params.id)
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: '無効な商品IDです' },
        { status: 400 }
      )
    }

    const product = products.find(p => p.id === productId)
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: '商品が見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: product
    })

  } catch (error) {
    console.error('商品取得エラー:', error)
    return NextResponse.json(
      { success: false, error: '商品の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - 商品更新（管理者用）
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const productId = parseInt(params.id)
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: '無効な商品IDです' },
        { status: 400 }
      )
    }

    const productIndex = products.findIndex(p => p.id === productId)
    
    if (productIndex === -1) {
      return NextResponse.json(
        { success: false, error: '商品が見つかりません' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, description, price, stock, category, imageUrl } = body
    
    // バリデーション
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

    // 商品を更新
    const updatedProduct: Product = {
      ...products[productIndex],
      name,
      description,
      price: parseInt(price),
      stock: parseInt(stock),
      category,
      imageUrl: imageUrl || products[productIndex].imageUrl,
    }

    // 実際の実装では、データベースを更新
    products[productIndex] = updatedProduct

    return NextResponse.json({
      success: true,
      data: updatedProduct
    })

  } catch (error) {
    console.error('商品更新エラー:', error)
    return NextResponse.json(
      { success: false, error: '商品の更新に失敗しました' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - 商品削除（管理者用）
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const productId = parseInt(params.id)
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: '無効な商品IDです' },
        { status: 400 }
      )
    }

    const productIndex = products.findIndex(p => p.id === productId)
    
    if (productIndex === -1) {
      return NextResponse.json(
        { success: false, error: '商品が見つかりません' },
        { status: 404 }
      )
    }

    // 実際の実装では、データベースから削除
    const deletedProduct = products.splice(productIndex, 1)[0]

    return NextResponse.json({
      success: true,
      data: deletedProduct,
      message: '商品が削除されました'
    })

  } catch (error) {
    console.error('商品削除エラー:', error)
    return NextResponse.json(
      { success: false, error: '商品の削除に失敗しました' },
      { status: 500 }
    )
  }
}