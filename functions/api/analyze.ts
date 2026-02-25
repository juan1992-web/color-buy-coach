// functions/api/analyze.ts

export async function onRequestPost(context) {
  try {
    // 1. 요청 데이터 파싱 (이미지 Base64 및 선호도)
    const requestBody = await context.request.json();
    const { image, preferences } = requestBody;

    if (!image) {
      return new Response(JSON.stringify({ error: 'Image is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // OpenAI API 키 확인
    const apiKey = context.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. OpenAI API 요청 준비
    // image는 "data:image/jpeg;base64,/9j/4AAQ..." 형태라고 가정
    const systemPrompt = `
      You are an expert personal color analyst. 
      Analyze the user's personal color (Spring/Summer/Autumn/Winter) and skin brightness (Light/Deep) based on the provided image and information.
      User's preferred accessory color: ${preferences?.accessory || 'Unknown'}.
      
      Respond STRICTLY in the following JSON format:
      {
        "tone": "Spring | Summer | Autumn | Winter",
        "reason": "Detailed reason for the analysis in Korean",
        "bestColors": ["color1", "color2", "color3"]
      }
    `;

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "이 사람의 퍼스널컬러(Spring/Summer/Autumn/Winter)와 피부 밝기(Light/Deep)를 분석해줘. JSON으로 { tone: string, reason: string, bestColors: string[] } 형식으로 답해줘."
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 300,
        response_format: { type: "json_object" } // JSON 형식 강제
      }),
    });

    if (!openAiResponse.ok) {
      const errorData = await openAiResponse.text();
      console.error('OpenAI API Error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to analyze image with AI' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. OpenAI 응답 파싱 및 반환
    const aiData = await openAiResponse.json();
    const resultContent = aiData.choices[0].message.content;
    const parsedResult = JSON.parse(resultContent);

    return new Response(JSON.stringify(parsedResult), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        // 'Access-Control-Allow-Origin': '*' // 필요한 경우 CORS 설정 추가
      },
    });

  } catch (error) {
    console.error('Error in analyze function:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
