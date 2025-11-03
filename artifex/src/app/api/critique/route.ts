import { openai, getUser } from '@/echo';
import { streamText, tool, stepCountIs } from 'ai';
import { getCriticConfig, type CriticPersonality } from '@/lib/critic-personalities';
import { z } from 'zod';

interface CritiqueMessage {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

interface CritiqueRequest {
  messages: CritiqueMessage[];
  critic: CriticPersonality;
}

interface ArtworkApiResponse {
  id: number;
  title: string;
  artist_display: string;
  date_display: string;
  medium_display: string;
  image_id: string | null;
  dimensions?: string;
  place_of_origin?: string;
  description?: string;
  style_title?: string;
  classification_title?: string;
  artwork_type_title?: string;
}

/**
 * Search for artworks using the Art Institute of Chicago API
 * Free, public API with high-quality images and metadata
 */
async function searchArtworks(query: string, limit: number = 5) {
  try {
    const response = await fetch(
      `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(query)}&limit=${limit}&fields=id,title,artist_display,date_display,medium_display,image_id,thumbnail`
    );

    if (!response.ok) {
      throw new Error('Failed to search artworks');
    }

    const data = await response.json();

    return data.data.map((artwork: ArtworkApiResponse) => ({
      id: artwork.id,
      title: artwork.title,
      artist: artwork.artist_display,
      date: artwork.date_display,
      medium: artwork.medium_display,
      imageUrl: artwork.image_id
        ? `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`
        : null,
      detailUrl: `https://www.artic.edu/artworks/${artwork.id}`
    }));
  } catch (error) {
    console.error('Error searching artworks:', error);
    return [];
  }
}

/**
 * Get a specific artwork by ID from the Art Institute of Chicago
 */
async function getArtworkById(artworkId: number) {
  try {
    const response = await fetch(
      `https://api.artic.edu/api/v1/artworks/${artworkId}?fields=id,title,artist_display,date_display,medium_display,dimensions,place_of_origin,description,image_id,style_title,classification_title,artwork_type_title`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch artwork');
    }

    const result = await response.json();
    const artwork = result.data;

    return {
      id: artwork.id,
      title: artwork.title,
      artist: artwork.artist_display,
      date: artwork.date_display,
      medium: artwork.medium_display,
      dimensions: artwork.dimensions,
      origin: artwork.place_of_origin,
      description: artwork.description,
      style: artwork.style_title,
      classification: artwork.classification_title,
      type: artwork.artwork_type_title,
      imageUrl: artwork.image_id
        ? `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`
        : null,
      detailUrl: `https://www.artic.edu/artworks/${artwork.id}`
    };
  } catch (error) {
    console.error('Error fetching artwork:', error);
    return null;
  }
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

    const lastMessage = messages[messages.length - 1];
    console.log(`[CRITIQUE API] User message: "${lastMessage?.content?.substring(0, 100)}..." | Critic: ${critic}`);

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

    // Update system prompt to include tool usage instructions
    const enhancedSystemPrompt = `${criticConfig.systemPrompt}

You have access to tools that let you search for and display famous artworks from museum collections. When discussing specific artworks, art movements, or when users ask for examples:

- Use the searchArtworks tool to find relevant artworks
- After finding artworks, you can use markdown to display them with images: ![Title](imageUrl)
- Include links to artwork details: [View at Museum](detailUrl)
- When showing multiple artworks, present them in a clean list format

Format artwork displays like this:
**[Title]** by Artist (Date)
![Title](imageUrl)
Medium | [View Details](detailUrl)

Use these tools naturally in conversation to enhance your critiques with visual examples.`;

    console.log('[STREAM START] Starting streamText...');

    // Stream response using Echo SDK with tools
    const result = streamText({
      model: openai('gpt-4o'),
      system: enhancedSystemPrompt,
      messages: conversationMessages,
      tools: {
        searchArtworks: tool({
          description: 'Search for famous artworks by title, artist, movement, or keywords. Returns a list of artworks with images and details from major museums.',
          inputSchema: z.object({
            query: z.string().describe('Search query for artworks (e.g., "Starry Night", "Picasso", "impressionism")'),
            limit: z.number().optional().default(5).describe('Maximum number of results to return (1-10)')
          }),
          execute: async ({ query, limit }) => {
            console.log(`[TOOL CALL] searchArtworks: query="${query}", limit=${limit}`);
            const results = await searchArtworks(query, limit);
            console.log(`[TOOL RESULT] searchArtworks: found ${results.length} artworks`);
            return {
              artworks: results,
              message: results.length > 0
                ? `Found ${results.length} artwork(s) matching "${query}"`
                : `No artworks found for "${query}"`
            };
          }
        }),
        getArtworkDetails: tool({
          description: 'Get detailed information about a specific artwork by its ID. Use this after searching to get full details.',
          inputSchema: z.object({
            artworkId: z.number().describe('The numeric ID of the artwork')
          }),
          execute: async ({ artworkId }) => {
            console.log(`[TOOL CALL] getArtworkDetails: artworkId=${artworkId}`);
            const artwork = await getArtworkById(artworkId);
            console.log(`[TOOL RESULT] getArtworkDetails: ${artwork ? 'found' : 'not found'}`);
            return artwork || { error: 'Artwork not found' };
          }
        })
      },
      temperature: 0.8,
      stopWhen: stepCountIs(10), // Allow multiple tool call rounds (default is 1)
      onStepFinish: ({ text, toolCalls, toolResults }) => {
        console.log('[STEP FINISHED] Generated text:', text);
        console.log('[STEP FINISHED] Tool calls:', toolCalls?.length || 0);
        console.log('[STEP FINISHED] Tool results:', toolResults?.length || 0);
      },
    });

    console.log('[STREAM CONVERT] Converting to text stream response...');

    // Return streaming response as simple text stream
    const response = result.toTextStreamResponse();
    console.log('[STREAM RETURN] Response created, returning to client');
    return response;
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
