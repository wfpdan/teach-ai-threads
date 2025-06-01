import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatInterface } from "@/components/ChatInterface";
import { CreateThreadModal } from "@/components/CreateThreadModal";
import { AuthGuard } from "@/components/AuthGuard";
import { useMemberstack } from "@/hooks/useMemberstack";
import { DatabaseService, Thread as DBThread, Message as DBMessage } from "@/services/database";
import { AIService } from "@/services/aiService";
import { toast } from "sonner";

// Legacy interfaces for compatibility with existing components
export interface Student {
  id: string;
  name: string;
  grade: string;
  interests: string[];
  lastMessage?: string;
  lastMessageTime?: Date;
}

export interface Message {
  id: string;
  content: string;
  sender: 'teacher' | 'ai';
  timestamp: Date;
}

export interface Thread {
  id: string;
  student: Student;
  messages: Message[];
}

const Index = () => {
  const { user } = useMemberstack();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [db, setDb] = useState<DatabaseService | null>(null);
  const [aiService] = useState(new AIService());

  // Store the database threads for access to full student data
  const [dbThreads, setDbThreads] = useState<DBThread[]>([]);

  // Initialize database service when user is available
  useEffect(() => {
    if (user) {
      const dbService = new DatabaseService(user.id);
      setDb(dbService);
      
      // Ensure teacher exists in database
      dbService.ensureTeacher(
        user.email, 
        user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName
      ).catch(error => {
        console.error('Failed to ensure teacher:', error);
        toast.error('Failed to initialize user profile');
      });
    }
  }, [user]);

  // Load threads when database service is ready
  useEffect(() => {
    if (db) {
      loadThreads();
    }
  }, [db]);

  const loadThreads = async () => {
    if (!db) return;
    
    try {
      setIsLoading(true);
      const fetchedDbThreads = await db.getThreadsWithStudentsAndMessages();
      setDbThreads(fetchedDbThreads); // Store the full database threads
      
      // Convert database format to component format
      const convertedThreads: Thread[] = fetchedDbThreads.map(dbThread => {
        const lastMessage = dbThread.messages[dbThread.messages.length - 1];
        
        return {
          id: dbThread.id,
          student: {
            id: dbThread.student.id,
            name: dbThread.student.name,
            grade: dbThread.student.grade,
            interests: dbThread.student.interests,
            lastMessage: lastMessage?.content,
            lastMessageTime: lastMessage ? new Date(lastMessage.created_at) : undefined
          },
          messages: dbThread.messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            sender: msg.sender,
            timestamp: new Date(msg.created_at)
          }))
        };
      });
      
      setThreads(convertedThreads);
      
      // Set active thread to first one if none selected
      if (!activeThreadId && convertedThreads.length > 0) {
        setActiveThreadId(convertedThreads[0].id);
      }
    } catch (error) {
      console.error('Failed to load threads:', error);
      toast.error('Failed to load student threads');
    } finally {
      setIsLoading(false);
    }
  };

  const activeThread = threads.find(thread => thread.id === activeThreadId);

  const handleCreateThread = async (studentData: Omit<Student, 'id'>) => {
    if (!db) return;

    try {
      // Create student first
      const student = await db.createStudent(
        studentData.name,
        studentData.grade,
        studentData.interests
      );

      // Create thread for the student
      const thread = await db.createThread(student.id);

      // Convert to component format and add to threads
      const newThread: Thread = {
        id: thread.id,
        student: {
          id: student.id,
          name: student.name,
          grade: student.grade,
          interests: student.interests
        },
        messages: []
      };

      setThreads(prev => [newThread, ...prev]);
      setActiveThreadId(newThread.id);
      setIsCreateModalOpen(false);
      toast.success('Student thread created successfully!');
    } catch (error) {
      console.error('Failed to create thread:', error);
      toast.error('Failed to create student thread');
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeThread || !db) return;

    try {
      // Add teacher message
      const teacherMessage = await db.addMessage(activeThread.id, content, 'teacher');

      // Update local state immediately for teacher message
      setThreads(prev => prev.map(thread => 
        thread.id === activeThreadId 
          ? { 
              ...thread, 
              messages: [...thread.messages, {
                id: teacherMessage.id,
                content: teacherMessage.content,
                sender: teacherMessage.sender,
                timestamp: new Date(teacherMessage.created_at)
              }],
              student: {
                ...thread.student,
                lastMessage: content,
                lastMessageTime: new Date()
              }
            }
          : thread
      ));

      // Generate AI response using the real AI service
      try {
        // Find the corresponding database thread to get the full student data
        const dbThread = dbThreads.find(dt => dt.id === activeThread.id);
        if (!dbThread) {
          throw new Error('Database thread not found');
        }
        
        console.log('Generating AI response for student:', dbThread.student);
        const aiResponse = await aiService.generateResponse(content, dbThread.student);
        
        // Add AI response to database
        const aiMessage = await db.addMessage(activeThread.id, aiResponse, 'ai');

        // Update local state with AI response
        setThreads(prev => prev.map(thread => 
          thread.id === activeThreadId 
            ? { 
                ...thread, 
                messages: [...thread.messages, {
                  id: aiMessage.id,
                  content: aiMessage.content,
                  sender: aiMessage.sender,
                  timestamp: new Date(aiMessage.created_at)
                }],
                student: {
                  ...thread.student,
                  lastMessage: aiResponse,
                  lastMessageTime: new Date()
                }
              }
            : thread
        ));
      } catch (aiError) {
        console.error('Failed to generate AI response:', aiError);
        toast.error('Failed to generate AI response');
        
        // Add fallback error message
        const errorMessage = await db.addMessage(
          activeThread.id,
          'I apologize, but I encountered an error generating a response. Please try again.',
          'ai'
        );

        setThreads(prev => prev.map(thread => 
          thread.id === activeThreadId 
            ? { 
                ...thread, 
                messages: [...thread.messages, {
                  id: errorMessage.id,
                  content: errorMessage.content,
                  sender: errorMessage.sender,
                  timestamp: new Date(errorMessage.created_at)
                }]
              }
            : thread
        ));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="flex h-screen bg-gray-50 items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your student threads...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          threads={threads}
          activeThreadId={activeThreadId}
          onThreadSelect={setActiveThreadId}
          onCreateThread={() => setIsCreateModalOpen(true)}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        <ChatInterface
          thread={activeThread}
          onSendMessage={handleSendMessage}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        <CreateThreadModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateThread}
        />
      </div>
    </AuthGuard>
  );
};

export default Index;
