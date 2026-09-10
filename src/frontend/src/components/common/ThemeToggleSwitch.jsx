import React from 'react';

/**
 * ThemeToggleSwitch
 * Custom animated Sun / Moon toggle switch based on Uiverse.io by alexruix.
 *
 * - Unchecked: Deep purple night sky (#28096b) with yellow crescent moon (Dark Mode).
 * - Checked: Daylight sky blue (#448EE4) with bright yellow sun (Light Mode).
 *
 * @param {Object} props
 * @param {boolean} props.isDarkMode - True if dark mode is active
 * @param {() => void} props.onToggle - Theme toggle handler
 * @param {string} [props.className] - Optional extra wrapper classes
 */
export default function ThemeToggleSwitch({
  isDarkMode = false,
  onToggle,
  className = '',
}) {
  return (
    <label
      className={`switch cursor-pointer select-none flex-shrink-0 ${className}`}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle dark/light theme"
      style={{ fontSize: '15px' }}
    >
      <input
        type="checkbox"
        checked={!isDarkMode}
        onChange={onToggle}
        aria-checked={!isDarkMode}
      />
      <span className="slider"></span>
    </label>
  );
}

