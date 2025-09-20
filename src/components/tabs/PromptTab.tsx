import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { DEFAULT_PROMPTS } from '@/types';
import { usePrompts } from '@/hooks/usePrompts';

interface PromptTabProps {
  onExecute?: (prompt: { name: string; content: string }) => void;
  onBack?: () => void;
}

export const PromptTab: React.FC<PromptTabProps> = ({ onExecute, onBack }) => {
  const { currentPrompt, updateCurrentPrompt, loadTemplate } = usePrompts();
  const [showVariableHelp, setShowVariableHelp] = useState(false);

  // テンプレート選択肢
  const templateOptions = [
    { value: '', label: 'カスタムプロンプト' },
    ...DEFAULT_PROMPTS.map(prompt => ({
      value: prompt.id,
      label: prompt.name,
    })),
  ];

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      loadTemplate(e.target.value);
    } else {
      // カスタムプロンプトの場合はリセット
      updateCurrentPrompt({
        name: '',
        content: '',
      });
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateCurrentPrompt({
      name: e.target.value,
      content: currentPrompt.content,
    });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateCurrentPrompt({
      name: currentPrompt.name,
      content: e.target.value,
    });
  };

  const handleExecute = () => {
    if (isValid && onExecute) {
      onExecute({
        name: currentPrompt.name,
        content: currentPrompt.content,
      });
    }
  };

  // バリデーション
  const isValid = currentPrompt.name.trim() && currentPrompt.content.trim();
  const nameError = !currentPrompt.name.trim() ? 'プロンプト名は必須です' : '';
  const contentError = !currentPrompt.content.trim() ? 'プロンプト内容は必須です' : '';

  // 動的変数の検出
  const variablesInContent = currentPrompt.content.match(/\{[^}]+\}/g) || [];
  const uniqueVariables = [...new Set(variablesInContent)];

  return (
    <div className="space-y-6">
      {/* プロンプトテンプレート選択 */}
      <Card title="📝 プロンプトテンプレート" subtitle="事前定義されたテンプレートまたはカスタムプロンプトを選択">
        <Select
          label="テンプレート選択"
          options={templateOptions}
          onChange={handleTemplateChange}
          placeholder="プロンプトテンプレートを選択"
          helperText="テンプレートを選択すると自動でプロンプト内容が入力されます"
        />
      </Card>

      {/* プロンプト基本情報 */}
      <Card title="⚙️ プロンプト設定">
        <div className="space-y-4">
          {/* プロンプト名 */}
          <Input
            label="プロンプト名 *"
            value={currentPrompt.name}
            onChange={handleNameChange}
            placeholder="例：詳細な競合比較分析"
            error={nameError}
            required
            helperText="この分析の目的や特徴を表す名前を付けてください"
          />

          {/* プロンプト内容 */}
          <Textarea
            label="プロンプト内容 *"
            value={currentPrompt.content}
            onChange={handleContentChange}
            placeholder="LLMに送信するプロンプトを入力してください&#10;&#10;動的変数を使用できます：&#10;{基準企業} - 基準企業の情報&#10;{比較企業1} - 比較企業1の情報&#10;{比較企業2} - 比較企業2の情報&#10;..."
            rows={12}
            autoResize
            error={contentError}
            required
            helperText={`${currentPrompt.content.length}文字 ${uniqueVariables.length > 0 ? `| 動的変数: ${uniqueVariables.length}個` : ''}`}
          />
        </div>
      </Card>

      {/* 動的変数ヘルプ */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">🔄 動的変数</h3>
          <Button
            variant="secondary"
            onClick={() => setShowVariableHelp(!showVariableHelp)}
            className="text-sm"
          >
            {showVariableHelp ? '非表示' : '使用方法を表示'}
          </Button>
        </div>

        {showVariableHelp && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">利用可能な動的変数</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div><code className="bg-blue-100 px-2 py-1 rounded">{'{基準企業}'}</code> - 基準企業の情報</div>
                <div><code className="bg-blue-100 px-2 py-1 rounded">{'{比較企業1}'}</code> - 比較企業1の情報</div>
                <div><code className="bg-blue-100 px-2 py-1 rounded">{'{比較企業2}'}</code> - 比較企業2の情報</div>
                <div><code className="bg-blue-100 px-2 py-1 rounded">{'{比較企業3}'}</code> - 比較企業3の情報</div>
                <div><code className="bg-blue-100 px-2 py-1 rounded">{'{比較企業4}'}</code> - 比較企業4の情報</div>
              </div>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-md">
              <h4 className="font-medium text-amber-900 mb-2">使用例</h4>
              <pre className="text-sm text-amber-800 whitespace-pre-wrap">
{`以下の企業を比較分析してください：

基準企業: {基準企業}

比較企業:
{比較企業1}
{比較企業2}

上記の企業について...`}
              </pre>
            </div>
          </div>
        )}

        {/* 検出された変数 */}
        {uniqueVariables.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 rounded-md">
            <h5 className="font-medium text-green-900 mb-2">プロンプト内で使用中の変数</h5>
            <div className="flex flex-wrap gap-2">
              {uniqueVariables.map((variable, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm font-mono"
                >
                  {variable}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* プレビュー */}
      {currentPrompt.content && (
        <Card title="👀 プロンプトプレビュー" subtitle="実際にLLMに送信される内容（変数は実行時に置換されます）">
          <div className="bg-gray-50 p-4 rounded-md border max-h-60 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {currentPrompt.content}
            </pre>
          </div>
        </Card>
      )}

      {/* 操作ボタン */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="text-sm text-gray-500">
          {isValid ? (
            <span className="text-green-600 flex items-center">
              ✅ プロンプト設定完了
            </span>
          ) : (
            <span>
              プロンプト名と内容を入力してください
            </span>
          )}
        </div>
        
        <div className="flex space-x-3">
          {onBack && (
            <Button
              variant="secondary"
              onClick={onBack}
            >
              ← 戻る：企業入力
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleExecute}
            disabled={!isValid}
          >
            🚀 分析実行 →
          </Button>
        </div>
      </div>

      {/* ヘルプ情報 */}
      <Card className="bg-gray-50 border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">💡 プロンプト作成のコツ</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>具体的な指示</strong>：「比較してください」より「以下の5つの観点で比較してください」</li>
          <li>• <strong>出力形式の指定</strong>：表形式、箇条書きなど希望する形式を指定</li>
          <li>• <strong>動的変数の活用</strong>：企業名や要約を自動で挿入できます</li>
          <li>• <strong>文脈の提供</strong>：分析の目的や背景を明記するとより良い結果が得られます</li>
        </ul>
      </Card>
    </div>
  );
};
