import { createContext, useContext } from 'react';

type MotionContextValue = {
  prefersReducedMotion: boolean;
};

const defaultValue: MotionContextValue = {
  prefersReducedMotion: false
};

export const MotionContext = createContext<MotionContextValue>(defaultValue);

export function useMotionContext(): MotionContextValue {
  return useContext(MotionContext);
}
