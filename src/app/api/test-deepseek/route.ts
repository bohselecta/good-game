// app/api/test-deepseek/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        status: 'error',
        message: 'DEEPSEEK_API_KEY environment variable is not set',
        hasApiKey: false
      });
    }

    // Test the API with a simple request
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Hello, respond with {"test": "success"}' }],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
    });

    const responseText = await response.text();
    
    return NextResponse.json({
      status: response.ok ? 'success' : 'error',
      hasApiKey: true,
      apiKeyPrefix: apiKey.substring(0, 10) + '...',
      responseStatus: response.status,
      responseText: responseText.substring(0, 200),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
