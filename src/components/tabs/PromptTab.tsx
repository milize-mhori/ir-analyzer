import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Company } from '@/types';
import { usePrompts } from '@/hooks/usePrompts';
import { useCompanies } from '@/hooks/useCompanies';

interface PromptTabProps {
  onExecute?: (prompt: { name: string; content: string }) => void;
  onBack?: () => void;
  companiesHook?: ReturnType<typeof useCompanies>;
}

export const PromptTab: React.FC<PromptTabProps> = ({ onExecute, onBack, companiesHook }) => {
  const { 
    currentPrompt, 
    availablePrompts,
    isLoading,
    updateCurrentPrompt, 
    loadTemplate,
    loadAvailablePrompts,
    validateVariablesWithCompanies,
    generateDynamicPreview,
    generateFinalPreview
  } = usePrompts();
  const [showVariableHelp, setShowVariableHelp] = useState(false);
  const [showVariableMapping, setShowVariableMapping] = useState(false);

  // 企業データの取得
  const companies = companiesHook?.companies || { baseCompany: { id: '', name: '', summary: '', type: 'base' as const }, comparisonCompanies: [] };
  const companyCount = {
    base: !!(companies.baseCompany?.name?.trim() && companies.baseCompany?.summary?.trim()),
    comparison: companies.comparisonCompanies?.filter((c: Company) => c.name?.trim() && c.summary?.trim()).length || 0,
  };

  // 変数の整合性チェック
  const variableValidation = validateVariablesWithCompanies(companyCount);

  // 動的展開プレビュー
  const dynamicPreview = generateDynamicPreview(companyCount);
  
  // 最終プレビュー（変数置換後）
  const finalPreview = generateFinalPreview(companies);

  // テンプレート選択肢
  const templateOptions = [
    { value: '', label: 'カスタムプロンプト' },
    ...availablePrompts.map(prompt => ({
      value: prompt.id,
      label: prompt.name,
    })),
  ];

  // 現在選択されているテンプレートの値を取得
  const getSelectedTemplateValue = () => {
    const selectedPrompt = availablePrompts.find(prompt => 
      prompt.name === currentPrompt.name && prompt.content === currentPrompt.content
    );
    return selectedPrompt ? selectedPrompt.id : '';
  };

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
        <div className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Select
                label="テンプレート選択"
                options={templateOptions}
                value={getSelectedTemplateValue()}
                onChange={handleTemplateChange}
                placeholder="プロンプトテンプレートを選択"
                helperText="テンプレートを選択すると自動でプロンプト内容が入力されます"
                disabled={isLoading}
              />
            </div>
            <Button
              variant="secondary"
              onClick={loadAvailablePrompts}
              disabled={isLoading}
              className="text-sm"
            >
              {isLoading ? '読み込み中...' : '🔄 再読み込み'}
            </Button>
          </div>
          
          {isLoading && (
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              プロンプトファイルを読み込み中...
            </div>
          )}
          
          {!isLoading && availablePrompts.length > 0 && (
            <div className="text-sm text-green-600">
              ✅ {availablePrompts.length}個のプロンプトファイルが読み込まれました
            </div>
          )}
          
          {!isLoading && availablePrompts.length === 0 && (
            <div className="text-sm text-amber-600">
              ⚠️ プロンプトファイルが見つかりません。prompts/templates/フォルダにMarkdownファイルを追加してください。
            </div>
          )}
        </div>
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
            placeholder="LLMに送信するプロンプトを入力してください&#10;&#10;動的変数を使用できます：&#10;{baseCompany} - 基準企業の情報&#10;{comparisonCompanies} - 比較企業の情報（一括）&#10;{比較企業1} - 比較企業1の情報（個別）&#10;..."
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
              <div className="space-y-3">
                <div>
                  <h5 className="font-medium text-purple-800 mb-1">🚀 統合変数（推奨）</h5>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div><code className="bg-purple-100 px-2 py-1 rounded">{'{summary_list}'}</code> - 企業リスト（入力数に応じて動的展開）</div>
                    <div><code className="bg-purple-100 px-2 py-1 rounded">{'{comparison_corp_names}'}</code> - 比較企業名一覧（カンマ区切り）</div>
                  </div>
                  <div className="mt-2 text-xs text-purple-700">
                    💡 <strong>推奨</strong>：{'{summary_list}'}を使用すると入力企業数に応じて自動的に展開されます
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-green-800 mb-1">🔗 個別変数</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><code className="bg-green-100 px-2 py-1 rounded">{'{base_corp_name}'}</code> - 基準企業名</div>
                    <div><code className="bg-green-100 px-2 py-1 rounded">{'{base_corp_summary}'}</code> - 基準企業要約</div>
                    <div><code className="bg-green-100 px-2 py-1 rounded">{'{comp1_corp_name}'}</code> - 比較企業1名</div>
                    <div><code className="bg-green-100 px-2 py-1 rounded">{'{comp1_corp_summary}'}</code> - 比較企業1要約</div>
                    <div><code className="bg-green-100 px-2 py-1 rounded">{'{comp2_corp_name}'}</code> - 比較企業2名</div>
                    <div><code className="bg-green-100 px-2 py-1 rounded">{'{comp2_corp_summary}'}</code> - 比較企業2要約</div>
                    <div><code className="bg-green-100 px-2 py-1 rounded">{'{comp3_corp_name}'}</code> - 比較企業3名</div>
                    <div><code className="bg-green-100 px-2 py-1 rounded">{'{comp3_corp_summary}'}</code> - 比較企業3要約</div>
                    <div><code className="bg-green-100 px-2 py-1 rounded">{'{comp4_corp_name}'}</code> - 比較企業4名</div>
                    <div><code className="bg-green-100 px-2 py-1 rounded">{'{comp4_corp_summary}'}</code> - 比較企業4要約</div>
                  </div>
                  <div className="mt-2 text-xs text-green-700">
                    個別に企業名や要約を制御したい場合に使用
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-md">
              <h4 className="font-medium text-amber-900 mb-2">📝 プロンプト例（統合変数使用）</h4>
              <pre className="text-sm text-amber-800 whitespace-pre-wrap">
{`# 命令:
以下の企業について比較分析してください。

{summary_list}

# 分析指示
基準企業：{base_corp_name}
比較企業：{comparison_corp_names}

財務指標と事業戦略の観点で分析してください。`}
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

      {/* 変数マッピング表示 */}
      {uniqueVariables.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">🔗 変数マッピング</h3>
            <Button
              variant="secondary"
              onClick={() => setShowVariableMapping(!showVariableMapping)}
              className="text-sm"
            >
              {showVariableMapping ? '非表示' : '現在の企業データとの対応を表示'}
            </Button>
          </div>

          {showVariableMapping && (
            <div className="space-y-4">
              {/* 整合性チェック結果 */}
              {(!variableValidation.isValid || variableValidation.warnings.length > 0) && (
                <div className="space-y-2">
                  {variableValidation.errors.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <h5 className="font-medium text-red-900 mb-1">❌ エラー</h5>
                      <ul className="text-sm text-red-700 space-y-1">
                        {variableValidation.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {variableValidation.warnings.length > 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <h5 className="font-medium text-yellow-900 mb-1">⚠️ 警告</h5>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {variableValidation.warnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* 変数と実際のデータの対応表 */}
              <div className="space-y-3">
                <h5 className="font-medium text-gray-800">変数の置換結果プレビュー</h5>
                <div className="grid gap-3">
                  {/* 基準企業関連 */}
                  {uniqueVariables.some(v => v.includes('base_corp') || v === '{baseCompany}' || v === '{基準企業}') && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <h6 className="font-medium text-blue-900 mb-2">📊 基準企業</h6>
                      <div className="space-y-2 text-sm">
                        {uniqueVariables.includes('{base_corp_name}') && (
                          <div className="flex items-start gap-3">
                            <code className="bg-blue-100 px-2 py-1 rounded text-xs">{'{base_corp_name}'}</code>
                            <span className="text-blue-800">→ {companies.baseCompany?.name || '（未入力）'}</span>
                          </div>
                        )}
                        {uniqueVariables.includes('{base_corp_summary}') && (
                          <div className="flex items-start gap-3">
                            <code className="bg-blue-100 px-2 py-1 rounded text-xs">{'{base_corp_summary}'}</code>
                            <span className="text-blue-800">→ {companies.baseCompany?.summary ? `${companies.baseCompany.summary.substring(0, 50)}...` : '（未入力）'}</span>
                          </div>
                        )}
                        {uniqueVariables.includes('{baseCompany}') && (
                          <div className="flex items-start gap-3">
                            <code className="bg-blue-100 px-2 py-1 rounded text-xs">{'{baseCompany}'}</code>
                            <span className="text-blue-800">→ A:{companies.baseCompany?.name || '（未入力）'}<br/>   {companies.baseCompany?.summary ? `${companies.baseCompany.summary.substring(0, 50)}...` : '（未入力）'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 比較企業関連 */}
                  {companies.comparisonCompanies?.map((company: Company, index: number) => {
                    const compNum = index + 1;
                    const relevantVars = uniqueVariables.filter(v => 
                      v.includes(`comp${compNum}_corp`) || v === `{比較企業${compNum}}`
                    );
                    
                    if (relevantVars.length === 0) return null;

                    return (
                      <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <h6 className="font-medium text-green-900 mb-2">🔍 比較企業{compNum}</h6>
                        <div className="space-y-2 text-sm">
                          {uniqueVariables.includes(`{comp${compNum}_corp_name}`) && (
                            <div className="flex items-start gap-3">
                              <code className="bg-green-100 px-2 py-1 rounded text-xs">{`{comp${compNum}_corp_name}`}</code>
                              <span className="text-green-800">→ {company?.name || '（未入力）'}</span>
                            </div>
                          )}
                          {uniqueVariables.includes(`{comp${compNum}_corp_summary}`) && (
                            <div className="flex items-start gap-3">
                              <code className="bg-green-100 px-2 py-1 rounded text-xs">{`{comp${compNum}_corp_summary}`}</code>
                              <span className="text-green-800">→ {company?.summary ? `${company.summary.substring(0, 50)}...` : '（未入力）'}</span>
                            </div>
                          )}
                          {uniqueVariables.includes(`{比較企業${compNum}}`) && (
                            <div className="flex items-start gap-3">
                              <code className="bg-green-100 px-2 py-1 rounded text-xs">{`{比較企業${compNum}}`}</code>
                              <span className="text-green-800">→ {String.fromCharCode(65 + compNum)}:{company?.name || '（未入力）'}<br/>   {company?.summary ? `${company.summary.substring(0, 50)}...` : '（未入力）'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* プレビュー */}
      {currentPrompt.content && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">👀 プロンプトプレビュー</h3>
              <p className="text-sm text-gray-600">実際の企業データで変数置換後のプロンプトと、段階的な展開過程</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* 最終プレビュー（変数置換後） */}
            {finalPreview !== currentPrompt.content && (
              <div>
                <h4 className="font-medium text-green-900 mb-2">✅ 最終プレビュー（変数置換後）</h4>
                <div className="bg-green-50 p-4 rounded-md border max-h-80 overflow-y-auto">
                  <pre className="text-sm text-green-800 whitespace-pre-wrap font-mono">
                    {finalPreview}
                  </pre>
                </div>
                <div className="mt-2 text-xs text-green-600">
                  🚀 この内容がLLMに送信されます（実際の企業データで変数が置換済み）
                </div>
              </div>
            )}

            {/* 動的展開プレビュー */}
            {dynamicPreview !== currentPrompt.content && (
              <>
                <div className="border-t pt-4">
                  <h4 className="font-medium text-purple-900 mb-2">🚀 動的展開後（変数置換前）</h4>
                  <div className="bg-purple-50 p-4 rounded-md border max-h-60 overflow-y-auto">
                    <pre className="text-sm text-purple-800 whitespace-pre-wrap font-mono">
                      {dynamicPreview}
                    </pre>
                  </div>
                  <div className="mt-2 text-xs text-purple-600">
                    💡 {'{summary_list}'}や{'{comparison_corp_names}'}が入力された企業数に応じて展開されています
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-700 mb-2">📝 元のテンプレート</h4>
                  <div className="bg-gray-50 p-4 rounded-md border max-h-40 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {currentPrompt.content}
                    </pre>
                  </div>
                </div>
              </>
            )}

            {/* 通常のプレビュー（動的展開が無い場合） */}
            {dynamicPreview === currentPrompt.content && finalPreview === currentPrompt.content && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">📝 プロンプト内容（変数は実行時に置換されます）</h4>
                <div className="bg-gray-50 p-4 rounded-md border max-h-60 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                    {currentPrompt.content}
                  </pre>
                </div>
              </div>
            )}

            {/* 変数が置換されたが動的展開はない場合 */}
            {dynamicPreview === currentPrompt.content && finalPreview !== currentPrompt.content && (
              <>
                <div>
                  <h4 className="font-medium text-green-900 mb-2">✅ 最終プレビュー（変数置換後）</h4>
                  <div className="bg-green-50 p-4 rounded-md border max-h-80 overflow-y-auto">
                    <pre className="text-sm text-green-800 whitespace-pre-wrap font-mono">
                      {finalPreview}
                    </pre>
                  </div>
                  <div className="mt-2 text-xs text-green-600">
                    🚀 この内容がLLMに送信されます（実際の企業データで変数が置換済み）
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-700 mb-2">📝 元のテンプレート</h4>
                  <div className="bg-gray-50 p-4 rounded-md border max-h-40 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {currentPrompt.content}
                    </pre>
                  </div>
                </div>
              </>
            )}
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
        <h4 className="font-medium text-gray-900 mb-2">💡 プロンプト管理のコツ</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>ファイル管理</strong>：<code>prompts/templates/</code>フォルダにMarkdownファイルを追加すると自動で読み込まれます</li>
          <li>• <strong>統合変数を活用</strong>：{'{summary_list}'}を使用すると入力企業数に自動対応</li>
          <li>• <strong>具体的な指示</strong>：「比較してください」より「以下の5つの観点で比較してください」</li>
          <li>• <strong>出力形式の指定</strong>：表形式、箇条書きなど希望する形式を指定</li>
          <li>• <strong>文脈の提供</strong>：分析の目的や背景を明記するとより良い結果が得られます</li>
        </ul>
        <div className="mt-3 p-3 bg-blue-50 rounded-md">
          <h5 className="font-medium text-blue-900 mb-1">📁 新しいプロンプトファイルの作成方法</h5>
          <div className="text-xs text-blue-800">
            1. <code>prompts/templates/</code>フォルダに<code>.md</code>ファイルを作成<br/>
            2. Front matterでメタデータを定義（id、name、description等）<br/>
            3. プロンプト内容をMarkdown形式で記述<br/>
            4. 「🔄 再読み込み」ボタンで新しいファイルを読み込み
          </div>
        </div>
      </Card>
    </div>
  );
};
