
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatInterface } from "@/components/ChatInterface";
import { CreateThreadModal } from "@/components/CreateThreadModal";

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
  const [threads, setThreads] = useState<Thread[]>([
    {
      id: "1",
      student: {
        id: "1",
        name: "Alex Johnson",
        grade: "5th Grade",
        interests: ["Science", "Animals"],
        lastMessage: "Could you help me create a lesson about ecosystems?",
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 30)
      },
      messages: [
        {
          id: "1",
          content: "Could you help me create a lesson about ecosystems?",
          sender: "teacher",
          timestamp: new Date(Date.now() - 1000 * 60 * 30)
        },
        {
          id: "2",
          content: "I'd be happy to help you create an engaging ecosystem lesson for Alex! Given that Alex is in 5th grade and loves science and animals, here's a comprehensive lesson plan:\n\n**Lesson: Forest Ecosystems Adventure**\n\n**Learning Objectives:**\n- Understand what an ecosystem is\n- Identify different components of a forest ecosystem\n- Learn about food chains and interdependence\n\n**Activities:**\n1. **Ecosystem Web Game** - Students create a web showing connections between plants and animals\n2. **Animal Role Play** - Each student becomes a forest animal and explains their role\n3. **Build a Food Chain** - Using forest creatures Alex is interested in\n\n**Materials Needed:**\n- Forest animal pictures\n- Yarn for web activity\n- Ecosystem diagram worksheets\n\nWould you like me to elaborate on any of these activities or create additional resources?",
          sender: "ai",
          timestamp: new Date(Date.now() - 1000 * 60 * 25)
        }
      ]
    }
  ]);
  
  const [activeThreadId, setActiveThreadId] = useState<string>("1");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const activeThread = threads.find(thread => thread.id === activeThreadId);

  const handleCreateThread = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...studentData,
      id: Date.now().toString()
    };
    
    const newThread: Thread = {
      id: Date.now().toString(),
      student: newStudent,
      messages: []
    };
    
    setThreads(prev => [...prev, newThread]);
    setActiveThreadId(newThread.id);
    setIsCreateModalOpen(false);
  };

  const handleSendMessage = (content: string) => {
    if (!activeThread) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'teacher',
      timestamp: new Date()
    };

    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm processing your request and will provide a personalized lesson plan based on " + activeThread.student.name + "'s profile. This is a simulated response - in the full app, this would be powered by GPT-4o with curriculum context.",
        sender: 'ai',
        timestamp: new Date()
      };

      setThreads(prev => prev.map(thread => 
        thread.id === activeThreadId 
          ? { 
              ...thread, 
              messages: [...thread.messages, aiResponse],
              student: {
                ...thread.student,
                lastMessage: content,
                lastMessageTime: new Date()
              }
            }
          : thread
      ));
    }, 1500);

    setThreads(prev => prev.map(thread => 
      thread.id === activeThreadId 
        ? { 
            ...thread, 
            messages: [...thread.messages, newMessage],
            student: {
              ...thread.student,
              lastMessage: content,
              lastMessageTime: new Date()
            }
          }
        : thread
    ));
  };

  return (
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
  );
};

export default Index;
