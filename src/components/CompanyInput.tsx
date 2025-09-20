import React from 'react';
import { Input } from '@/components/ui/Input';
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
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...company,
      name: e.target.value,
    });
  };

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      ...company,
      summary: e.target.value,
    });
  };

  // バリデーション
  const nameError = required && !company.name.trim() ? '企業名は必須です' : '';
  const summaryError = required && !company.summary.trim() ? 'IR要約は必須です' : '';

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
        {/* 企業名入力 */}
        <Input
          label={`企業名${required ? ' *' : ''}`}
          value={company.name}
          onChange={handleNameChange}
          placeholder="企業名を入力してください"
          error={nameError}
          required={required}
        />

        {/* IR要約入力 */}
        <Textarea
          label={`IR要約${required ? ' *' : ''}`}
          value={company.summary}
          onChange={handleSummaryChange}
          placeholder="IR関連資料の要約を入力してください&#10;例：&#10;- 売上高：○○億円（前年同期比+○%）&#10;- 営業利益：○○億円（前年同期比+○%）&#10;- 主要事業の状況..."
          rows={6}
          autoResize
          error={summaryError}
          required={required}
          helperText="決算資料、IR説明会資料、有価証券報告書などの要約を記載してください"
        />

        {/* 文字数カウンター */}
        <div className="flex justify-between text-sm text-gray-500">
          <span>
            {company.summary.length > 0 && `${company.summary.length}文字`}
          </span>
          <span>
            {company.summary.length > 1000 && (
              <span className="text-orange-600">
                長すぎる可能性があります（推奨：1000文字以下）
              </span>
            )}
          </span>
        </div>
      </div>
    </Card>
  );
};
