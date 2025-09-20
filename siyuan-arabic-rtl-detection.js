// SMART TEXT DIRECTION - v2
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
    
    // Check if element has manual SiYuan styling applied
    function hasManualStyling(element) {
        if (!element) return false;
        
        // Check for SiYuan's built-in classes and attributes
        const manualClasses = [
            'text-align-left',
            'text-align-center', 
            'text-align-right',
            'text-align-justify',
            'direction-ltr',
            'direction-rtl'
        ];
        
        // Check classes
        const hasManualClass = manualClasses.some(cls => element.classList.contains(cls));
        if (hasManualClass) return true;
        
        // Check inline styles that user might have set manually
        const style = element.style;
        
        // If user manually set text-align or direction, respect it
        if (style.textAlign && style.textAlign !== '' && 
            !['left', 'right'].includes(style.textAlign)) {
            // User set center or justify - don't override
            return true;
        }
        
        // Check for SiYuan attributes
        if (element.hasAttribute('data-align') || 
            element.hasAttribute('data-direction') ||
            element.hasAttribute('style') && 
            (element.getAttribute('style').includes('text-align: center') ||
             element.getAttribute('style').includes('text-align: justify'))) {
            return true;
        }
        
        // Check parent for manual styling
        const parent = element.closest('[data-node-id]');
        if (parent && parent !== element) {
            return hasManualStyling(parent);
        }
        
        return false;
    }
    
    // Smart style application that respects manual settings
    function applyDirection(element, direction) {
        if (!element) return;
        
        // IMPORTANT: Don't override if user has manual settings
        if (hasManualStyling(element)) {
            console.log('⚠️ Skipping element with manual styling:', element);
            return; // Respect user's manual choice
        }
        
        // Only apply if not manually styled
        element.style.direction = direction;
        element.style.textAlign = direction === 'rtl' ? 'right' : 'left';
        
        // Add a data attribute to mark as auto-styled
        element.setAttribute('data-auto-direction', direction);
    }
    
    // Process single element with respect for manual settings
    function processElement(element) {
        if (!element) return;
        
        // Skip code blocks
        if (element.querySelector('code, pre')) return;
        
        // Skip if manually styled by user
        if (hasManualStyling(element)) return;
        
        const text = element.textContent || '';
        const direction = getDirection(text);
        applyDirection(element, direction);
    }
    
    // Process all content
    function processAll() {
        const allElements = document.querySelectorAll(`
            .protyle-wysiwyg [data-node-id],
            .protyle-title,
            [data-type="NodeHeading"],
            .protyle-wysiwyg h1, .protyle-wysiwyg h2, .protyle-wysiwyg h3,
            .protyle-wysiwyg h4, .protyle-wysiwyg h5, .protyle-wysiwyg h6
        `);
        
        allElements.forEach(processElement);
    }
    
    // Handle input with respect for manual changes
    function handleInput(e) {
        if (!e.target.closest('.protyle-wysiwyg')) return;
        
        const element = e.target.closest('[data-node-id]') || e.target.closest('.protyle-title');
        if (element) {
            // Check if this was a manual style change by user
            if (hasManualStyling(element)) {
                // User is manually styling - remove our auto direction
                element.removeAttribute('data-auto-direction');
                return;
            }
            
            // Only auto-style if no manual styling
            processElement(element);
        }
    }
    
    // Listen for SiYuan's formatting toolbar usage
    function handleToolbarUsage() {
        // When user clicks formatting buttons, respect their choice
        const toolbarButtons = document.querySelectorAll(`
            .toolbar__item[data-type="text-align-left"],
            .toolbar__item[data-type="text-align-center"],
            .toolbar__item[data-type="text-align-right"],
            .toolbar__item[data-type="text-align-justify"],
            .protyle-toolbar [data-type*="align"],
            .protyle-toolbar [data-type*="direction"]
        `);
        
        toolbarButtons.forEach(button => {
            button.addEventListener('click', () => {
                // User used manual formatting - stop auto-detection for a moment
                setTimeout(() => {
                    // Re-scan but respect manual settings
                    processAll();
                }, 200);
            });
        });
    }
    
    // Setup event handling
    document.addEventListener('input', handleInput);
    document.addEventListener('keyup', handleInput);
    document.addEventListener('compositionend', handleInput);
    
    // Listen for manual formatting changes
    document.addEventListener('click', (e) => {
        // If user clicked formatting buttons, respect their choice
        if (e.target.closest('.protyle-toolbar') || 
            e.target.closest('.toolbar__item')) {
            setTimeout(processAll, 300); // Re-process after toolbar action
        }
    });
    
    // Process immediately on load
    processAll();
    
    // Setup toolbar listeners
    setTimeout(handleToolbarUsage, 1000);
    
    // Process new elements with respect for manual styling
    const observer = new MutationObserver((mutations) => {
        let needsProcessing = false;
        
        mutations.forEach(mutation => {
            // Check if new elements were added
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                needsProcessing = true;
            }
            
            // Check if attributes changed (manual styling)
            if (mutation.type === 'attributes' && 
                (mutation.attributeName === 'style' || 
                 mutation.attributeName === 'class')) {
                needsProcessing = true;
            }
        });
        
        if (needsProcessing) {
            processAll();
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'data-align', 'data-direction']
    });
    
    // Slash menu
    document.addEventListener('keydown', (e) => {
        if (e.key === '/') {
            setTimeout(() => {
                document.querySelectorAll('.b3-menu__item, .protyle-hint__item').forEach(processElement);
            }, 50);
        }
    });
    
    // Quick periodic check
    setInterval(processAll, 2000);
    
    console.log('✅ SMART text direction detection loaded');
    console.log('🎯 Respects SiYuan manual formatting');
    console.log('⚙️ Auto-detects only when no manual styling');
    console.log('🛡️ Preserves user layout choices');
})();
