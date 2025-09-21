import { useState, useCallback } from 'react';
import { DEFAULT_PROMPTS } from '@/types';

interface CurrentPrompt {
  name: string;
  content: string;
}

export const usePrompts = () => {
  const [currentPrompt, setCurrentPrompt] = useState<CurrentPrompt>({
    name: '要約比較v1',
    content: `# 命令:
注力事業ついて、まとめてください。

# 制約条件:
・具体的な取り組みがあれば含める
・先進的な取り組み、独自の取り組みがあれば含める
・多様な側面から関連する取り組みを網羅する
・目標値や達成値を数字で表現している記載があれば含める

{summary_list}

# 要約指示
基準企業：{base_corp_name}
比較企業：{comparison_corp_names}

注力事業について、以下の観点のレポートを作成してください
1.基準企業と比較企業（少なくとも一社）とで共通する取り組み
2.基準企業と比較企業（少なくとも一社）で特徴的な差異を表す取り組み
3.基準企業を除いた比較企業間のみで共通する取り組み
4.全体のまとめ

# 制約条件:
・2000文字程度でまとめる
・記載内容には、実際の取り組み内容や見通しなどを含めて、具体性を持たせる
・各企業の各文末には参照元のページ数が記載されているので、要約の参照元を企業を表す英字：ページ数の形式で要約の末尾に付加する（例　A:12, B:10）`,
  });

  // 現在のプロンプトを更新
  const updateCurrentPrompt = useCallback((prompt: CurrentPrompt) => {
    setCurrentPrompt(prompt);
  }, []);

  // テンプレートを読み込み
  const loadTemplate = useCallback((templateId: string) => {
    const template = DEFAULT_PROMPTS.find(prompt => prompt.id === templateId);
    if (template) {
      setCurrentPrompt({
        name: template.name,
        content: template.content,
      });
    }
  }, []);

  // プロンプトをリセット
  const resetPrompt = useCallback(() => {
    setCurrentPrompt({
      name: '',
      content: '',
    });
  }, []);

  // プロンプトのバリデーション
  const validatePrompt = useCallback(() => {
    const errors: string[] = [];

    if (!currentPrompt.name.trim()) {
      errors.push('プロンプト名は必須です');
    }

    if (!currentPrompt.content.trim()) {
      errors.push('プロンプト内容は必須です');
    }

    // 内容が短すぎる場合の警告
    if (currentPrompt.content.trim().length < 20) {
      errors.push('プロンプト内容が短すぎます（20文字以上推奨）');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [currentPrompt]);

  // 動的変数の解析
  const analyzeDynamicVariables = useCallback(() => {
    const variables = currentPrompt.content.match(/\{[^}]+\}/g) || [];
    const uniqueVariables = [...new Set(variables)];
    
    // 有効な変数のリスト
    const validVariables = [
      // 従来形式
      '{baseCompany}',
      '{comparisonCompanies}',
      '{基準企業}',      // 後方互換性
      '{比較企業1}',     // 後方互換性
      '{比較企業2}',     // 後方互換性
      '{比較企業3}',     // 後方互換性
      '{比較企業4}',     // 後方互換性
      // 新形式（企業名・要約分離）
      '{base_corp_name}',
      '{base_corp_summary}',
      '{comp1_corp_name}',
      '{comp1_corp_summary}',
      '{comp2_corp_name}',
      '{comp2_corp_summary}',
      '{comp3_corp_name}',
      '{comp3_corp_summary}',
      '{comp4_corp_name}',
      '{comp4_corp_summary}',
      // 統合変数
      '{summary_list}',
      '{comparison_corp_names}',
    ];

    const validUsedVariables = uniqueVariables.filter(variable => 
      validVariables.includes(variable)
    );
    
    const invalidVariables = uniqueVariables.filter(variable => 
      !validVariables.includes(variable)
    );

    return {
      allVariables: uniqueVariables,
      validVariables: validUsedVariables,
      invalidVariables,
      hasVariables: uniqueVariables.length > 0,
    };
  }, [currentPrompt.content]);

  // プロンプトの統計情報
  const getPromptStats = useCallback(() => {
    const { allVariables } = analyzeDynamicVariables();
    
    return {
      characterCount: currentPrompt.content.length,
      wordCount: currentPrompt.content.trim().split(/\s+/).length,
      lineCount: currentPrompt.content.split('\n').length,
      variableCount: allVariables.length,
    };
  }, [currentPrompt.content, analyzeDynamicVariables]);

  // 企業データとの整合性チェック
  const validateVariablesWithCompanies = useCallback((companyCount: { base: boolean, comparison: number }) => {
    const { validVariables } = analyzeDynamicVariables();
    const warnings: string[] = [];
    const errors: string[] = [];

    validVariables.forEach(variable => {
      // 基準企業関連の変数チェック
      if ((variable === '{base_corp_name}' || variable === '{base_corp_summary}') && !companyCount.base) {
        warnings.push(`${variable}を使用していますが、基準企業が入力されていません`);
      }

      // 比較企業関連の変数チェック
      const compMatch = variable.match(/\{comp(\d+)_corp_(name|summary)\}/);
      if (compMatch) {
        const compIndex = parseInt(compMatch[1]);
        if (compIndex > companyCount.comparison) {
          errors.push(`${variable}を使用していますが、比較企業${compIndex}が入力されていません`);
        }
      }

      // 旧形式の比較企業チェック
      const oldCompMatch = variable.match(/\{比較企業(\d+)\}/);
      if (oldCompMatch) {
        const compIndex = parseInt(oldCompMatch[1]);
        if (compIndex > companyCount.comparison) {
          errors.push(`${variable}を使用していますが、比較企業${compIndex}が入力されていません`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
    };
  }, [analyzeDynamicVariables]);

  // プロンプトの動的展開プレビュー（変数は残す）
  const generateDynamicPreview = useCallback((companyCount: { base: boolean, comparison: number }) => {
    let previewContent = currentPrompt.content;

    // {summary_list}の展開
    if (previewContent.includes('{summary_list}')) {
      const summaryListItems: string[] = [];
      
      // 基準企業セクション
      if (companyCount.base) {
        summaryListItems.push('##\n{base_corp_name}\n{base_corp_summary}\n##');
      } else {
        summaryListItems.push('##\n（基準企業未入力）\n（基準企業要約未入力）\n##');
      }

      // 比較企業セクション
      for (let i = 1; i <= companyCount.comparison; i++) {
        summaryListItems.push(`##\n{comp${i}_corp_name}\n{comp${i}_corp_summary}\n##`);
      }

      const summaryListContent = summaryListItems.join('\n');
      previewContent = previewContent.replace(/{summary_list}/g, summaryListContent);
    }

    // {comparison_corp_names}の展開
    if (previewContent.includes('{comparison_corp_names}')) {
      const compNames: string[] = [];
      for (let i = 1; i <= companyCount.comparison; i++) {
        compNames.push(`{comp${i}_corp_name}`);
      }
      const compNamesContent = compNames.join(',');
      previewContent = previewContent.replace(/{comparison_corp_names}/g, compNamesContent);
    }

    return previewContent;
  }, [currentPrompt.content]);

  return {
    currentPrompt,
    updateCurrentPrompt,
    loadTemplate,
    resetPrompt,
    validatePrompt,
    analyzeDynamicVariables,
    getPromptStats,
    validateVariablesWithCompanies,
    generateDynamicPreview,
  };
};
