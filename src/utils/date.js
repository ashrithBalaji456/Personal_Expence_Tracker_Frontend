/**
 * Formats a date string into a friendly relative style (Today, Yesterday, 14 Aug 2026)
 * @param {string|Date} dateStr 
 * @returns {string} Friendly date representation
 */
export const formatDateFriendly = (dateStr) => {
  if (!dateStr) return '';
  
  // Create Date objects in local time
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Parse date string carefully to avoid timezone shift
  let targetDate;
  if (typeof dateStr === 'string') {
    // Split YYYY-MM-DD
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      targetDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    } else {
      targetDate = new Date(dateStr);
    }
  } else {
    targetDate = new Date(dateStr);
  }
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - targetDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else {
    return targetDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
};

/**
 * Format date to standard YYYY-MM-DD for backend or inputs
 * @param {Date|string} date 
 * @returns {string} formatted date string
 */
export const formatInputDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};
