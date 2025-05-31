
import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Student } from "@/pages/Index";

interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (student: Omit<Student, 'id'>) => void;
}

export const CreateThreadModal = ({
  isOpen,
  onClose,
  onSubmit
}: CreateThreadModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    interests: [""]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      name: "",
      grade: "",
      interests: [""]
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addInterest = () => {
    setFormData(prev => ({
      ...prev,
      interests: [...prev.interests, ""]
    }));
  };

  const removeInterest = (index: number) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }));
  };

  const updateInterest = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.map((interest, i) => 
        i === index ? value : interest
      )
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Student name is required";
    }

    if (!formData.grade.trim()) {
      newErrors.grade = "Grade level is required";
    }

    const validInterests = formData.interests.filter(interest => interest.trim());
    if (validInterests.length === 0) {
      newErrors.interests = "At least one interest is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const validInterests = formData.interests.filter(interest => interest.trim());
    
    onSubmit({
      name: formData.name.trim(),
      grade: formData.grade.trim(),
      interests: validInterests
    });

    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Create New Student Thread</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Student Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Student Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter student's full name"
              className={errors.name ? "border-red-500 focus:ring-red-500" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Grade Level */}
          <div className="space-y-2">
            <Label htmlFor="grade" className="text-sm font-medium text-gray-700">
              Grade Level *
            </Label>
            <Input
              id="grade"
              value={formData.grade}
              onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
              placeholder="e.g., 5th Grade, Middle School, etc."
              className={errors.grade ? "border-red-500 focus:ring-red-500" : ""}
            />
            {errors.grade && (
              <p className="text-xs text-red-600">{errors.grade}</p>
            )}
          </div>

          {/* Interests */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">
                Interests & Learning Style *
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addInterest}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
            
            <div className="space-y-2">
              {formData.interests.map((interest, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={interest}
                    onChange={(e) => updateInterest(index, e.target.value)}
                    placeholder="e.g., Science, Animals, Art, Sports..."
                    className="flex-1"
                  />
                  {formData.interests.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeInterest(index)}
                      className="h-9 w-9 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            {errors.interests && (
              <p className="text-xs text-red-600">{errors.interests}</p>
            )}
            
            <p className="text-xs text-gray-500">
              Add subjects, hobbies, or learning preferences to help AI create personalized lessons.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Create Thread
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
