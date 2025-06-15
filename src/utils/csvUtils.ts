
export const cleanCsvValue = (value: string | undefined): string | undefined => {
  if (!value || typeof value !== 'string') {
    return undefined;
  }
  
  const cleaned = value.trim().replace(/"/g, '');
  
  // Check for various "empty" states
  if (cleaned === '' || 
      cleaned.toLowerCase() === 'undefined' || 
      cleaned.toLowerCase() === 'null' || 
      cleaned === 'N/A' || 
      cleaned === '-') {
    return undefined;
  }
  
  return cleaned;
};

export const cleanEmailValue = (email: string | undefined): string | undefined => {
  if (!email || typeof email !== 'string') {
    return undefined;
  }
  
  const cleaned = email.trim().replace(/"/g, '');
  
  // Check for various "empty" states and invalid email patterns
  if (cleaned === '' || 
      cleaned.toLowerCase() === 'undefined' || 
      cleaned.toLowerCase() === 'null' || 
      cleaned === 'N/A' || 
      cleaned === '-' ||
      !cleaned.includes('@')) {
    return undefined;
  }
  
  return cleaned;
};
