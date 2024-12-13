document.addEventListener('DOMContentLoaded', () => {
    // Request input fields from the content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, 'getInputFields', (fields) => {
            if (chrome.runtime.lastError) {
                console.error('Error:', chrome.runtime.lastError.message);
                return;
            }

            // Populate the table with detected fields
            const tableBody = document.getElementById('fieldsTable').getElementsByTagName('tbody')[0];
            tableBody.innerHTML = ''; // Clear existing rows
            fields.forEach(field => {
                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td>${field.type}</td>
                    <td>${field.xpath}</td>
                    <td>${field.name || '(Unnamed)'}</td>
                `;
            });

            // Attach Export to CSV functionality
            document.getElementById('exportButton').addEventListener('click', () => {
                exportCSV(fields);
            });
        });
    });
});

// Function to export data to CSV
function exportCSV(fields) {
    const header = ['Type', 'XPath', 'Name'];
    const rows = fields.map(field => [field.type, field.xpath, field.name]);

    let csvContent = "data:text/csv;charset=utf-8," + header.join(",") + "\n";
    rows.forEach(row => {
        csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "input_fields.csv");
    document.body.appendChild(link);
    link.click();
}
