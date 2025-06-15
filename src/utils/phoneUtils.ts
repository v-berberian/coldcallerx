
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) {
    return phone;
  }
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 11 && digits.startsWith('1')) {
    const number = digits.slice(1);
    return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
  }
  
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return phone;
};

export const getPhoneDigits = (phone: string): string => {
  return phone.replace(/\D/g, '');
};
