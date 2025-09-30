import { NextRequest, NextResponse } from 'next/server';
import { loadAllPrompts, getPromptFileMetadataList, loadPromptById } from '@/utils/prompt-loader';

// GET /api/prompts - 全プロンプト取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const metadata = searchParams.get('metadata') === 'true';

    // 特定IDのプロンプトを取得
    if (id) {
      const prompt = loadPromptById(id);
      if (!prompt) {
        return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
      }
      return NextResponse.json(prompt);
    }

    // メタデータのみを取得
    if (metadata) {
      const metadataList = getPromptFileMetadataList();
      return NextResponse.json(metadataList);
    }

    // 全プロンプトを取得
    const prompts = loadAllPrompts();
    return NextResponse.json(prompts);

  } catch (error) {
    console.error('Error loading prompts:', error);
    return NextResponse.json(
      { error: 'Failed to load prompts' },
      { status: 500 }
    );
  }
}
