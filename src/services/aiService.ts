
import { supabase } from '@/integrations/supabase/client';
import { Student } from './database';

export class AIService {
  async generateResponse(message: string, student: Student): Promise<string> {
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
}
