import { useState, useCallback } from 'react';

export const useClipboard = () => {
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      // Clipboard APIが利用可能かチェック
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // フォールバック: 古いブラウザやHTTP環境用
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!success) {
          throw new Error('コピーに失敗しました');
        }
      }

      setIsCopied(true);
      setError(null);
      
      // 2秒後にisCopiedをリセット
      setTimeout(() => setIsCopied(false), 2000);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'コピーに失敗しました';
      setError(errorMessage);
      setIsCopied(false);
      
      // 5秒後にエラーをリセット
      setTimeout(() => setError(null), 5000);
      
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setIsCopied(false);
    setError(null);
  }, []);

  return {
    copyToClipboard,
    isCopied,
    error,
    reset,
  };
};

