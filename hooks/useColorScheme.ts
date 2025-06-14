// Instead of using device settings, we'll always return 'light' theme
export function useColorScheme(): 'light' | 'dark' {
  return 'light';
}
