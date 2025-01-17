export const formatDate = (date: Date) => date
  ? new Date(date).toLocaleDateString() + " " + new Date(date).toLocaleTimeString()
  : "";

export const escapeRegexCharacters = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}