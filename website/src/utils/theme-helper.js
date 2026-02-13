// utils/theme-helper.js

import { $ } from './jquery-helper.js';

const STORAGE_KEY = 'portfolio-theme';

export function handleTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  
  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    // Use system preference as default
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
}

function setTheme(theme) {
  $('html').attr('data-theme', theme);
}

export function toggleTheme() {
  const currentTheme = $('html').attr('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  localStorage.setItem(STORAGE_KEY, newTheme);
}