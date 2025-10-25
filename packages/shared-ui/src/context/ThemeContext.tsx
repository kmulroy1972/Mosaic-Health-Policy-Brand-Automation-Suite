import { createContext, useContext } from 'react';

import { Theme, defaultTheme } from '../tokens';

export const ThemeContext = createContext<Theme>(defaultTheme);

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
