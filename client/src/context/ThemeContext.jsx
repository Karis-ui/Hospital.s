import React, { createContext, useState, useContext, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider,alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const lightThemeColors = {
  primary: { main: '#1a2639', light: '#2c3e50', dark: '#0f1a2f', contrast: '#ffffff' },
  secondary: { main: '#c9b037', light: '#e4d96f', dark: '#aa8c2f', contrast: '#1a2639' },
  background: { default: '#f0f2f5', paper: '#ffffff', elevated: '#f8fafc' },
  text: { primary: '#1e293b', secondary: '#64748b', disabled: '#94a3b8' },
};

const darkThemeColors = {
  primary: { main: '#0f172a', light: '#1e293b', dark: '#020617', contrast: '#ffffff' },
  secondary: { main: '#eab308', light: '#fef08a', dark: '#a16207', contrast: '#0f172a' },
  background: { default: '#0f172a', paper: '#1e293b', elevated: '#334155' },
  text: { primary: '#f1f5f9', secondary: '#94a3b8', disabled: '#64748b' },
};

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });

  const [accentColor, setAccentColor] = useState(() => {
    const savedColor = localStorage.getItem('accentColor');
    return savedColor || '#c9b037';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setThemeMode = (newMode) => {
    setMode(newMode);
  };

  const setAccent = (color) => {
    setAccentColor(color);
  };

  const colors = mode === 'light' ? lightThemeColors : darkThemeColors;

  const theme = createTheme({
    palette: {
      mode: mode,
      primary: { main: colors.primary.main, light: colors.primary.light, dark: colors.primary.dark, contrastText: colors.primary.contrast },
      secondary: { main: accentColor, light: '#e4d96f', dark: '#aa8c2f', contrastText: colors.secondary.contrast },
      background: { default: colors.background.default, paper: colors.background.paper },
      text: { primary: colors.text.primary, secondary: colors.text.secondary, disabled: colors.text.disabled },
      error: { main: '#ef4444' },
      warning: { main: '#f59e0b' },
      info: { main: '#3b82f6' },
      success: { main: '#10b981' },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 500 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: { root: { textTransform: 'none', borderRadius: 8, fontWeight: 600 } },
      },
      MuiCard: {
        styleOverrides: { root: { borderRadius: 16 } },
      },
      MuiPaper: {
        styleOverrides: { rounded: { borderRadius: 16 } },
      },
      MuiAppBar: {
        styleOverrides: { root: { backgroundColor: colors.background.paper, color: colors.text.primary, boxShadow: 'none', borderBottom: `1px solid ${alpha(colors.text.disabled, 0.1)}` } },
      },
    },
  });

  const value = {
    mode,
    accentColor,
    toggleTheme,
    setThemeMode,
    setAccent,
    isDarkMode: mode === 'dark',
    isLightMode: mode === 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;