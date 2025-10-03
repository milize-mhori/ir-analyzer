import React from 'react';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Company, SummarySection } from '@/types';

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
  // 統合入力欄の変更処理（企業名と要約セクションを解析）
  const handleCombinedInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    const lines = inputValue.split('\n');
    
    // 一行目を企業名として扱う
    const name = lines[0] || '';
    const restContent = lines.slice(1).join('\n');
    
    // 新しい要約セクション形式を解析
    const summarySections = parseSummarySections(restContent);
    
    // 新しい形式が検出された場合は要約セクションを使用、そうでなければ従来形式
    if (summarySections.length > 0) {
      onUpdate({
        ...company,
        name: name.trim(),
        summary: restContent.trim(), // 後方互換性のため残す
        summarySections: summarySections,
      });
    } else {
      onUpdate({
        ...company,
        name: name.trim(),
        summary: restContent.trim(),
        summarySections: undefined,
      });
    }
  };

  // 要約セクションのパース関数
  const parseSummarySections = (content: string): SummarySection[] => {
    const sections: SummarySection[] = [];
    
    // ### Content of summary で始まるセクションを検索
    const sectionPattern = /### Content of summary \d+[\s\S]*?(?=### Content of summary \d+|$)/g;
    const matches = content.match(sectionPattern);
    
    if (!matches) return [];
    
    matches.forEach((match, index) => {
      // [important_point] と [text] を抽出
      const importantPointMatch = match.match(/\[important_point\]\s*(.+)/);
      const textMatch = match.match(/\[text\]\s*([\s\S]*?)(?=\[|$)/);
      
      if (importantPointMatch && textMatch) {
        sections.push({
          id: `section-${index + 1}`,
          importantPoint: importantPointMatch[1].trim(),
          text: textMatch[1].trim(),
        });
      }
    });
    
    return sections;
  };

  // 統合入力欄の値を生成（表示用）
  const getCombinedInputValue = () => {
    if (company.name) {
      if (company.summarySections && company.summarySections.length > 0) {
        // 新しい要約セクション形式
        const sectionsText = company.summarySections.map((section, index) => {
          return `### Content of summary ${index + 1}\n[important_point] ${section.importantPoint}\n[text]\n${section.text}`;
        }).join('\n\n');
        return `${company.name}\n${sectionsText}`;
      } else if (company.summary) {
        // 従来形式
        return `${company.name}\n${company.summary}`;
      } else {
        return company.name;
      }
    } else if (company.summary) {
      return `\n${company.summary}`;
    }
    return '';
  };

  // バリデーション
  const nameError = required && !company.name.trim() ? '企業名（一行目）は必須です' : '';
  const hasSummaryContent = (company.summarySections?.length ?? 0) > 0 || company.summary?.trim();
  const summaryError = required && !hasSummaryContent ? 'IR要約（二行目以降）は必須です' : '';
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
          placeholder="1行目：企業名を入力してください&#10;2行目以降：IR関連資料の要約を入力してください&#10;&#10;■新形式（推奨）&#10;丸紅&#10;### Content of summary 1&#10;[important_point] 経営成績&#10;[text]&#10;- 2024年3月期の連結経営成績は、収益が7,250,515百万円で前期比21.1%減少し、営業利益は276,321百万円で18.9%減少した。&#10;&#10;### Content of summary 2&#10;[important_point] 財政状態&#10;[text]&#10;- 2024年3月31日現在の連結財政状態では、資産合計が8,923,597百万円...&#10;&#10;■従来形式&#10;株式会社○○&#10;- 売上高：○○億円（前年同期比+○%）&#10;- 営業利益：○○億円（前年同期比+○%）"
          rows={8}
          autoResize
          error={combinedError}
          required={required}
          helperText="1行目に企業名、2行目以降にIR要約を記載してください。決算資料、IR説明会資料、有価証券報告書などの要約を含めてください。"
        />

        {/* 解析結果表示 */}
        {(company.name || hasSummaryContent) && (
          <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
            <h5 className="font-medium text-blue-900 mb-2">📊 解析結果</h5>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-blue-800">企業名：</span>
                <span className="text-blue-700">{company.name || '（未入力）'}</span>
              </div>
              
              {company.summarySections && company.summarySections.length > 0 ? (
                <div>
                  <span className="font-medium text-blue-800">IR要約：</span>
                  <span className="text-blue-700">新形式 - {company.summarySections.length}セクション</span>
                  <div className="mt-2 space-y-1">
                    {company.summarySections.map((section, index) => (
                      <div key={section.id} className="text-xs text-blue-600 pl-4">
                        {index + 1}. {section.importantPoint} ({section.text.length}文字)
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <span className="font-medium text-blue-800">IR要約：</span>
                  <span className="text-blue-700">
                    {company.summary ? `従来形式 - ${company.summary.length}文字` : '（未入力）'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 文字数カウンター */}
        <div className="flex justify-between text-sm text-gray-500">
          <span>
            {company.summarySections && company.summarySections.length > 0 ? (
              <>
                IR要約：{company.summarySections.reduce((total, section) => total + section.text.length, 0)}文字
                （{company.summarySections.length}セクション）
              </>
            ) : (
              company.summary && `IR要約：${company.summary.length}文字`
            )}
          </span>
          <span>
            {(() => {
              const totalLength = company.summarySections && company.summarySections.length > 0
                ? company.summarySections.reduce((total, section) => total + section.text.length, 0)
                : company.summary?.length || 0;
              
              return totalLength > 1000 && (
                <span className="text-orange-600">
                  IR要約が長すぎる可能性があります（推奨：1000文字以下）
                </span>
              );
            })()}
          </span>
        </div>
      </div>
    </Card>
  );
};
