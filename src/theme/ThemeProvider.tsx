import React, { createContext, useContext, useEffect } from 'react';
import { lightTheme, darkTheme, Theme } from '../theme';
import { useGlobalContext } from '../global/GlobalProvider';

const ThemeContext = createContext<Theme>(lightTheme);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { globalState } = useGlobalContext();
  const { isDarkMode } = globalState;
  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    // Apply theme variables to CSS custom properties
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  }, [theme]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}; 