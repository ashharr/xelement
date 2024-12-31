// Detect input fields and generate data
function detectInputFields() {
    const fields = [];
    const elements = document.querySelectorAll('input, textarea, select, button, a[href]');

    elements.forEach(el => {
        const tagName = el.tagName.toLowerCase();
        let type = '';
        let name = '';
        
        // Detect input, textarea, select types
        if (tagName === 'input') {
            type = el.type || 'text';
            name = el.name || '';
        } else if (tagName === 'textarea') {
            type = 'textarea';
            name = el.name || '';
        } else if (tagName === 'select') {
            type = 'select';
            name = el.name || '';
        } 
        // For button elements
        else if (tagName === 'button') {
            type = 'button';
            name = el.name || '';
        }
        // For <a> elements with href
        else if (tagName === 'a' && el.hasAttribute('href')) {
            type = 'link';
            name = el.href || '';
        }

        const xpath = generateXPath(el);

        fields.push({
            type,
            name,
            xpath
        });
    });

    return fields;
}

// Generate XPath for an element
function generateXPath(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return '';
    const parts = [];
    while (element.nodeType === Node.ELEMENT_NODE) {
        let index = 1;
        let sibling = element.previousElementSibling;
        while (sibling) {
            if (sibling.tagName === element.tagName) index++;
            sibling = sibling.previousElementSibling;
        }
        const tagName = element.tagName.toLowerCase();
        parts.unshift(`${tagName}[${index}]`);
        element = element.parentNode;
    }
    return '/' + parts.join('/');
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message === 'getInputFields') {
        const fields = detectInputFields();
        sendResponse(fields);
    }
});
