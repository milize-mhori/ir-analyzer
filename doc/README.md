# IR関連資料比較分析システム

IR（Investor Relations）関連資料の要約文書を複数比較し、共通点・差異を分析するWebアプリケーション。

## 📁 プロジェクト構成

```
30_FGL/
├── doc/                    # 📋 プロジェクト設計書
│   ├── SPEC.md            # 仕様書
│   ├── COMPONENTS.md      # 画面・コンポーネント一覧
│   ├── FEATURES.md        # 機能一覧
│   ├── DATA.md           # データ一覧
│   └── TASKS.md          # 実装タスクリスト
│
├── ir-analyzer/           # 💻 アプリケーションコード
│   ├── src/
│   │   ├── app/          # Next.js App Router
│   │   ├── components/   # Reactコンポーネント
│   │   ├── hooks/        # カスタムフック
│   │   ├── types/        # TypeScript型定義
│   │   └── utils/        # ユーティリティ関数
│   ├── public/           # 静的ファイル
│   ├── amplify.yml       # AWS Amplifyデプロイ設定
│   └── ...              # 設定ファイル
│
└── README.md             # このファイル
```

## 🚀 開発フロー

### 1. 設計フェーズ ✅
- [x] 仕様書作成 (`doc/SPEC.md`)
- [x] コンポーネント設計 (`doc/COMPONENTS.md`)
- [x] 機能一覧整理 (`doc/FEATURES.md`)
- [x] データ構造定義 (`doc/DATA.md`)
- [x] 詳細タスクリスト (`doc/TASKS.md`)

### 2. 実装フェーズ (進行中)
- [x] Phase 1a: プロジェクト基盤整備 (T1)
- [x] Phase 1b: 基本UIコンポーネント (T2)
- [ ] Phase 1c: レイアウトコンポーネント (T3)
- [ ] Phase 1d: 企業要約入力機能 (T4)
- [ ] Phase 1e: プロンプト入力機能 (T5)
- [ ] Phase 1f: LLM連携機能 (T6)
- [ ] Phase 1g: 結果表示機能 (T7)
- [ ] Phase 1h: 統合・動作確認 (T8)

### 3. 現在のタスク進捗
**✅ 完了済み:**
- T1.1 ディレクトリ構造作成
- T1.2 型定義ファイル作成
- T2.1 汎用UIコンポーネント作成
- T2.2 ローディング・エラーUI作成

**🔄 進行中:**
- AWS Amplifyデプロイ設定

**⏭️ 次の予定:**
- T3.1 ヘッダーコンポーネント作成

## 📖 ドキュメント

| ファイル | 内容 | 更新頻度 |
|----------|------|----------|
| `doc/SPEC.md` | 業務要件・技術要件・画面設計 | 仕様変更時 |
| `doc/COMPONENTS.md` | UI構成・コンポーネント一覧 | 設計変更時 |
| `doc/FEATURES.md` | 機能詳細・実装優先度 | 機能追加時 |
| `doc/DATA.md` | データ構造・型定義・API仕様 | データ変更時 |
| `doc/TASKS.md` | 実装タスク・進捗管理 | 日次更新 |

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 15 + TypeScript + Tailwind CSS v3
- **バックエンド**: Next.js API Routes
- **LLM**: OpenAI GPT-4 (Phase 1), 複数対応 (Phase 2)
- **状態管理**: React hooks + Custom hooks
- **データ永続化**: Local Storage
- **デプロイ**: AWS Amplify
- **CI/CD**: Amplify自動ビルド・デプロイ

## 🌐 デプロイメント

### AWS Amplify設定
```bash
# 1. Amplifyプロジェクト初期化
cd ir-analyzer
npm install -g @aws-amplify/cli
amplify init

# 2. 環境変数設定（Amplifyコンソールで設定）
OPENAI_API_KEY=your_api_key
NEXT_PUBLIC_APP_NAME=IR関連資料比較分析システム

# 3. デプロイ
git push origin main  # 自動デプロイ実行
```

### ローカル開発
```bash
cd ir-analyzer
npm install
npm run dev
```

## 📋 開発ルール

### 仕様駆動開発
1. **設計書優先**: コード変更前に設計書を更新
2. **タスク単位**: TASKS.mdの順序で実装
3. **完了条件**: 各タスクの完了条件を満たしてから次へ
4. **テスト重視**: 各段階でテスト・確認を実行

### コード品質
- TypeScriptエラーなし
- ESLintエラーなし
- 再利用可能なコンポーネント設計
- 適切なコメント記述

### デプロイ要件
- Amplify対応のNext.js設定
- 環境変数の適切な管理
- セキュリティヘッダーの設定
- 画像最適化の無効化（Amplify制限対応）

## 🎯 Phase 1 (MVP) の目標

- 3つのタブ（要約入力・プロンプト・結果表示）
- 企業要約の入力・編集機能
- OpenAI GPT-4での比較分析実行
- 分析結果の表示
- 基本的なエラーハンドリング
- AWS Amplifyでの本番デプロイ

## 📞 開発体制

- **仕様策定**: 設計書ベース
- **実装**: タスクベース開発
- **品質管理**: 段階的テスト
- **進捗管理**: TASKS.md更新
- **デプロイ**: AWS Amplify自動化

## 🔗 関連リンク

- [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)