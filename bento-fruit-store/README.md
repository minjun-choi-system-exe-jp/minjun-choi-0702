# お弁当・果物通販サイト

Next.jsで構築されたお弁当と果物の通販サイトです。ユーザー向けの商品購入機能と管理者向けの商品管理機能を提供します。

## 機能

### ユーザー向け機能
- 商品一覧表示
- 商品詳細表示
- カテゴリ別フィルタリング（お弁当・果物）
- ショッピングカート機能
- 商品検索
- ユーザー登録・ログイン

### 管理者向け機能
- 管理ダッシュボード
- 商品管理（追加・編集・削除）
- 注文管理
- 在庫管理
- 売上統計

## 技術スタック

- **フロントエンド**: Next.js 15, React, TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: IndexedDB（ブラウザ内ストレージ）
- **開発ツール**: ESLint, PostCSS
- **API**: Next.js API Routes

## セットアップ

### 前提条件
- Node.js 18.0以上
- npm または yarn

### インストール

1. リポジトリをクローン
```bash
git clone <repository-url>
cd bento-fruit-store
```

2. 依存関係をインストール
```bash
npm install
```

3. 開発サーバーを起動
```bash
npm run dev
```

4. ブラウザで http://localhost:3000 にアクセス

## 利用可能なスクリプト

- `npm run dev` - 開発サーバーを起動
- `npm run build` - プロダクション用にビルド
- `npm run start` - プロダクションサーバーを起動
- `npm run lint` - ESLintでコードをチェック

## プロジェクト構造

```
bento-fruit-store/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   └── products/      # 商品API
│   │   ├── admin/             # 管理画面
│   │   ├── cart/              # カートページ
│   │   ├── login/             # ログインページ
│   │   ├── products/          # 商品ページ
│   │   ├── globals.css        # グローバルCSS
│   │   ├── layout.tsx         # ルートレイアウト
│   │   └── page.tsx           # トップページ
│   ├── components/            # 再利用可能なコンポーネント
│   ├── lib/                   # ユーティリティ関数
│   └── types/                 # TypeScript型定義
├── public/                    # 静的ファイル
├── tailwind.config.js         # Tailwind設定
├── tsconfig.json             # TypeScript設定
└── next.config.js            # Next.js設定
```

## API エンドポイント

### 商品API
- `GET /api/products` - 商品一覧取得
  - クエリパラメータ: `category`, `search`, `page`, `limit`
- `POST /api/products` - 商品追加（管理者用）
- `GET /api/products/[id]` - 個別商品取得
- `PUT /api/products/[id]` - 商品更新（管理者用）
- `DELETE /api/products/[id]` - 商品削除（管理者用）

## 主要ページ

### ユーザー向け
- `/` - トップページ（商品一覧）
- `/products/[id]` - 商品詳細ページ
- `/cart` - ショッピングカート
- `/login` - ログインページ

### 管理者向け
- `/admin` - 管理ダッシュボード
- `/admin/products` - 商品管理
- `/admin/orders` - 注文管理（準備中）
- `/admin/users` - ユーザー管理（準備中）

## データ構造

### 商品 (Product)
```typescript
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: 'bento' | 'fruit';
  imageUrl: string;
  createdAt: Date;
}
```

### 注文 (Order)
```typescript
interface Order {
  id: number;
  userId: number;
  orderDate: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalPrice: number;
  items: OrderItem[];
}
```

## IndexedDBによるデータ管理

このアプリケーションは、ブラウザ内のIndexedDBを使用してデータを管理しています。

### 主な機能
- **商品データ**: 商品情報の永続化
- **カートデータ**: ショッピングカートの状態保存
- **注文データ**: 注文履歴の管理
- **自動初期化**: 初回アクセス時にサンプルデータを自動設定

### データベース構造
- `products`: 商品情報
- `cart`: カート内容
- `orders`: 注文履歴
- `users`: ユーザー情報
- `settings`: アプリケーション設定

### 利点
- サーバー不要でローカル動作
- オフライン対応
- 高速なデータアクセス
- ブラウザ間でのデータ永続化

## 今後の拡張予定

- [ ] データベース連携（PostgreSQL/MySQL）
- [ ] 決済機能（Stripe連携）
- [ ] 画像アップロード機能
- [ ] メール通知機能
- [ ] 注文履歴機能
- [ ] レビュー・評価機能
- [ ] 在庫アラート機能
- [ ] レスポンシブデザインの改善
- [ ] PWA対応
- [ ] テスト実装

## 開発ガイドライン

### コーディング規約
- TypeScriptを使用
- ESLintルールに従う
- Tailwind CSSでスタイリング
- コンポーネントは再利用可能な形で作成

### Git ワークフロー
1. 機能ブランチを作成
2. 変更をコミット
3. プルリクエストを作成
4. レビュー後にマージ

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 貢献

バグ報告や機能提案は、GitHubのIssuesでお願いします。
プルリクエストも歓迎します。

## サポート

質問や問題がある場合は、以下の方法でお問い合わせください：
- GitHub Issues
- メール: support@example.com