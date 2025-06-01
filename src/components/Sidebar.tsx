
import { Plus, User, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Thread } from "@/pages/Index";
import { cn } from "@/lib/utils";
import { useMemberstack } from "@/hooks/useMemberstack";

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
  const { user, logout } = useMemberstack();

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
        isOpen ? "w-80 translate-x-0" : "w-0 -translate-x-full lg:translate-x-0 lg:w-16",
        // Hide overflow when collapsed to prevent content spillover
        !isOpen && "lg:overflow-visible overflow-hidden"
      )}>
        {/* Always show toggle and minimal content when collapsed on desktop */}
        <div className={cn(
          "p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0",
          !isOpen && "lg:p-2"
        )}>
          {isOpen ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-lg font-bold text-gray-900 truncate">Student Threads</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggle}
                  className="flex-shrink-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* User Profile */}
              {user && (
                <div className="flex items-center gap-3 mb-3 p-2 bg-white rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user.firstName ? user.firstName.charAt(0) : user.email.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user.firstName || user.email
                      }
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    className="h-7 w-7 text-gray-400 hover:text-red-500"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <Button 
                onClick={onCreateThread}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">New Student Thread</span>
              </Button>
            </>
          ) : (
            // Collapsed state on desktop - show minimal controls
            <div className="hidden lg:flex flex-col items-center gap-2">
              {user && (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user.firstName ? user.firstName.charAt(0) : user.email.charAt(0)}
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onCreateThread}
                className="w-8 h-8"
                title="New Student Thread"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Thread List - only show when open */}
        {isOpen && (
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
        )}

        {/* Footer - only show when open */}
        {isOpen && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
            <div className="text-xs text-gray-500 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <User className="w-3 h-3 flex-shrink-0" />
                <span>AI-Powered Teaching Assistant</span>
              </div>
              <p>Personalized lesson plans for every student</p>
            </div>
          </div>
        )}

        {/* Collapsed state thread indicators on desktop */}
        {!isOpen && (
          <div className="hidden lg:flex flex-col gap-1 p-2 flex-1 overflow-y-auto">
            {threads.slice(0, 8).map((thread) => (
              <button
                key={thread.id}
                onClick={() => onThreadSelect(thread.id)}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                  activeThreadId === thread.id 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                )}
                title={thread.student.name}
              >
                {thread.student.name.charAt(0)}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
