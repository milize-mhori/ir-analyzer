# 画面・コンポーネント一覧

## 1. 画面一覧

### 1.1 メイン画面 (`/`)
- **ファイル**: `src/app/page.tsx`
- **説明**: IR資料比較分析のメイン画面
- **レイアウト**: ヘッダー + タブ構成

## 2. レイアウトコンポーネント

### 2.1 ヘッダー
- **ファイル**: `src/components/Header.tsx`
- **機能**: 
  - アプリタイトル表示
  - LLM選択ドロップダウン
  - 設定ボタン（Phase 2以降）

### 2.2 タブナビゲーション
- **ファイル**: `src/components/TabNavigation.tsx`
- **機能**: 
  - 3つのタブ切り替え
  - アクティブタブの表示
  - タブ間の状態管理

## 3. タブコンテンツコンポーネント

### 3.1 要約入力タブ
- **ファイル**: `src/components/tabs/SummaryInputTab.tsx`
- **子コンポーネント**:
  - `CompanyInput.tsx` - 個別企業入力

### 3.2 プロンプトタブ
- **ファイル**: `src/components/tabs/PromptTab.tsx`
- **統合コンポーネント**: プロンプト選択・編集・保存機能を統合

### 3.3 結果表示タブ
- **ファイル**: `src/components/tabs/ResultTab.tsx`
- **子コンポーネント**:
  - `ResultActions.tsx` - コピー・再実行ボタン

## 4. 共通コンポーネント

### 4.1 入力系
- **Button**: `src/components/ui/Button.tsx`
- **Textarea**: `src/components/ui/Textarea.tsx`
- **Input**: `src/components/ui/Input.tsx`
- **Select**: `src/components/ui/Select.tsx`

### 4.2 表示系
- **Card**: `src/components/ui/Card.tsx`
- **Loading**: `src/components/ui/Loading.tsx`
- **Toast**: `src/components/ui/Toast.tsx`

### 4.3 モーダル系
- **Phase 2以降で実装予定**

## 5. フック

### 5.1 状態管理
- **useTabState**: `src/hooks/useTabState.ts` - タブ状態管理
- **useCompanies**: `src/hooks/useCompanies.ts` - 企業データ管理
- **usePrompts**: `src/hooks/usePrompts.ts` - プロンプト管理
- **useLLM**: `src/hooks/useLLM.ts` - LLM選択・実行

### 5.2 ユーティリティ
- **useClipboard**: `src/hooks/useClipboard.ts` - クリップボード操作

## 6. ページ構成図

```
┌─────────────────────────────────────┐
│ Header (LLM選択)                    │
├─────────────────────────────────────┤
│ TabNavigation                       │
│ [要約入力] [プロンプト] [結果表示]     │
├─────────────────────────────────────┤
│ TabContent                          │
│                                   │
│ ・SummaryInputTab                   │
│   ├ CompanyInput (基準企業)          │
│   └ CompanyInput[] (比較企業)        │
│                                   │
│ ・PromptTab                         │
│   └ 統合機能（選択・編集・保存）      │
│                                   │
│ ・ResultTab                         │
│   └ ResultActions                   │
│                                   │
└─────────────────────────────────────┘
```

## 7. 実装優先度

### Phase 1 (MVP)
- [x] Header（基本構造）
- [ ] TabNavigation
- [ ] SummaryInputTab + CompanyInput
- [ ] PromptTab（基本編集のみ）
- [ ] ResultTab（基本表示のみ）
- [ ] 基本的なUI コンポーネント

### Phase 2
- [ ] PromptSelector + 保存機能
- [ ] 高度なUI コンポーネント
- [ ] モーダル系コンポーネント
- [ ] エラーハンドリング

### Phase 3
- [ ] アニメーション
- [ ] レスポンシブ対応
- [ ] アクセシビリティ改善
