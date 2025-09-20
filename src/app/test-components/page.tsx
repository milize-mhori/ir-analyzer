'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Loading, FullScreenLoading } from '@/components/ui/Loading';
import { Toast, ToastContainer, ToastType } from '@/components/ui/Toast';

export default function TestComponentsPage() {
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFullScreenLoading, setShowFullScreenLoading] = useState(false);
  const [toasts, setToasts] = useState<Array<{
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
  }>>([]);

  const selectOptions = [
    { value: 'option1', label: 'オプション 1' },
    { value: 'option2', label: 'オプション 2' },
    { value: 'option3', label: 'オプション 3' },
  ];

  const handleLoadingTest = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  const handleFullScreenLoadingTest = () => {
    setShowFullScreenLoading(true);
    setTimeout(() => setShowFullScreenLoading(false), 3000);
  };

  const addToast = (type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        UIコンポーネントテスト
      </h1>

      {/* Button Tests */}
      <Card title="Button コンポーネント" subtitle="プライマリ、セカンダリ、ローディング状態のテスト">
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Button variant="primary">プライマリボタン</Button>
            <Button variant="secondary">セカンダリボタン</Button>
            <Button disabled>無効化ボタン</Button>
          </div>
          <div className="flex space-x-4">
            <Button variant="primary" isLoading={isLoading}>
              ローディングテスト
            </Button>
            <Button variant="secondary" onClick={handleLoadingTest}>
              ローディング開始
            </Button>
          </div>
        </div>
      </Card>

      {/* Input Tests */}
      <Card title="Input コンポーネント" subtitle="ラベル、エラー、ヘルプテキストのテスト">
        <div className="space-y-4">
          <Input
            label="通常の入力"
            placeholder="何か入力してください"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            helperText="ヘルプテキストです"
          />
          <Input
            label="エラー状態の入力"
            placeholder="エラーのテスト"
            error="これはエラーメッセージです"
          />
          <Input
            label="必須項目"
            placeholder="必須入力"
            required
          />
        </div>
      </Card>

      {/* Textarea Tests */}
      <Card title="Textarea コンポーネント" subtitle="自動リサイズ機能とエラー表示のテスト">
        <div className="space-y-4">
          <Textarea
            label="自動リサイズテキストエリア"
            placeholder="入力すると高さが自動調整されます"
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
            autoResize
            helperText="自動リサイズが有効です"
          />
          <Textarea
            label="固定サイズテキストエリア"
            placeholder="固定サイズのテキストエリア"
            rows={3}
          />
          <Textarea
            label="エラー状態"
            placeholder="エラーのテスト"
            error="テキストエリアのエラーメッセージ"
          />
        </div>
      </Card>

      {/* Select Tests */}
      <Card title="Select コンポーネント" subtitle="ドロップダウン選択とプレースホルダーのテスト">
        <div className="space-y-4">
          <Select
            label="セレクトボックス"
            placeholder="選択してください"
            options={selectOptions}
            value={selectValue}
            onChange={(e) => setSelectValue(e.target.value)}
            helperText="いずれかのオプションを選択してください"
          />
          <Select
            label="エラー状態のセレクト"
            options={selectOptions}
            error="選択が必須です"
          />
          <div className="text-sm text-gray-600">
            選択された値: {selectValue || 'なし'}
          </div>
        </div>
      </Card>

      {/* Card Tests */}
      <Card title="Card コンポーネント" subtitle="タイトル、サブタイトル付きカードのテスト">
        <p className="text-gray-700">
          これはCardコンポーネント内のコンテンツです。カードは適切にスタイリングされており、
          タイトルとサブタイトルが表示されています。
        </p>
      </Card>

      <Card>
        <h4 className="font-medium text-gray-900 mb-2">タイトルなしカード</h4>
        <p className="text-gray-700">
          タイトルとサブタイトルを持たないシンプルなカードです。
        </p>
      </Card>

      {/* Loading Tests */}
      <Card title="Loading コンポーネント" subtitle="ローディングスピナーとフルスクリーンローディングのテスト">
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">基本ローディング</h4>
            <div className="flex space-x-8 items-center">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Small</p>
                <Loading size="sm" text="読み込み中..." />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Medium</p>
                <Loading size="md" text="読み込み中..." />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Large</p>
                <Loading size="lg" text="読み込み中..." />
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">フルスクリーンローディング</h4>
            <Button onClick={handleFullScreenLoadingTest}>
              フルスクリーンローディングテスト（3秒間）
            </Button>
          </div>
        </div>
      </Card>

      {/* Toast Tests */}
      <Card title="Toast コンポーネント" subtitle="成功・エラー・警告・情報メッセージのテスト">
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="primary"
            onClick={() => addToast('success', '成功', '操作が正常に完了しました。')}
          >
            成功トースト
          </Button>
          <Button
            variant="secondary"
            onClick={() => addToast('error', 'エラー', '何らかのエラーが発生しました。')}
          >
            エラートースト
          </Button>
          <Button
            variant="secondary"
            onClick={() => addToast('warning', '警告', 'この操作には注意が必要です。')}
          >
            警告トースト
          </Button>
          <Button
            variant="secondary"
            onClick={() => addToast('info', '情報', '新しい情報があります。')}
          >
            情報トースト
          </Button>
        </div>
      </Card>

      {/* State Display */}
      <Card title="現在の状態" subtitle="コンポーネントの状態を確認">
        <div className="space-y-2 text-sm">
          <div>Input値: {inputValue || '(空)'}</div>
          <div>Textarea値: {textareaValue || '(空)'}</div>
          <div>Select値: {selectValue || '(未選択)'}</div>
          <div>ローディング状態: {isLoading ? 'ローディング中' : '停止中'}</div>
          <div>フルスクリーンローディング: {showFullScreenLoading ? '表示中' : '非表示'}</div>
          <div>アクティブなトースト数: {toasts.length}</div>
        </div>
      </Card>

      {/* Layout Components Test */}
      <Card title="レイアウトコンポーネント" subtitle="ヘッダーとタブナビゲーションのテスト">
        <div className="space-y-4">
          <p className="text-gray-700">
            メインページ（/）でヘッダーとタブナビゲーションの動作を確認できます。
          </p>
          <div className="flex space-x-4">
            <a
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              メインページを確認
            </a>
          </div>
        </div>
      </Card>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      
      {/* Full Screen Loading */}
      {showFullScreenLoading && <FullScreenLoading text="フルスクリーンローディングテスト中..." />}
    </div>
  );
}
