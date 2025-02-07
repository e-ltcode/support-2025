export const lightTheme = {
  // Header
  headerBackground: '#FFFFFF',
  headerBorder: '#E5E9EF',
  
  // Search
  searchBarBackground: '#F9F9F9',
  searchBarText: '#5A5A5A',
  searchBarBorder: '#007BFF',
  
  // Buttons and Interactive Elements
  primaryButtonBackground: '#007BFF',
  primaryButtonText: '#FFFFFF',
  primaryButtonHover: '#0056B3',
  
  // Navigation
  navLinkColor: '#5A5A5A',
  navLinkHover: '#007BFF',
  navLinkHoverBg: '#E6F2FF',
  navLinkActiveBg: '#007BFF',
  navLinkActiveText: '#FFFFFF',
  
  // Dropdown
  dropdownBackground: '#F9F9F9',
  dropdownBorder: '#E5E9EF',
  dropdownHoverBg: '#E6F2FF',
  dropdownActiveText: '#0056B3',
  dropdownShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  
  // Page
  pageBackground: 'linear-gradient(180deg, #E6F2FF 0%, #FFFFFF 100%)',
  contentBackground: '#FFFFFF',
  textPrimary: '#2D3748',
  textSecondary: '#5A5A5A',
  
  // Current Item
  currentItemBg: '#007BFF',
  currentItemText: '#FFFFFF',
  
  // Shadows
  shadowLight: '0 2px 4px rgba(0,0,0,0.05)',
  shadowMedium: '0 4px 6px rgba(0,0,0,0.1)',
};

export const darkTheme = {
  // Header
  headerBackground: '#1A1A2E',
  headerBorder: '#2C3E50',
  
  // Search
  searchBarBackground: '#121212',
  searchBarText: '#EAEAEA',
  searchBarBorder: '#1ABC9C',
  
  // Buttons and Interactive Elements
  primaryButtonBackground: '#1ABC9C',
  primaryButtonText: '#FFFFFF',
  primaryButtonHover: '#16A085',
  
  // Navigation
  navLinkColor: '#B3B3B3',
  navLinkHover: '#1ABC9C',
  navLinkHoverBg: '#1E2A3B',
  navLinkActiveBg: '#1ABC9C',
  navLinkActiveText: '#FFFFFF',
  
  // Dropdown
  dropdownBackground: '#121212',
  dropdownBorder: '#2C3E50',
  dropdownHoverBg: '#1E2A3B',
  dropdownActiveText: '#EAEAEA',
  dropdownShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
  
  // Page
  pageBackground: '#0F172A',
  contentBackground: '#1A1A2E',
  textPrimary: '#EAEAEA',
  textSecondary: '#B3B3B3',
  
  // Current Item
  currentItemBg: '#1ABC9C',
  currentItemText: '#FFFFFF',
  
  // Shadows
  shadowLight: '0 2px 4px rgba(0,0,0,0.2)',
  shadowMedium: '0 4px 8px rgba(0,0,0,0.3)',
};

export type Theme = typeof lightTheme; 