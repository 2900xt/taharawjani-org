import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Simple in-memory session store (in production, use Redis or database)
const sessions = new Map<string, { authenticated: boolean; expiresAt: number }>();

// Clean up expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(sessionId);
    }
  }
}, 5 * 60 * 1000);

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json();

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Message and sessionId are required' },
        { status: 400 }
      );
    }

    // Check if this is a password attempt
    if (message.startsWith('auth ')) {
      const password = message.slice(5).trim();

      if (password === process.env.TERMINAL_PASSWORD) {
        // Create authenticated session (24 hour expiry)
        sessions.set(sessionId, {
          authenticated: true,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        });

        return NextResponse.json({
          response: 'Authentication successful! You can now chat with Claude.',
          authenticated: true,
        });
      } else {
        return NextResponse.json({
          response: 'Authentication failed. Access denied.',
          authenticated: false,
        });
      }
    }

    // Check if session is authenticated
    const session = sessions.get(sessionId);
    if (!session || !session.authenticated || session.expiresAt < Date.now()) {
      return NextResponse.json({
        response: 'ILLEGAL ACCESS DETECTED. TERMINAL LOCKED.',
        authenticated: false,
      });
    }

    // Validate API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Claude API key not configured' },
        { status: 500 }
      );
    }

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    // Extract text content from response
    const textContent = response.content.find((block) => block.type === 'text');
    const responseText = textContent && 'text' in textContent ? textContent.text : 'No response generated';

    return NextResponse.json({
      response: responseText,
      authenticated: true,
    });
  } catch (error) {
    console.error('Terminal API error:', error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Claude API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
