import { CalendarEvent } from '../types/calendar.types';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Export calendar as PDF
export const exportToPDF = async (
  calendarElement: HTMLElement,
  employeeName: string,
  startDate: string,
  endDate: string
) => {
  try {
    // Create PDF with landscape orientation
    const pdf = new jsPDF('l', 'mm', 'a4');
    
    // Add header
    pdf.setFontSize(20);
    pdf.text(`${employeeName} - Schedule Calendar`, 20, 20);
    pdf.setFontSize(12);
    pdf.text(`Period: ${format(new Date(startDate), 'MMM d, yyyy')} - ${format(new Date(endDate), 'MMM d, yyyy')}`, 20, 30);
    
    // Capture calendar as image
    const canvas = await html2canvas(calendarElement, {
      scale: 2,
      logging: false,
      windowWidth: calendarElement.scrollWidth,
      windowHeight: calendarElement.scrollHeight
    });
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 277; // A4 landscape width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 10, 40, imgWidth, imgHeight);
    
    // Save the PDF
    pdf.save(`${employeeName.replace(/\s+/g, '_')}_schedule_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export calendar to PDF');
  }
};

// Export calendar as image
export const exportToImage = async (
  calendarElement: HTMLElement,
  employeeName: string
) => {
  try {
    const canvas = await html2canvas(calendarElement, {
      scale: 2,
      logging: false,
      windowWidth: calendarElement.scrollWidth,
      windowHeight: calendarElement.scrollHeight
    });
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${employeeName.replace(/\s+/g, '_')}_schedule_${format(new Date(), 'yyyy-MM-dd')}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }
    });
  } catch (error) {
    console.error('Error exporting to image:', error);
    throw new Error('Failed to export calendar to image');
  }
};

// Export calendar as iCal format
export const exportToICal = (
  events: CalendarEvent[],
  employeeName: string
) => {
  try {
    let icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//WAOK Schedule//Calendar Export//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${employeeName} Work Schedule`,
      'X-WR-TIMEZONE:UTC'
    ];

    events.forEach(event => {
      const uid = `${event.id}@waok-schedule`;
      const dtstart = formatDateToICal(event.start);
      const dtend = formatDateToICal(event.end);
      const summary = event.title;
      const description = getEventDescription(event);
      const categories = event.resource.type.toUpperCase();
      
      icalContent.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTART:${dtstart}`,
        `DTEND:${dtend}`,
        `SUMMARY:${escapeICalText(summary)}`,
        `DESCRIPTION:${escapeICalText(description)}`,
        `CATEGORIES:${categories}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    });

    icalContent.push('END:VCALENDAR');
    
    // Create and download file
    const blob = new Blob([icalContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${employeeName.replace(/\s+/g, '_')}_schedule_${format(new Date(), 'yyyy-MM-dd')}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to iCal:', error);
    throw new Error('Failed to export calendar to iCal');
  }
};

// Helper function to format date for iCal
const formatDateToICal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
};

// Helper function to escape text for iCal format
const escapeICalText = (text: string): string => {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
};

// Helper function to get event description
const getEventDescription = (event: CalendarEvent): string => {
  const { resource } = event;
  let description = `Type: ${resource.type}\n`;
  description += `Employee: ${resource.employeeName}\n`;
  
  switch (resource.type) {
    case 'shift':
      if (resource.isFixed) description += 'Fixed Shift (Permanent)\n';
      if (resource.isManual) description += 'Manually Assigned\n';
      if (resource.isLocked) description += 'Locked (Employee Request)\n';
      break;
    case 'leave':
      description += `Leave Type: ${resource.leaveType}\n`;
      description += `Hours per day: ${resource.hoursPerDay || 8}\n`;
      break;
    case 'comment':
      description += `Comment: ${resource.comment}\n`;
      break;
  }
  
  return description;
};

// Print calendar with optimized layout
export const printCalendar = (
  calendarElement: HTMLElement,
  employeeName: string,
  startDate: string,
  endDate: string
) => {
  // Create a print-friendly version
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Failed to open print window');
  }

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${employeeName} - Schedule Calendar</title>
      <style>
        @media print {
          body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
          }
          h1 {
            font-size: 24px;
            margin-bottom: 10px;
          }
          h2 {
            font-size: 16px;
            color: #666;
            margin-bottom: 20px;
          }
          .calendar-container {
            width: 100%;
          }
          /* Hide non-printable elements */
          button, .no-print {
            display: none !important;
          }
          /* Optimize calendar for print */
          .rbc-calendar {
            font-size: 10px;
          }
          .rbc-event {
            padding: 2px !important;
            font-size: 9px !important;
          }
          @page {
            size: landscape;
            margin: 0.5in;
          }
        }
      </style>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/react-big-calendar@1.8.5/lib/css/react-big-calendar.css">
    </head>
    <body>
      <h1>${employeeName} - Schedule Calendar</h1>
      <h2>Period: ${format(new Date(startDate), 'MMMM d, yyyy')} - ${format(new Date(endDate), 'MMMM d, yyyy')}</h2>
      <div class="calendar-container">
        ${calendarElement.innerHTML}
      </div>
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
};