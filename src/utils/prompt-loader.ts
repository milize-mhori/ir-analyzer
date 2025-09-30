import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Prompt } from '@/types';

// プロンプトファイルのメタデータ型定義
export interface PromptFileMetadata {
  id: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  created?: string;
  updated?: string;
}

// プロンプトファイルの型定義
export interface PromptFile {
  metadata: PromptFileMetadata;
  content: string;
  filePath: string;
}

// プロンプトディレクトリのパス
const PROMPTS_DIR = path.join(process.cwd(), 'prompts', 'templates');

/**
 * プロンプトファイルを読み込む
 */
export function loadPromptFile(fileName: string): PromptFile | null {
  try {
    const filePath = path.join(PROMPTS_DIR, fileName);
    
    // ファイルが存在するかチェック
    if (!fs.existsSync(filePath)) {
      console.warn(`Prompt file not found: ${fileName}`);
      return null;
    }

    // ファイルを読み込み
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Front matterを解析
    const { data: metadata, content } = matter(fileContent);
    
    // メタデータの検証
    if (!metadata.id || !metadata.name) {
      console.warn(`Invalid prompt file metadata: ${fileName}`);
      return null;
    }

    return {
      metadata: metadata as PromptFileMetadata,
      content: content.trim(),
      filePath,
    };
  } catch (error) {
    console.error(`Error loading prompt file ${fileName}:`, error);
    return null;
  }
}

/**
 * 利用可能なプロンプトファイル一覧を取得
 */
export function getAvailablePromptFiles(): string[] {
  try {
    if (!fs.existsSync(PROMPTS_DIR)) {
      console.warn(`Prompts directory not found: ${PROMPTS_DIR}`);
      return [];
    }

    return fs
      .readdirSync(PROMPTS_DIR)
      .filter(file => file.endsWith('.md'))
      .sort();
  } catch (error) {
    console.error('Error reading prompts directory:', error);
    return [];
  }
}

/**
 * 全プロンプトファイルを読み込む
 */
export function loadAllPromptFiles(): PromptFile[] {
  const fileNames = getAvailablePromptFiles();
  const promptFiles: PromptFile[] = [];

  for (const fileName of fileNames) {
    const promptFile = loadPromptFile(fileName);
    if (promptFile) {
      promptFiles.push(promptFile);
    }
  }

  return promptFiles;
}

/**
 * プロンプトファイルをPrompt型に変換
 */
export function convertToPrompt(promptFile: PromptFile): Prompt {
  return {
    id: promptFile.metadata.id,
    name: promptFile.metadata.name,
    content: promptFile.content,
    createdAt: promptFile.metadata.created ? new Date(promptFile.metadata.created) : new Date(),
    updatedAt: promptFile.metadata.updated ? new Date(promptFile.metadata.updated) : new Date(),
  };
}

/**
 * 全プロンプトファイルをPrompt配列として取得
 */
export function loadAllPrompts(): Prompt[] {
  const promptFiles = loadAllPromptFiles();
  return promptFiles.map(convertToPrompt);
}

/**
 * 特定のIDのプロンプトを取得
 */
export function loadPromptById(id: string): Prompt | null {
  const fileNames = getAvailablePromptFiles();
  
  for (const fileName of fileNames) {
    const promptFile = loadPromptFile(fileName);
    if (promptFile && promptFile.metadata.id === id) {
      return convertToPrompt(promptFile);
    }
  }
  
  return null;
}

/**
 * カテゴリ別にプロンプトを取得
 */
export function loadPromptsByCategory(category: string): Prompt[] {
  const promptFiles = loadAllPromptFiles();
  return promptFiles
    .filter(file => file.metadata.category === category)
    .map(convertToPrompt);
}

/**
 * プロンプトファイルのメタデータ一覧を取得
 */
export function getPromptFileMetadataList(): PromptFileMetadata[] {
  const promptFiles = loadAllPromptFiles();
  return promptFiles.map(file => file.metadata);
}
