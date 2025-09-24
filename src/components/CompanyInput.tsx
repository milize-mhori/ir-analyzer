import React from 'react';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Company } from '@/types';

interface CompanyInputProps {
  company: Company;
  onUpdate: (company: Company) => void;
  onDelete?: () => void;
  showDelete?: boolean;
  title?: string;
  required?: boolean;
}

export const CompanyInput: React.FC<CompanyInputProps> = ({
  company,
  onUpdate,
  onDelete,
  showDelete = false,
  title,
  required = false,
}) => {
  // 統合入力欄の変更処理（一行目を企業名、二行目以降を要約として解析）
  const handleCombinedInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    const lines = inputValue.split('\n');
    
    // 一行目を企業名、二行目以降を要約として扱う
    const name = lines[0] || '';
    const summary = lines.slice(1).join('\n');
    
    onUpdate({
      ...company,
      name: name.trim(),
      summary: summary.trim(),
    });
  };

  // 統合入力欄の値を生成（表示用）
  const getCombinedInputValue = () => {
    if (company.name && company.summary) {
      return `${company.name}\n${company.summary}`;
    } else if (company.name) {
      return company.name;
    } else if (company.summary) {
      return `\n${company.summary}`;
    }
    return '';
  };

  // バリデーション
  const nameError = required && !company.name.trim() ? '企業名（一行目）は必須です' : '';
  const summaryError = required && !company.summary.trim() ? 'IR要約（二行目以降）は必須です' : '';
  const combinedError = nameError || summaryError;

  return (
    <Card 
      title={title}
      className="relative"
    >
      {/* 削除ボタン（比較企業のみ） */}
      {showDelete && onDelete && (
        <Button
          variant="secondary"
          onClick={onDelete}
          className="absolute top-4 right-4 px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200"
        >
          ✕ 削除
        </Button>
      )}

      <div className="space-y-4">
        {/* 統合入力欄（企業名 + IR要約） */}
        <Textarea
          label={`企業情報${required ? ' *' : ''}`}
          value={getCombinedInputValue()}
          onChange={handleCombinedInputChange}
          placeholder="1行目：企業名を入力してください&#10;2行目以降：IR関連資料の要約を入力してください&#10;&#10;例：&#10;株式会社○○&#10;- 売上高：○○億円（前年同期比+○%）&#10;- 営業利益：○○億円（前年同期比+○%）&#10;- 主要事業の状況..."
          rows={8}
          autoResize
          error={combinedError}
          required={required}
          helperText="1行目に企業名、2行目以降にIR要約を記載してください。決算資料、IR説明会資料、有価証券報告書などの要約を含めてください。"
        />

        {/* 解析結果表示 */}
        {(company.name || company.summary) && (
          <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
            <h5 className="font-medium text-blue-900 mb-2">📊 解析結果</h5>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-blue-800">企業名：</span>
                <span className="text-blue-700">{company.name || '（未入力）'}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">IR要約：</span>
                <span className="text-blue-700">
                  {company.summary ? `${company.summary.length}文字` : '（未入力）'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 文字数カウンター */}
        <div className="flex justify-between text-sm text-gray-500">
          <span>
            {company.summary && `IR要約：${company.summary.length}文字`}
          </span>
          <span>
            {company.summary && company.summary.length > 1000 && (
              <span className="text-orange-600">
                IR要約が長すぎる可能性があります（推奨：1000文字以下）
              </span>
            )}
          </span>
        </div>
      </div>
    </Card>
  );
};
