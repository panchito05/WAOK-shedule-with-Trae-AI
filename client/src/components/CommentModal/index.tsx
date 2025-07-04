import React, { useState, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { edgeAutoFocus } from '@/utils/edgeCompat';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (comment: string) => void;
  currentComment: string;
  employeeName: string;
  date: string;
  shiftName: string;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentComment,
  employeeName,
  date,
  shiftName,
}) => {
  const [comment, setComment] = useState(currentComment);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setComment(currentComment);
  }, [currentComment]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      edgeAutoFocus(textareaRef.current);
    }
  }, [isOpen]);

  const handleSave = () => {
    onSave(comment);
    onClose();
  };

  const handleCancel = () => {
    setComment(currentComment);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-96 max-w-90vw z-50 shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <Dialog.Title className="text-lg font-semibold">
              Add Comment
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mb-4 text-sm text-gray-600">
            <p><strong>Employee:</strong> {employeeName}</p>
            <p><strong>Date:</strong> {(() => {
              const dateObj = new Date(date + 'T00:00:00');
              return dateObj.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              });
            })()}</p>
            <p><strong>Shift:</strong> {shiftName}</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment
            </label>
            <textarea
              ref={textareaRef}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Enter your comment here..."
            />
            <p className="mt-2 text-xs text-gray-500">
              This comment is visible to both the supervisor and the employee
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Save
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};