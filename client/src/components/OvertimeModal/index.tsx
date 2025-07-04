import React from 'react';
import { X, AlertCircle, Info, Calendar } from 'lucide-react';
import { useShiftContext } from '../../context/ShiftContext';
import { useEmployeeLists } from '../../context/EmployeeListsContext';
import { useRules } from '../../context/RulesContext';
import { usePersonnelData } from '../../context/PersonnelDataContext';

// Define daysOfWeek since it's not defined
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface OvertimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: {
    startTime: string;
    endTime: string;
    index?: number;
  };
}

const OvertimeModal: React.FC<OvertimeModalProps> = ({ isOpen, onClose, shift }) => {
  const { toggleGlobalOvertime, toggleShiftOvertime, shifts, isGlobalOvertimeActive, setShiftOvertimeForDate, moveShiftOvertimeToDate } = useShiftContext();
  const { rules } = useRules();
  const { getCurrentList, refreshTrigger } = useEmployeeLists();
  const { shiftData } = usePersonnelData();
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [showShiftConfirm, setShowShiftConfirm] = React.useState(false);
  const [currentShiftInfo, setCurrentShiftInfo] = React.useState({
    currentStaff: 0,
    idealStaff: 0,
    availablePositions: 0
  });
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [showDateOvertime, setShowDateOvertime] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(rules.startDate);
  const [overtimeQuantity, setOvertimeQuantity] = React.useState(1);
  const [isOvertimeActive, setIsOvertimeActive] = React.useState(true);
  const [existingOvertime, setExistingOvertime] = React.useState<{quantity: number, isActive: boolean} | null>(null);
  const [editMode, setEditMode] = React.useState(false);
  const [originalDate, setOriginalDate] = React.useState<string | null>(null);
  const [hasUserInteracted, setHasUserInteracted] = React.useState(false);

  // Update current staff info when date changes
  React.useEffect(() => {
    if (typeof shift.index === 'number' && selectedDate) {
      const currentList = getCurrentList();
      const employees = currentList?.employees || [];
      const currentShift = shifts[shift.index];

      const date = new Date(selectedDate + 'T00:00:00Z');
      const dayOfWeek = daysOfWeek[date.getUTCDay()];

      // Count scheduled employees
      let count = 0;
      employees.forEach(employee => {
        const isOnLeave = employee.leave?.some(l => {
          const leaveStart = new Date(l.startDate + 'T00:00:00Z');
          const leaveEnd = new Date(l.endDate + 'T00:00:00Z');
          const current = new Date(selectedDate + 'T00:00:00Z');
          return current >= leaveStart && current <= leaveEnd;
        });

        if (!isOnLeave) {
          const manualShift = employee.manualShifts?.[selectedDate];
          const fixedShift = employee.fixedShifts?.[dayOfWeek]?.[0];
          const shiftId = `uid_${Math.random().toString(36).substr(2, 15)}`;

          if (manualShift === shiftId || (!manualShift && fixedShift === shiftId)) {
            count++;
          }
        }
      });

      const idealStaff = shiftData && shiftData[shift.index] ? shiftData[shift.index].counts[date.getUTCDay()] || 0 : 0;

      setCurrentShiftInfo({
        currentStaff: count,
        idealStaff,
        availablePositions: Math.max(0, idealStaff - count)
      });
      
      // Check for existing overtime entry
      if (currentShift && currentShift.overtimeEntries && !editMode) {
        const existingEntry = currentShift.overtimeEntries.find(
          entry => entry.date === selectedDate
        );
        if (existingEntry) {
          setExistingOvertime(existingEntry);
          // Don't load values or enter edit mode automatically
        } else {
          setExistingOvertime(null);
          // Reset values only if not in edit mode and user hasn't interacted
          if (!editMode && !hasUserInteracted) {
            setOvertimeQuantity(1);
            setIsOvertimeActive(true);
          }
        }
      }
    }
  }, [shift.index, selectedDate, shifts, getCurrentList, shiftData, editMode, hasUserInteracted]);

  // Update selectedDate when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedDate(rules.startDate);
      setEditMode(false);
      setOriginalDate(null);
      setExistingOvertime(null);
      setOvertimeQuantity(1);
      setIsOvertimeActive(true);
      setHasUserInteracted(false);
    }
  }, [isOpen, rules.startDate]);

  const handleGlobalOvertime = () => {
    setShowConfirm(true);
  };

  const handleShiftOvertime = () => {
    setShowShiftConfirm(true);
  };

  const confirmGlobalOvertime = () => {
    // Always deactivate all specific overtimes when toggling global
    shifts.forEach((shift, index) => {
      if (shift.isOvertimeActive) {
        toggleShiftOvertime(index, false);
      }
    });
    
    toggleGlobalOvertime(!isGlobalOvertimeActive);
    setShowConfirm(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 2000);
  };

  const confirmShiftOvertime = () => {
    if (typeof shift.index === 'number') {
      // If global overtime is active, deactivate it first
      if (isGlobalOvertimeActive && !shifts[shift.index]?.isOvertimeActive) {
        toggleGlobalOvertime(false);
      }
      
      toggleShiftOvertime(shift.index, !shifts[shift.index]?.isOvertimeActive);
      setShowShiftConfirm(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-bold mb-6">Add or Edit Overtime Options</h2>
        <p className="text-gray-600 mb-6">Shift: {shift.startTime} - {shift.endTime}</p>

        <div className="space-y-4">
          <button 
            onClick={handleGlobalOvertime}
            className={`w-full px-4 py-3 rounded transition-colors text-left flex items-center gap-2 ${
              isGlobalOvertimeActive ? 'bg-red-500 hover:bg-red-600' : 'bg-[#19b08d] hover:bg-[#148a73]'
            } text-white`}
          >
            1. {isGlobalOvertimeActive ? 'Remove' : 'Add'} Overtime for the entire work schedule in all shifts where employees are missing to complete the Ideal Staff For This Shift.
          </button>

          <button 
            onClick={handleShiftOvertime}
            disabled={isGlobalOvertimeActive && typeof shift.index === 'number' && !shifts[shift.index]?.isOvertimeActive}
            className={`w-full px-4 py-3 rounded transition-colors text-left flex items-center gap-2 ${
              typeof shift.index === 'number' && shifts[shift.index]?.isOvertimeActive
                ? 'bg-red-500 hover:bg-red-600'
                : isGlobalOvertimeActive && !shifts[shift.index]?.isOvertimeActive
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#19b08d] hover:bg-[#148a73]'
            } text-white`}
          >
            2. Add all missing overtime, but only for this specific shift
            {typeof shift.index === 'number' && shifts[shift.index]?.isOvertimeActive && (
              <span className="text-sm">(Currently Active)</span>
            )}
            {isGlobalOvertimeActive && typeof shift.index === 'number' && !shifts[shift.index]?.isOvertimeActive && (
              <span className="text-sm">(Disabled - Global Overtime is Active)</span>
            )}
          </button>

          <button 
            onClick={() => setShowDateOvertime(true)}
            className="w-full bg-[#19b08d] text-white px-4 py-3 rounded hover:bg-[#148a73] transition-colors text-left"
          >
            3. Add or Edit Overtime for this shift on a specific day.
          </button>
        </div>

        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[500px] relative">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    {isGlobalOvertimeActive ? 'Disable' : 'Enable'} Global Overtime
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {isGlobalOvertimeActive
                      ? 'This will remove overtime from all shifts. Are you sure you want to continue?'
                      : 'This will enable overtime for all shifts where the number of scheduled employees is less than the ideal staff count. Are you sure you want to continue?'
                    }
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmGlobalOvertime}
                      className={`px-4 py-2 text-white rounded ${
                        isGlobalOvertimeActive ? 'bg-red-500 hover:bg-red-600' : 'bg-[#19b08d] hover:bg-[#148a73]'
                      }`}
                    >
                      {isGlobalOvertimeActive ? 'Disable' : 'Enable'} Global Overtime
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {showShiftConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[500px] relative">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    {typeof shift.index === 'number' && shifts[shift.index]?.isOvertimeActive
                      ? 'Disable Shift Overtime'
                      : 'Enable Shift Overtime'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {typeof shift.index === 'number' && shifts[shift.index]?.isOvertimeActive
                      ? 'This will disable overtime for this specific shift. Are you sure you want to continue?'
                      : 'This will enable overtime only for this specific shift where the number of scheduled employees is less than the ideal staff count. Are you sure you want to continue?'}
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowShiftConfirm(false)}
                      className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmShiftOvertime}
                      className={`px-4 py-2 text-white rounded ${
                        typeof shift.index === 'number' && shifts[shift.index]?.isOvertimeActive
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-[#19b08d] hover:bg-[#148a73]'
                      }`}
                    >
                      {typeof shift.index === 'number' && shifts[shift.index]?.isOvertimeActive
                        ? 'Disable Shift Overtime'
                        : 'Enable Shift Overtime'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDateOvertime && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[500px] relative">
              <div className="space-y-4">
                <h3 className="text-xl font-bold mb-4">
                  {editMode ? 'Edit/Delete Overtime for Specific Date' : 'Add Overtime for Specific Date'}
                </h3>
                
                {editMode && originalDate !== selectedDate && (
                  <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded mb-3">
                    ⚠️ Moving overtime from {originalDate} to {selectedDate}
                  </p>
                )}

                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold mb-2">Shift Information</h4>
                  <div className="space-y-1">
                    <p className="text-sm">Time: {shift.startTime} - {shift.endTime}</p>
                    <p className="text-sm">Current Staff: {currentShiftInfo.currentStaff}</p>
                    <p className="text-sm">Ideal Staff: {currentShiftInfo.idealStaff}</p>
                    <p className="text-sm">Available Positions: {currentShiftInfo.availablePositions}</p>
                  </div>
                </div>

                {existingOvertime && (
                  <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-200">
                    <p className="text-sm font-semibold text-blue-800">Current Overtime Settings:</p>
                    <p className="text-sm text-blue-700">
                      Quantity: {existingOvertime.quantity} | 
                      Status: {existingOvertime.isActive ? 'Active ✓' : 'Inactive ✗'}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setHasUserInteracted(false); // Reset when date changes
                      }}
                      className="w-full border border-gray-300 rounded px-3 py-2 pr-10"
                    />
                    <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Overtime Shifts Needed
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={overtimeQuantity}
                    onChange={(e) => {
                      setHasUserInteracted(true);
                      setOvertimeQuantity(Math.max(1, parseInt(e.target.value) || 1));
                    }}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isOvertimeActive}
                    onChange={(e) => setIsOvertimeActive(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#19b08d] focus:ring-[#19b08d]"
                  />
                  <label className="text-sm text-gray-700">
                    Enable overtime for this date
                  </label>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => setShowDateOvertime(false)}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  {editMode && existingOvertime && (
                    <button
                      onClick={() => {
                        if (typeof shift.index === 'number' && selectedDate) {
                          // Remove overtime by setting quantity to 0
                          setShiftOvertimeForDate(shift.index, selectedDate, 0, false);
                          setShowDateOvertime(false);
                          setShowSuccess(true);
                          setTimeout(() => {
                            setShowSuccess(false);
                            onClose();
                          }, 2000);
                        }
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete Overtime
                    </button>
                  )}
                  
                  {/* Edit button when overtime exists but not in edit mode */}
                  {existingOvertime && !editMode && (
                    <button
                      onClick={() => {
                        // Load values and enter edit mode
                        setOvertimeQuantity(existingOvertime.quantity);
                        setIsOvertimeActive(existingOvertime.isActive);
                        setEditMode(true);
                        setOriginalDate(selectedDate);
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Edit Overtime
                    </button>
                  )}
                  
                  {/* Save/Update button when no overtime exists OR in edit mode */}
                  {(!existingOvertime || editMode) && (
                    <button
                      onClick={() => {
                        if (typeof shift.index === 'number' && selectedDate) {
                          // If date changed in edit mode, use moveShiftOvertimeToDate
                          if (editMode && originalDate && originalDate !== selectedDate) {
                            moveShiftOvertimeToDate(shift.index, originalDate, selectedDate, overtimeQuantity, isOvertimeActive);
                            // Add small delay to ensure context updates propagate
                            setTimeout(() => {
                              setShowDateOvertime(false);
                              setShowSuccess(true);
                              setTimeout(() => {
                                setShowSuccess(false);
                                onClose();
                              }, 2000);
                            }, 100);
                          } else {
                            // Save to current date (new or same)
                            setShiftOvertimeForDate(shift.index, selectedDate, overtimeQuantity, isOvertimeActive);
                            setShowDateOvertime(false);
                            setShowSuccess(true);
                            setTimeout(() => {
                              setShowSuccess(false);
                              onClose();
                            }, 2000);
                          }
                        }
                      }}
                      disabled={!selectedDate}
                      className="px-4 py-2 bg-[#19b08d] text-white rounded hover:bg-[#148a73] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editMode ? 'Update Overtime' : 'Save Overtime'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[400px] relative">
              <div className="flex items-start gap-4">
                <Info className="h-6 w-6 text-[#19b08d] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Success!</h3>
                  <p className="text-gray-600">
                    Global overtime has been enabled. Available shifts will now be shown where needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OvertimeModal;