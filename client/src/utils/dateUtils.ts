export const formatLocalTime = (isoString: string) => {
  if (!isoString) return 'Unknown Date';
  
  const date = new Date(isoString);
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
};