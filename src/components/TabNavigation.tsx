import React from 'react';
import { TabType } from '@/types';

interface TabNavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  canNavigateToTab?: (tab: TabType) => boolean;
  getTabStatus?: (tab: TabType) => 'completed' | 'current' | 'upcoming';
}

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const tabConfigs: TabConfig[] = [
  {
    id: 'summary',
    label: '要約入力',
    description: '企業のIR要約を入力',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'prompt',
    label: 'プロンプト',
    description: '分析プロンプトを設定',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    id: 'result',
    label: '結果表示',
    description: '分析結果を確認',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export const TabNavigation: React.FC<TabNavigationProps> = ({
  currentTab,
  onTabChange,
  canNavigateToTab = () => true,
  getTabStatus = (tab) => tab === currentTab ? 'current' : 'upcoming',
}) => {
  const handleTabClick = (tabId: TabType) => {
    if (canNavigateToTab(tabId)) {
      onTabChange(tabId);
    }
  };

  const getTabClasses = (tab: TabConfig) => {
    const isActive = currentTab === tab.id;
    const isDisabled = !canNavigateToTab(tab.id);
    
    let baseClasses = 'group relative min-w-0 flex-1 overflow-hidden py-4 px-4 text-center text-sm font-medium transition-colors duration-200 focus:z-10';
    
    if (isDisabled) {
      baseClasses += ' cursor-not-allowed opacity-50';
    } else {
      baseClasses += ' cursor-pointer hover:text-gray-700';
    }
    
    if (isActive) {
      baseClasses += ' text-blue-600 border-blue-500 border-b-2';
    } else {
      baseClasses += ' text-gray-500 border-transparent border-b-2 hover:border-gray-300';
    }
    
    return baseClasses;
  };

  const getStatusIndicator = (tab: TabConfig) => {
    const status = getTabStatus(tab.id);
    
    if (status === 'completed') {
      return (
        <div className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabConfigs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={getTabClasses(tab)}
              disabled={!canNavigateToTab(tab.id)}
              aria-current={currentTab === tab.id ? 'page' : undefined}
            >
              <div className="relative">
                <div className="flex items-center justify-center space-x-2">
                  {tab.icon}
                  <span className="hidden sm:block">{tab.label}</span>
                </div>
                <p className="hidden lg:block text-xs text-gray-500 mt-1">
                  {tab.description}
                </p>
                {getStatusIndicator(tab)}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* モバイル用のタブ情報 */}
      <div className="sm:hidden bg-gray-50 px-4 py-2 text-center">
        <div className="text-sm font-medium text-gray-900">
          {tabConfigs.find(tab => tab.id === currentTab)?.label}
        </div>
        <div className="text-xs text-gray-500">
          {tabConfigs.find(tab => tab.id === currentTab)?.description}
        </div>
      </div>
    </div>
  );
};
