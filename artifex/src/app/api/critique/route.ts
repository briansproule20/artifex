import { openai, getUser } from '@/echo';
import { streamText } from 'ai';
import { getCriticConfig, type CriticPersonality } from '@/lib/critic-personalities';

interface CritiqueMessage {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

interface CritiqueRequest {
  messages: CritiqueMessage[];
  critic: CriticPersonality;
}

export async function POST(request: Request) {
  try {
    // Verify authentication with Echo SDK
    const user = await getUser();
    if (!user) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = (await request.json()) as CritiqueRequest;
    const { messages, critic } = body;

    if (!messages || messages.length === 0) {
      return Response.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    // Get critic configuration
    const criticConfig = getCriticConfig(critic);

    // Build messages for AI SDK
    const conversationMessages = messages.map(message => {
      if (message.role === 'user' && message.imageUrl) {
        // User message with image
        return {
          role: 'user' as const,
          content: [
            {
              type: 'text' as const,
              text: message.content,
            },
            {
              type: 'image' as const,
              image: message.imageUrl,
            },
          ],
        };
      } else {
        // Regular text message
        return {
          role: message.role as 'user' | 'assistant',
          content: message.content,
        };
      }
    });

    // Stream response using Echo SDK
    const result = streamText({
      model: openai('gpt-4o'),
      system: criticConfig.systemPrompt,
      messages: conversationMessages,
      temperature: 0.8,
    });

    // Return streaming response - older AI SDK version uses different method
    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error in critique API:', error);

    if (error instanceof Error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
