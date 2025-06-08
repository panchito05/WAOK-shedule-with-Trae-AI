import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { X } from 'lucide-react';

interface Leave {
  id: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  hoursPerDay: number;
}

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  existingLeaves: Leave[];
  onSave: (leave: { startDate: string; endDate: string; type: string; hoursPerDay: number }) => void;
  onEdit: (leave: { id: string; startDate: string; endDate: string; type: string; hoursPerDay: number }) => void;
  onDelete: (id: string) => void;
}

const leaveTypes = [
  'Paid Vacation',
  'Sick Leave',
  'Family and Medical Leave (FMLA)',
  'Bereavement Leave',
  'Birth or Adoption Leave',
  'Marriage Leave',
  'Study Leave',
  'Military Service Leave',
  'Jury Duty',
  'Voting Leave',
  'Moving Leave',
  'Personal Affairs Leave',
  'Unpaid Leave',
  'Short-term Disability Leave',
  'Religious Leave',
  'Personal Emergency Leave',
  'Other Type of Leave (Editable Write Your Leave)'
];

const LeaveModal: React.FC<LeaveModalProps> = ({
  isOpen,
  onClose,
  employeeName,
  existingLeaves,
  onSave,
  onEdit,
  onDelete
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('Paid Vacation');
  const [hoursPerDay, setHoursPerDay] = useState('8');
  const [editingId, setEditingId] = useState<string | null>(null);

  const formatRange = (start: string, end: string) => {
    try {
      const startFmt = format(parseISO(start), 'd-LLLL-yyyy');
      const endFmt = format(parseISO(end), 'd-LLLL-yyyy');
      return `${startFmt} to ${endFmt}`;
    } catch {
      return `${start} to ${end}`;
    }
  };

  const handleSave = () => {
    if (!startDate || !endDate || !leaveType || !hoursPerDay) {
      return;
    }

    if (editingId) {
      onEdit({
        id: editingId,
        startDate,
        endDate,
        type: leaveType,
        hoursPerDay: parseFloat(hoursPerDay)
      });
    } else {
      onSave({
        startDate,
        endDate,
        type: leaveType,
        hoursPerDay: parseFloat(hoursPerDay)
      });
    }

    // Reset form
    setStartDate('');
    setEndDate('');
    setLeaveType('Paid Vacation');
    setHoursPerDay('8');
    setEditingId(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-[480px] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-bold mb-6">Select Date or Date Range</h2>

        <div className="bg-[#19b08d] text-white px-4 py-2 rounded mb-6">
          Adding Leave for: {employeeName}
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="mm/dd/yyyy"
            />
          </div>

          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="mm/dd/yyyy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type of Leave
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              {leaveTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hours per Leave Day (for biweekly calculation):
            </label>
            <input
              type="number"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="e.g., 8"
            />
            <p className="text-xs text-gray-500 mt-1">
              (Enter 0 if leave days don't count towards total hours)
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-6 bg-[#19b08d] text-white px-4 py-2 rounded hover:bg-[#19b08d]/90 transition-colors"
        >
          Save Leave
        </button>

        {existingLeaves.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Saved Leaves</h3>
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {existingLeaves.map((leave) => (
                <li
                  key={leave.id}
                  className="flex justify-between items-center text-sm border rounded p-3 bg-gray-50"
                >
                  <span className="font-medium">
                    {formatRange(leave.startDate, leave.endDate)} - {leave.leaveType} ({leave.hoursPerDay} hrs/day)
                  </span>
                  <span className="space-x-4">
                    <button
                      onClick={() => {
                        setStartDate(leave.startDate);
                        setEndDate(leave.endDate);
                        setLeaveType(leave.leaveType);
                        setHoursPerDay(String(leave.hoursPerDay));
                        setEditingId(leave.id);
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(leave.id)}
                      className="text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveModal;