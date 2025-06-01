
import { useState, useRef, useEffect } from "react";
import { Send, Menu, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Thread, Message } from "@/pages/Index";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  thread: Thread | undefined;
  onSendMessage: (content: string) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const ChatInterface = ({
  thread,
  onSendMessage,
  onToggleSidebar,
  isSidebarOpen
}: ChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [thread?.messages]);

  const handleSend = () => {
    if (!input.trim() || !thread) return;
    
    setIsTyping(true);
    onSendMessage(input.trim());
    setInput("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    // Simulate typing indicator
    setTimeout(() => setIsTyping(false), 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  if (!thread) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <User className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to AI Teaching Assistant</h2>
            <p className="text-gray-600 mb-6">
              Create a new student thread or select an existing one to start generating personalized lesson plans.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>✨ AI-powered curriculum recommendations</p>
              <p>📚 Personalized to each student's interests</p>
              <p>🎯 Grade-appropriate lesson planning</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="flex-shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
              {thread.student.name.charAt(0)}
            </div>
            
            <div>
              <h2 className="font-semibold text-gray-900">{thread.student.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{thread.student.grade}</span>
                <span>•</span>
                <span>{thread.student.interests.join(", ")}</span>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-400">
            {thread.messages.length} messages
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-6">
          {thread.messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="w-12 h-12 mx-auto mb-4 text-blue-500 opacity-50" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Start a conversation with AI
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Ask for lesson plans, activities, or curriculum recommendations tailored to {thread.student.name}'s interests and grade level.
              </p>
            </div>
          ) : (
            thread.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          
          {isTyping && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={`Ask for lesson plans for ${thread.student.name}...`}
                className="w-full resize-none rounded-2xl border border-gray-300 bg-white px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px] max-h-[200px]"
                rows={1}
              />
              
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                size="icon"
                className="absolute right-2 bottom-2 h-8 w-8 rounded-full"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 text-center">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({ message }: { message: Message }) => {
  const isTeacher = message.sender === 'teacher';
  
  return (
    <div className={cn(
      "flex items-start gap-3",
      isTeacher && "flex-row-reverse"
    )}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isTeacher 
          ? "bg-gradient-to-br from-blue-500 to-indigo-600" 
          : "bg-gradient-to-br from-green-500 to-emerald-600"
      )}>
        {isTeacher ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>
      
      <div className={cn(
        "max-w-[70%] rounded-2xl p-4 shadow-sm border",
        isTeacher 
          ? "bg-blue-600 text-white rounded-tr-none" 
          : "bg-white text-gray-900 rounded-tl-none"
      )}>
        <div className="prose prose-sm max-w-none">
          {isTeacher ? (
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
          ) : (
            <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-900 prose-strong:text-gray-900 prose-code:text-gray-900 prose-pre:bg-gray-100 prose-pre:text-gray-900 prose-blockquote:text-gray-700 prose-blockquote:border-gray-300 prose-ul:text-gray-900 prose-ol:text-gray-900 prose-li:text-gray-900">
              <ReactMarkdown>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        <div className={cn(
          "text-xs mt-2 opacity-70",
          isTeacher ? "text-blue-100" : "text-gray-500"
        )}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};
