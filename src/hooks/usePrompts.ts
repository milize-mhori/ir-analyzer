import { useState, useCallback, useEffect } from 'react';
import { Prompt, Company, CompanyList } from '@/types';

interface CurrentPrompt {
  name: string;
  content: string;
}

export const usePrompts = () => {
  const [availablePrompts, setAvailablePrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPrompt, setCurrentPrompt] = useState<CurrentPrompt>({
    name: '',
    content: '',
  });

  // 現在のプロンプトを更新
  const updateCurrentPrompt = useCallback((prompt: CurrentPrompt) => {
    setCurrentPrompt(prompt);
  }, []);

  // プロンプト一覧を読み込み
  const loadAvailablePrompts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/prompts');
      if (response.ok) {
        const prompts = await response.json();
        setAvailablePrompts(prompts);
        
        // デフォルトで最初のプロンプトを選択（有価証券報告書v1があれば優先）
        const defaultPrompt = prompts.find((p: Prompt) => p.id === 'securities-report-v1') || prompts[0];
        if (defaultPrompt) {
          setCurrentPrompt({
            name: defaultPrompt.name,
            content: defaultPrompt.content,
          });
        }
      } else {
        console.error('Failed to load prompts');
      }
    } catch (error) {
      console.error('Error loading prompts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // コンポーネントマウント時にプロンプト一覧を読み込み
  useEffect(() => {
    loadAvailablePrompts();
  }, [loadAvailablePrompts]);

  // テンプレートを読み込み
  const loadTemplate = useCallback((templateId: string) => {
    const template = availablePrompts.find(prompt => prompt.id === templateId);
    if (template) {
      setCurrentPrompt({
        name: template.name,
        content: template.content,
      });
    }
  }, [availablePrompts]);

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

  // 最終的な変数置換プレビュー（実際の企業データで置換）
  const generateFinalPreview = useCallback((companies: CompanyList) => {
    if (!companies) return currentPrompt.content;

    let replacedPrompt = currentPrompt.content;
    const baseCompany = companies.baseCompany || { name: '', summary: '' };
    const comparisonCompanies = companies.comparisonCompanies || [];

    // summary_listの動的生成
    const generateSummaryList = () => {
      const summaryItems: string[] = [];

      // 基準企業を追加
      if (baseCompany.name) {
        if (baseCompany.summarySections && baseCompany.summarySections.length > 0) {
          // 新しい要約セクション形式
          summaryItems.push(`##\nA:${baseCompany.name}`);
          baseCompany.summarySections.forEach((section, sectionIndex) => {
            summaryItems.push(`### Content of summary A:${sectionIndex + 1}`);
            summaryItems.push(`[important_point] ${section.importantPoint}`);
            summaryItems.push(`[text]`);
            summaryItems.push(section.text);
          });
          summaryItems.push(`##`);
        } else if (baseCompany.summary) {
          // 従来の要約形式（後方互換性）
          summaryItems.push(`##\nA:${baseCompany.name}\n${baseCompany.summary}\n##`);
        }
      }

      // 比較企業を追加
      comparisonCompanies.forEach((company: Company, index: number) => {
        if (company.name) {
          const companyLetter = String.fromCharCode(66 + index);
          if (company.summarySections && company.summarySections.length > 0) {
            // 新しい要約セクション形式
            summaryItems.push(`##\n${companyLetter}:${company.name}`);
            company.summarySections.forEach((section, sectionIndex) => {
              summaryItems.push(`### Content of summary ${companyLetter}:${sectionIndex + 1}`);
              summaryItems.push(`[important_point] ${section.importantPoint}`);
              summaryItems.push(`[text]`);
              summaryItems.push(section.text);
            });
            summaryItems.push(`##`);
          } else if (company.summary) {
            // 従来の要約形式（後方互換性）
            summaryItems.push(`##\n${companyLetter}:${company.name}\n${company.summary}\n##`);
          }
        }
      });

      return summaryItems.join('\n');
    };

    // 基準企業の置換（新形式）
    replacedPrompt = replacedPrompt.replace(
      /{baseCompany}/g,
      baseCompany.name && baseCompany.summary ? `A:${baseCompany.name}\n${baseCompany.summary}` : '（基準企業未入力）'
    );

    // 比較企業の置換（一括・新形式）
    const comparisonCompaniesInfo = comparisonCompanies
      .filter((company: Company) => company.name && company.summary)
      .map((company: Company, index: number) => `${String.fromCharCode(66 + index)}:${company.name}\n${company.summary}`)
      .join('\n\n');
    
    replacedPrompt = replacedPrompt.replace(
      /{comparisonCompanies}/g,
      comparisonCompaniesInfo || '（比較企業未入力）'
    );

    // 基準企業の置換（旧形式・後方互換性）
    replacedPrompt = replacedPrompt.replace(
      /{基準企業}/g,
      baseCompany.name && baseCompany.summary ? `A:${baseCompany.name}\n${baseCompany.summary}` : '（基準企業未入力）'
    );

    // 比較企業の置換（個別・旧形式・後方互換性）
    comparisonCompanies.forEach((company: Company, index: number) => {
      const placeholder = `{比較企業${index + 1}}`;
      const replacement = company.name && company.summary ? 
        `${String.fromCharCode(66 + index)}:${company.name}\n${company.summary}` : 
        `（比較企業${index + 1}未入力）`;
      replacedPrompt = replacedPrompt.replace(new RegExp(placeholder, 'g'), replacement);
    });

    // 空の比較企業プレースホルダーを削除
    for (let i = comparisonCompanies.length + 1; i <= 4; i++) {
      replacedPrompt = replacedPrompt.replace(new RegExp(`{比較企業${i}}`, 'g'), '');
    }

    // 新しい変数形式の置換（企業名のみ）
    replacedPrompt = replacedPrompt.replace(/{base_corp_name}/g, baseCompany.name ? `A:${baseCompany.name}` : '（基準企業名未入力）');
    
    // 新しい変数形式の置換（基準企業要約）
    replacedPrompt = replacedPrompt.replace(/{base_corp_summary}/g, baseCompany.summary || '（基準企業要約未入力）');

    // 新しい変数形式の置換（比較企業名・要約）
    comparisonCompanies.forEach((company: Company, index: number) => {
      const namePattern = new RegExp(`{comp${index + 1}_corp_name}`, 'g');
      const summaryPattern = new RegExp(`{comp${index + 1}_corp_summary}`, 'g');
      
      replacedPrompt = replacedPrompt.replace(namePattern, company.name ? `${String.fromCharCode(66 + index)}:${company.name}` : `（比較企業${index + 1}名未入力）`);
      replacedPrompt = replacedPrompt.replace(summaryPattern, company.summary || `（比較企業${index + 1}要約未入力）`);
    });

    // 空の比較企業プレースホルダーを削除（新形式）
    for (let i = comparisonCompanies.length + 1; i <= 4; i++) {
      replacedPrompt = replacedPrompt.replace(new RegExp(`{comp${i}_corp_name}`, 'g'), '');
      replacedPrompt = replacedPrompt.replace(new RegExp(`{comp${i}_corp_summary}`, 'g'), '');
    }

    // 統合変数の置換（summary_list）
    const summaryListContent = generateSummaryList();
    replacedPrompt = replacedPrompt.replace(/{summary_list}/g, summaryListContent);

    // 比較企業名一覧の置換
    const comparisonCorpNames = comparisonCompanies
      .filter((company: Company) => company.name)
      .map((company: Company, index: number) => `${String.fromCharCode(66 + index)}:${company.name}`)
      .join(',');
    replacedPrompt = replacedPrompt.replace(/{comparison_corp_names}/g, comparisonCorpNames || '（比較企業名未入力）');

    return replacedPrompt;
  }, [currentPrompt.content]);

  return {
    currentPrompt,
    availablePrompts,
    isLoading,
    updateCurrentPrompt,
    loadTemplate,
    loadAvailablePrompts,
    resetPrompt,
    validatePrompt,
    analyzeDynamicVariables,
    getPromptStats,
    validateVariablesWithCompanies,
    generateDynamicPreview,
    generateFinalPreview,
  };
};
