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

  const formatShortDate = (date: string) => {
    try {
      return format(parseISO(date), 'd-MMM-yyyy');
    } catch {
      return date;
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 cursor-pointer relative
                [&::-webkit-calendar-picker-indicator]:opacity-0 
                [&::-webkit-calendar-picker-indicator]:absolute 
                [&::-webkit-calendar-picker-indicator]:inset-0 
                [&::-webkit-calendar-picker-indicator]:w-full 
                [&::-webkit-calendar-picker-indicator]:h-full 
                [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              placeholder="mm/dd/yyyy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 cursor-pointer relative
                [&::-webkit-calendar-picker-indicator]:opacity-0 
                [&::-webkit-calendar-picker-indicator]:absolute 
                [&::-webkit-calendar-picker-indicator]:inset-0 
                [&::-webkit-calendar-picker-indicator]:w-full 
                [&::-webkit-calendar-picker-indicator]:h-full 
                [&::-webkit-calendar-picker-indicator]:cursor-pointer"
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
            <div className="max-h-40 overflow-y-auto border rounded">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left font-medium">From</th>
                    <th className="px-3 py-2 text-left font-medium">To</th>
                    <th className="px-3 py-2 text-left font-medium">Leave Type</th>
                    <th className="px-2 py-2 text-center font-medium">Edit</th>
                    <th className="px-2 py-2 text-center font-medium">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {existingLeaves.map((leave) => (
                    <tr
                      key={leave.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-3 py-2">{formatShortDate(leave.startDate)}</td>
                      <td className="px-3 py-2">{formatShortDate(leave.endDate)}</td>
                      <td className="px-3 py-2">
                        {leave.leaveType}
                        <span className="text-gray-500 ml-1">({leave.hoursPerDay} hrs/day)</span>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button
                          onClick={() => {
                            setStartDate(leave.startDate);
                            setEndDate(leave.endDate);
                            setLeaveType(leave.leaveType);
                            setHoursPerDay(String(leave.hoursPerDay));
                            setEditingId(leave.id);
                          }}
                          className="px-3 py-1 text-xs bg-blue-500 text-white rounded border border-blue-600 hover:bg-blue-600 transition-colors shadow-sm"
                        >
                          Edit
                        </button>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button
                          onClick={() => onDelete(leave.id)}
                          className="px-3 py-1 text-xs bg-red-500 text-white rounded border border-red-600 hover:bg-red-600 transition-colors shadow-sm"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveModal;