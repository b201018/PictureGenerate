export async function POST(request) {
  try {
    const { prompt } = await request.json();

    // プロンプトの検証
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'プロンプトが入力されていません' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Stability AI APIキーの確認
    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'APIキーが設定されていません' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Stability AI SDXL 1.0を呼び出し
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1.0,
          },
        ],
        height: 1024,
        width: 1024,
        steps: 30,
        cfg_scale: 7,
        samples: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stability AI API Error Response:', errorText);
      let errorMessage = 'Stability AI APIでエラーが発生しました';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // レスポンスの検証
    if (!data.artifacts || !data.artifacts[0] || !data.artifacts[0].base64) {
      console.error('Unexpected response format:', data);
      throw new Error('予期しないレスポンス形式です');
    }

    // base64画像データをdata URLに変換
    const imageUrl = `data:image/png;base64,${data.artifacts[0].base64}`;

    // 画像URLを返す
    return new Response(
      JSON.stringify({
        imageUrl: imageUrl,
        prompt: prompt,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('画像生成エラー:', error);

    // エラーメッセージの整形
    const errorMessage = error.message || '画像生成に失敗しました';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
