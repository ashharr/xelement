// Detect input fields and generate data
function detectInputFields() {
    const fields = [];
    const inputElements = document.querySelectorAll('input, textarea, select');

    inputElements.forEach(el => {
        const tagName = el.tagName.toLowerCase();
        const type = el.type || 'select'; // type is not applicable for select
        const name = el.name || '';
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
