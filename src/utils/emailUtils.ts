
export const createMailtoLink = (email: string, leadName: string, company?: string) => {
  if (!email || !email.includes('@')) return '';
  
  const subject = encodeURIComponent(`Following up - ${leadName}${company ? ` from ${company}` : ''}`);
  const body = encodeURIComponent(`Hi ${leadName},\n\nI hope this email finds you well. I wanted to follow up regarding our recent conversation.\n\n${company ? `I understand you work at ${company} and ` : ''}I believe we could discuss some opportunities that might be of interest to you.\n\nWould you be available for a brief call to explore this further?\n\nBest regards,\n[Your Name]\n[Your Contact Information]`);
  return `mailto:${email}?subject=${subject}&body=${body}`;
};

export const validateEmail = (email?: string): boolean => {
  if (!email) return false;
  const trimmedEmail = email.trim();
  return trimmedEmail.length > 0 && trimmedEmail.includes('@');
};
