// animation-helper.js

import { $ } from './jquery-helper.js';
 
// Typing Animation
export function handleTypingAnimation() {
  const languages = ['C#.', 'Kotlin.', 'JavaScript.', 'SQL.'];
  let currentIndex = 0;
  let currentText = '';
  let isDeleting = false;
  let timeout = 500;
  const typingSpeed = 150;
  const deletingSpeed = 100;
  const pauseDuration = 2000;
  
  const type = () => {
    const fullText = languages[currentIndex];
    const $typedElement = $('#typed-text');
      
    if (isDeleting) {
      currentText = fullText.substring(0, currentText.length - 1);
    } else {
      currentText = fullText.substring(0, currentText.length + 1);
    }
      
    $typedElement.text(currentText);
    timeout = isDeleting ? deletingSpeed : typingSpeed;
      
    if (!isDeleting && currentText === fullText) {
      // Finished typing, pause then start deleting
      timeout = pauseDuration;
      isDeleting = true;
    } else if (isDeleting && currentText === '') {
      // Finished deleting, move to next word
      isDeleting = false;
      currentIndex = (currentIndex + 1) % languages.length;
      timeout = 500;
    }

    setTimeout(type, timeout);
  }
  setTimeout(type, timeout);
}

// Smooth Scroll for Navigation Links
export function handleSmoothScroll() {
  $('a[href^="#"]').on('click', function(e) {
    e.preventDefault();
    const target = $($(this).attr('href'));
    
    if (target.length) {
      $('html, body').animate({
        scrollTop: target.offset().top - 20
      }, 800);
    }
  });
}