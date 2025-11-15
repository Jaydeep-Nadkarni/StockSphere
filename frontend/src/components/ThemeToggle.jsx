import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center justify-center w-9 h-9 rounded-full transition
        ${isDark ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
      aria-label="Toggle theme"
      title={isDark ? 'Switch to Light' : 'Switch to Dark'}
    >
      {isDark ? '🌙' : '☀️'}
    </button>
  );
}