
import { Plus, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Thread } from "@/pages/Index";
import { cn } from "@/lib/utils";

interface SidebarProps {
  threads: Thread[];
  activeThreadId: string | undefined;
  onThreadSelect: (threadId: string) => void;
  onCreateThread: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar = ({
  threads,
  activeThreadId,
  onThreadSelect,
  onCreateThread,
  isOpen,
  onToggle
}: SidebarProps) => {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      <div className={cn(
        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-50",
        "fixed lg:relative h-full",
        isOpen ? "w-80 translate-x-0" : "w-0 -translate-x-full lg:translate-x-0 lg:w-0"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-gray-900 truncate">Student Threads</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="lg:hidden flex-shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <Button 
            onClick={onCreateThread}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">New Student Thread</span>
          </Button>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {threads.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No student threads yet.</p>
              <p className="text-xs mt-1">Create your first thread to get started!</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => onThreadSelect(thread.id)}
                  className={cn(
                    "w-full p-3 text-left rounded-lg transition-all duration-200 group border",
                    "hover:bg-blue-50 hover:shadow-sm",
                    activeThreadId === thread.id 
                      ? "bg-blue-100 border-blue-200 shadow-md" 
                      : "bg-gray-50 border-gray-100 hover:border-blue-200"
                  )}
                >
                  <div className="space-y-2">
                    {/* Header with name and time */}
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={cn(
                        "font-semibold text-sm truncate",
                        activeThreadId === thread.id ? "text-blue-900" : "text-gray-900"
                      )}>
                        {thread.student.name}
                      </h3>
                      {thread.student.lastMessageTime && (
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatTime(thread.student.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    
                    {/* Tags */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex-shrink-0">
                        {thread.student.grade}
                      </span>
                      {thread.student.interests.slice(0, 2).map((interest, index) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex-shrink-0">
                          {interest}
                        </span>
                      ))}
                      {thread.student.interests.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{thread.student.interests.length - 2}
                        </span>
                      )}
                    </div>
                    
                    {/* Last message */}
                    {thread.student.lastMessage && (
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {thread.student.lastMessage}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <div className="text-xs text-gray-500 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <User className="w-3 h-3 flex-shrink-0" />
              <span>AI-Powered Teaching Assistant</span>
            </div>
            <p>Personalized lesson plans for every student</p>
          </div>
        </div>
      </div>
    </>
  );
};
