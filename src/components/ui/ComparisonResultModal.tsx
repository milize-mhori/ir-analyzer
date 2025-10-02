import React from 'react';
import { Company } from '@/types';

interface Claim {
  text: string;
  evidence: string[];
}

interface Section {
  title: string;
  claims: Claim[];
}

interface ComparisonData {
  sections: Section[];
}

interface ComparisonResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  data: ComparisonData | null;
}

export const ComparisonResultModal: React.FC<ComparisonResultModalProps> = ({
  isOpen,
  onClose,
  companies = [],
  data,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !data) return null;

  const companyLabels = ['A', 'B', 'C', 'D', 'E'];

  // evidenceをパースして表示用のデータに変換（例："A:1" -> {label: "A", number: "1"}）
  const parseEvidence = (evidence: string) => {
    const [label, number] = evidence.split(':');
    return { label, number };
  };

  // 全体のテキストをコピー用に生成
  const getFullText = () => {
    return data.sections.map((section, sectionIndex) => {
      const sectionText = `${sectionIndex + 1}. ${section.title}\n`;
      const claimsText = section.claims.map(claim => 
        `  ${claim.text} [${claim.evidence.join(', ')}]`
      ).join('\n');
      return sectionText + claimsText;
    }).join('\n\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getFullText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('コピーに失敗しました:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-[1100px] rounded-[20px] flex flex-col"
        style={{
          background: 'linear-gradient(157deg, rgba(73, 104, 182, 1) 0%, rgba(33, 56, 115, 1) 100%)',
          height: '790px',
        }}
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-12 h-12 rounded-full bg-[#8AA4B5] flex items-center justify-center hover:bg-[#7a94a5] transition-colors z-10"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 7L7 21M7 7L21 21"
              stroke="#FEFEFE"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* コンテンツ */}
        <div className="px-10 pt-10 pb-6 flex-1 flex flex-col min-h-0">
          {/* メインコンテンツエリア - グレーの大きなエリア */}
          <div className="flex-1 flex gap-3 overflow-hidden min-h-0">
            {/* グレーのテキストエリア */}
            <div className="flex-1 bg-[#F3F5F7] rounded-xl px-6 py-4 flex flex-col gap-4 min-h-0">
              {/* ヘッダー部分 - グレーエリアの内部に配置 */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <h2 className="text-lg font-bold text-[#141718] leading-[40px] tracking-[-0.02em] flex-shrink-0">
                  共通点・差異分析結果
                </h2>
                {/* 会社タグ */}
                <div className="flex gap-[6px] overflow-x-auto flex-1">
                  {companies.map((company, index) => (
                    <div
                      key={company.id}
                      className="flex items-center px-3 py-2 h-10 bg-white border border-[#E8ECEF] rounded-xl flex-shrink-0"
                    >
                      <span className="text-sm text-[#141718] font-normal leading-6">
                        {companyLabels[index]}：{company.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {/* スクロール可能なテキストエリア */}
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-6">
                  {data.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="space-y-3">
                      {/* セクションタイトル（連番付き、太字） */}
                      <h3 className="text-sm font-bold text-[#141718] leading-[1.75]">
                        {sectionIndex + 1}. {section.title}
                      </h3>
                      
                      {/* クレーム一覧 */}
                      <div className="space-y-2">
                        {section.claims.map((claim, claimIndex) => (
                          <div key={claimIndex} className="text-sm text-[#141718] leading-[1.75]">
                            {claim.text}
                            {/* エビデンス表示 - テキストの末尾に続けて表示 */}
                            <span className="inline-flex gap-1 ml-2 align-middle">
                              {claim.evidence.map((ev, evIndex) => {
                                const { label, number } = parseEvidence(ev);
                                return (
                                  <span
                                    key={evIndex}
                                    className="inline-flex items-center gap-[2px] px-1 h-[22px] bg-[#6FB0ED] rounded-[20px]"
                                  >
                                    <span className="inline-flex w-4 h-4 bg-white rounded-full items-center justify-center">
                                      <span className="text-[10px] text-[#141718] font-normal leading-none">
                                        {label}
                                      </span>
                                    </span>
                                    <span className="text-sm text-white font-normal leading-none">
                                      {number}
                                    </span>
                                  </span>
                                );
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* コピーボタン */}
              <div className="flex justify-end items-center">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-[2px] bg-[rgba(0,132,255,0.1)] border border-[#0084FF] rounded-md hover:bg-[rgba(0,132,255,0.2)] transition-colors"
                >
                  <svg
                    width="12"
                    height="14"
                    viewBox="0 0 12 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 0.5H1.5C0.948 0.5 0.5 0.948 0.5 1.5V9.5H1.5V1.5H8V0.5ZM9.5 2.5H3.5C2.948 2.5 2.5 2.948 2.5 3.5V12.5C2.5 13.052 2.948 13.5 3.5 13.5H9.5C10.052 13.5 10.5 13.052 10.5 12.5V3.5C10.5 2.948 10.052 2.5 9.5 2.5ZM9.5 12.5H3.5V3.5H9.5V12.5Z"
                      fill="#0084FF"
                    />
                  </svg>
                  <span className="text-sm text-[#0084FF] leading-6 tracking-[-0.02em]">
                    {copied ? 'コピーしました' : 'コピーする'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
