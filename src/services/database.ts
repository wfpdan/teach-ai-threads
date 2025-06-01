
import { supabase } from '@/integrations/supabase/client';

export interface Teacher {
  id: string;
  memberstack_id: string;
  email: string | null;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  teacher_id: string;
  name: string;
  grade: string;
  interests: string[];
  created_at: string;
}

export interface Thread {
  id: string;
  teacher_id: string;
  student_id: string;
  created_at: string;
  student: Student;
  messages: Message[];
}

export interface Message {
  id: string;
  thread_id: string;
  content: string;
  sender: 'teacher' | 'ai';
  created_at: string;
}

export class DatabaseService {
  private memberstackId: string;

  constructor(memberstackId: string) {
    this.memberstackId = memberstackId;
    // Remove the RLS context setting for now as it's causing TypeScript issues
    // We'll handle teacher isolation through explicit queries instead
  }

  async ensureTeacher(email: string, name?: string): Promise<Teacher> {
    // First, try to get existing teacher
    const { data: existingTeacher, error: fetchError } = await supabase
      .from('teachers')
      .select('*')
      .eq('memberstack_id', this.memberstackId)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingTeacher) {
      return existingTeacher;
    }

    // Create new teacher
    const { data: newTeacher, error: createError } = await supabase
      .from('teachers')
      .insert({
        memberstack_id: this.memberstackId,
        email,
        name
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    return newTeacher;
  }

  async getThreadsWithStudentsAndMessages(): Promise<Thread[]> {
    const teacher = await this.getCurrentTeacher();
    
    const { data, error } = await supabase
      .from('threads')
      .select(`
        *,
        student:students(*),
        messages(*)
      `)
      .eq('teacher_id', teacher.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(thread => ({
      ...thread,
      messages: (thread.messages || []).map((msg: any) => ({
        ...msg,
        sender: msg.sender as 'teacher' | 'ai'
      })).sort((a: Message, b: Message) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    }));
  }

  async createStudent(name: string, grade: string, interests: string[]): Promise<Student> {
    const teacher = await this.getCurrentTeacher();
    
    const { data, error } = await supabase
      .from('students')
      .insert({
        teacher_id: teacher.id,
        name,
        grade,
        interests
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async createThread(studentId: string): Promise<Thread> {
    const teacher = await this.getCurrentTeacher();
    
    const { data, error } = await supabase
      .from('threads')
      .insert({
        teacher_id: teacher.id,
        student_id: studentId
      })
      .select(`
        *,
        student:students(*),
        messages(*)
      `)
      .single();

    if (error) {
      throw error;
    }

    return {
      ...data,
      messages: []
    };
  }

  async addMessage(threadId: string, content: string, sender: 'teacher' | 'ai'): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        thread_id: threadId,
        content,
        sender
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      ...data,
      sender: data.sender as 'teacher' | 'ai'
    };
  }

  private async getCurrentTeacher(): Promise<Teacher> {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('memberstack_id', this.memberstackId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}
