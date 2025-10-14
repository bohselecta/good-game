// app/api/test-deepseek/route.ts
import OpenAI from 'openai';
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

    // Initialize OpenAI client with DeepSeek configuration
    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: apiKey,
    });

    // Test the API with a simple request
    const completion = await openai.chat.completions.create({
      model: 'deepseek-reasoner',
      messages: [{ role: 'user', content: 'Hello, respond with {"test": "success"}' }],
      temperature: 0.0,
      response_format: { type: 'json_object' }
    });

    const responseContent = completion.choices[0].message.content;
    
    return NextResponse.json({
      status: 'success',
      hasApiKey: true,
      apiKeyPrefix: apiKey.substring(0, 10) + '...',
      responseContent: responseContent,
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
