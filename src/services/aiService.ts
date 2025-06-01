
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

      // If we have a response body (streaming), handle it as a stream
      if (data instanceof ReadableStream || (data && data.body)) {
        return this.handleStreamingResponse(data, onChunk);
      }

      // Fallback for non-streaming response
      if (!data || !data.response) {
        throw new Error('No response received from AI service');
      }

      console.log('AI service response:', data.response);
      return data.response;
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
      // Handle the streaming response from the edge function
      const reader = response.body?.getReader() || response.getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
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
