import { useState } from 'react';
import { TabType } from '@/types';

export const useTabState = (initialTab: TabType = 'summary') => {
  const [currentTab, setCurrentTab] = useState<TabType>(initialTab);

  const switchTab = (tab: TabType) => {
    setCurrentTab(tab);
  };

  const canNavigateToTab = (tab: TabType): boolean => {
    // Phase 1では基本的なナビゲーション制限
    // 将来的にはデータの有無に基づいた制限を追加
    return true;
  };

  const getTabStatus = (tab: TabType): 'completed' | 'current' | 'upcoming' => {
    if (tab === currentTab) return 'current';
    
    // 簡易的な進捗判定（将来的にはデータ状態に基づいて判定）
    const tabOrder: TabType[] = ['summary', 'prompt', 'result'];
    const currentIndex = tabOrder.indexOf(currentTab);
    const targetIndex = tabOrder.indexOf(tab);
    
    if (targetIndex < currentIndex) return 'completed';
    return 'upcoming';
  };

  return {
    currentTab,
    switchTab,
    canNavigateToTab,
    getTabStatus,
  };
};
