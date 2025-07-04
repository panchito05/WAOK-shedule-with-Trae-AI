import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { ShiftSelector } from './ShiftSelector';
import { ShiftRow } from '../../types/common';
import { Calendar, Plus } from 'lucide-react';

interface AddShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  employee: any;
  shifts: ShiftRow[];
  onAddShift: (employeeId: string, date: string, shiftId: string) => void;
  onAddLeave?: () => void;
}

export const AddShiftModal: React.FC<AddShiftModalProps> = ({
  isOpen,
  onClose,
  date,
  employee,
  shifts,
  onAddShift,
  onAddLeave
}) => {
  const [selectedShift, setSelectedShift] = useState('');

  const handleSave = () => {
    if (selectedShift && selectedShift !== 'add-leave') {
      onAddShift(employee.id, format(date, 'yyyy-MM-dd'), selectedShift);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedShift('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md !bg-white !gap-0">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <DialogTitle>Add Shift</DialogTitle>
          </div>
          <DialogDescription>
            Add a shift for {employee.name} on {format(date, 'EEEE, MMMM d, yyyy')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Select Shift</h4>
            <ShiftSelector
              value={selectedShift}
              onChange={setSelectedShift}
              shifts={shifts}
              employee={employee}
              date={format(date, 'yyyy-MM-dd')}
              onAddLeaveSelect={() => {
                if (onAddLeave) {
                  onAddLeave();
                  onClose();
                }
              }}
            />
          </div>

          {selectedShift && selectedShift !== 'day-off' && selectedShift !== 'add-leave' && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> This will assign a manual shift that overrides any fixed or scheduled shifts for this day.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!selectedShift}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Shift
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};