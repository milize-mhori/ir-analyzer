import { useState, useCallback } from 'react';
import { Company, CompanyList } from '@/types';

// 初期の空企業データ生成
const createEmptyCompany = (type: 'base' | 'comparison', index?: number): Company => ({
  id: `${type}-${Date.now()}-${index || 0}`,
  name: '',
  summary: '',
  type,
});

const createEmptyCompanyList = (): CompanyList => ({
  baseCompany: createEmptyCompany('base'),
  comparisonCompanies: [createEmptyCompany('comparison', 1)],
});

export const useCompanies = () => {
  const [companies, setCompanies] = useState<CompanyList>(createEmptyCompanyList());

  // 基準企業の更新
  const updateBaseCompany = useCallback((company: Company) => {
    setCompanies(prev => ({
      ...prev,
      baseCompany: company,
    }));
  }, []);

  // 比較企業の更新
  const updateComparisonCompany = useCallback((index: number, company: Company) => {
    setCompanies(prev => ({
      ...prev,
      comparisonCompanies: prev.comparisonCompanies.map((c, i) => 
        i === index ? company : c
      ),
    }));
  }, []);

  // 比較企業の追加
  const addComparisonCompany = useCallback(() => {
    setCompanies(prev => {
      if (prev.comparisonCompanies.length >= 4) {
        return prev; // 最大4社制限
      }
      
      const newCompany = createEmptyCompany('comparison', prev.comparisonCompanies.length + 1);
      return {
        ...prev,
        comparisonCompanies: [...prev.comparisonCompanies, newCompany],
      };
    });
  }, []);

  // 比較企業の削除
  const removeComparisonCompany = useCallback((index: number) => {
    setCompanies(prev => ({
      ...prev,
      comparisonCompanies: prev.comparisonCompanies.filter((_, i) => i !== index),
    }));
  }, []);

  // バリデーション
  const validateCompanies = useCallback(() => {
    const errors: string[] = [];

    // 基準企業のバリデーション
    if (!companies.baseCompany.name.trim()) {
      errors.push('基準企業の企業名（1行目）は必須です');
    }
    if (!companies.baseCompany.summary.trim()) {
      errors.push('基準企業のIR要約（2行目以降）は必須です');
    }

    // 比較企業のバリデーション
    companies.comparisonCompanies.forEach((company, index) => {
      if (!company.name.trim()) {
        errors.push(`比較企業${index + 1}の企業名（1行目）は必須です`);
      }
      if (!company.summary.trim()) {
        errors.push(`比較企業${index + 1}のIR要約（2行目以降）は必須です`);
      }
    });

    // 最小企業数チェック
    if (companies.comparisonCompanies.length === 0) {
      errors.push('比較企業を少なくとも1社入力してください');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [companies]);

  // 入力状況の確認
  const getInputStatus = useCallback(() => {
    const baseCompanyFilled = !!(companies.baseCompany.name.trim() && companies.baseCompany.summary.trim());
    const comparisonCompaniesFilled = companies.comparisonCompanies.filter(
      company => company.name.trim() && company.summary.trim()
    ).length;

    return {
      baseCompanyFilled,
      comparisonCompaniesFilled,
      totalCompaniesFilled: baseCompanyFilled ? comparisonCompaniesFilled + 1 : comparisonCompaniesFilled,
      canAddMore: companies.comparisonCompanies.length < 4,
      canRemove: companies.comparisonCompanies.length > 1,
    };
  }, [companies]);

  // データをリセット
  const resetCompanies = useCallback(() => {
    setCompanies(createEmptyCompanyList());
  }, []);

  return {
    companies,
    updateBaseCompany,
    updateComparisonCompany,
    addComparisonCompany,
    removeComparisonCompany,
    validateCompanies,
    getInputStatus,
    resetCompanies,
  };
};
