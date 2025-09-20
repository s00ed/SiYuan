// INSTANT TEXT DIRECTION DETECTION - No Delays
(function() {
    'use strict';
    
    // Fast direction detection - only first few characters
    function getDirection(text) {
        if (!text) return 'ltr';
        
        // Get first 20 characters only
        const start = text.trim().substring(0, 20);
        
        // Remove spaces and punctuation
        const letters = start.replace(/[^\u0600-\u06FFa-zA-Z]/g, '');
        
        if (!letters) return 'ltr';
        
        // Check first 2 letters only
        const firstTwo = letters.substring(0, 2);
        const isArabic = /[\u0600-\u06FF]/.test(firstTwo);
        
        return isArabic ? 'rtl' : 'ltr';
    }
    
    // Instant style application
    function applyDirection(element, direction) {
        if (!element) return;
        
        element.style.direction = direction;
        element.style.textAlign = direction === 'rtl' ? 'right' : 'left';
    }
    
    // Process single element instantly
    function processElement(element) {
        if (!element) return;
        
        // Skip code
        if (element.querySelector('code, pre')) return;
        
        const text = element.textContent || '';
        const direction = getDirection(text);
        applyDirection(element, direction);
    }
    
    // Process all content instantly
    function processAll() {
        // All in one query for speed
        const allElements = document.querySelectorAll(`
            .protyle-wysiwyg [data-node-id],
            .protyle-title,
            [data-type="NodeHeading"],
            .protyle-wysiwyg h1, .protyle-wysiwyg h2, .protyle-wysiwyg h3,
            .protyle-wysiwyg h4, .protyle-wysiwyg h5, .protyle-wysiwyg h6
        `);
        
        // Process all at once
        allElements.forEach(processElement);
    }
    
    // INSTANT input handling - no delays!
    function handleInput(e) {
        if (!e.target.closest('.protyle-wysiwyg')) return;
        
        const element = e.target.closest('[data-node-id]') || e.target.closest('.protyle-title');
        if (element) {
            // Process immediately while typing
            processElement(element);
        }
    }
    
    // Setup instant event handling
    document.addEventListener('input', handleInput);
    document.addEventListener('keyup', handleInput);
    document.addEventListener('compositionend', handleInput);
    
    // Process immediately on load
    processAll();
    
    // Process new elements immediately
    const observer = new MutationObserver(() => {
        // No setTimeout - process immediately
        processAll();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Slash menu - instant
    document.addEventListener('keydown', (e) => {
        if (e.key === '/') {
            // Process menu items immediately when they appear
            setTimeout(() => {
                document.querySelectorAll('.b3-menu__item, .protyle-hint__item').forEach(processElement);
            }, 50); // Only 50ms delay for menu
        }
    });
    
    // Quick periodic check
    setInterval(processAll, 1000); // Every 1 second instead of 3-5 seconds
    
    console.log('⚡ INSTANT text direction detection loaded');
    console.log('🚀 No delays - processes immediately');
})();
