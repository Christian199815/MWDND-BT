 //got this from an AI Prompt
  // This script runs immediately to prevent FOUC (Flash of Unstyled Content)
  (function() {
    // Default to no-js mode, which will be overridden if JS is enabled
    document.documentElement.className = 'no-js';
    
    // Immediately add a JS class if JavaScript is running
    if (typeof document.createElement('script').async !== 'undefined') {
      document.documentElement.className = document.documentElement.className.replace(/\bno-js\b/g, 'js-enabled');
    }
  })();