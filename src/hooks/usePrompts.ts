import { useState, useCallback } from 'react';
import { DEFAULT_PROMPTS } from '@/types';

interface CurrentPrompt {
  name: string;
  content: string;
}

export const usePrompts = () => {
  const [currentPrompt, setCurrentPrompt] = useState<CurrentPrompt>({
    name: '',
    content: '',
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
      '{baseCompany}',
      '{comparisonCompanies}',
      '{基準企業}',      // 後方互換性
      '{比較企業1}',     // 後方互換性
      '{比較企業2}',     // 後方互換性
      '{比較企業3}',     // 後方互換性
      '{比較企業4}',     // 後方互換性
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

  return {
    currentPrompt,
    updateCurrentPrompt,
    loadTemplate,
    resetPrompt,
    validatePrompt,
    analyzeDynamicVariables,
    getPromptStats,
  };
};
