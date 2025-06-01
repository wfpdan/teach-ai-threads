
import { supabase } from '@/integrations/supabase/client';
import { Student } from './database';

export class AIService {
  async generateResponse(
    message: string, 
    student: Student, 
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    try {
      console.log('Calling AI service with:', { message, student });

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message,
          studentContext: {
            name: student.name,
            grade: student.grade,
            interests: student.interests
          }
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`AI service error: ${error.message}`);
      }

      console.log('Raw response from edge function:', data);

      // Check if we got a ReadableStream response for streaming
      if (data && typeof data === 'object' && data.constructor.name === 'ReadableStream') {
        return this.handleStreamingResponse(data, onChunk);
      }

      // Check if the response has a body property that's a ReadableStream
      if (data && data.body && typeof data.body === 'object') {
        return this.handleStreamingResponse(data.body, onChunk);
      }

      // Handle direct response (non-streaming fallback)
      if (data && typeof data === 'string') {
        console.log('AI service direct response:', data);
        return data;
      }

      // If data is an object with a response property
      if (data && data.response) {
        console.log('AI service response:', data.response);
        return data.response;
      }

      console.error('Unexpected response format:', data);
      throw new Error('Unexpected response format from AI service');
    } catch (error) {
      console.error('Failed to generate AI response:', error);
      throw error;
    }
  }

  private async handleStreamingResponse(
    response: any, 
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    let fullResponse = '';

    try {
      console.log('Handling streaming response...');
      
      // Get the reader from the response
      const reader = response.getReader ? response.getReader() : response.body?.getReader();
      
      if (!reader) {
        throw new Error('Unable to get reader from response');
      }
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        console.log('Received chunk:', chunk);
        
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              continue;
            }
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.delta) {
                fullResponse += parsed.delta;
                if (onChunk) {
                  onChunk(parsed.delta);
                }
              }
            } catch (parseError) {
              console.error('Error parsing streaming data:', parseError);
              // Sometimes the data might not be JSON, just add it directly
              fullResponse += data;
              if (onChunk) {
                onChunk(data);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error handling streaming response:', error);
      throw error;
    }

    console.log('AI streaming response complete:', fullResponse);
    return fullResponse;
  }
}
