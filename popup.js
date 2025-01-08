document.addEventListener("DOMContentLoaded", () => {
  // Request input fields from the content script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, "getInputFields", (fields) => {
      if (chrome.runtime.lastError) {
        console.error("Error:", chrome.runtime.lastError.message);
        return;
      }

      // Populate the table with detected fields
      const tableBody = document
        .getElementById("fieldsTable")
        .getElementsByTagName("tbody")[0];
      tableBody.innerHTML = ""; // Clear existing rows
      fields.forEach((field) => {
        const row = tableBody.insertRow();
        const shortenedXPath = shortenXPath(field.xpath);

        row.innerHTML = `
                    <td>${field.type}</td>
                    <td class="xpath-cell">
                        <span class="short-xpath">${shortenedXPath}</span>
                        <span class="full-xpath" style="display: none;">${
                          field.xpath
                        }</span>
                        <button class="toggle-xpath-btn small-btn">Expand</button>
                        <button class="copy-xpath-btn small-btn" title="Copy XPath">
                            Copy Element
                        </button>
                    </td>
                    <td>${field.name || "(Unnamed)"}</td>
                `;
      });

      // Add toggle functionality for XPath display
      document.querySelectorAll(".toggle-xpath-btn").forEach((button) => {
        button.addEventListener("click", (event) => {
          const cell = event.target.closest(".xpath-cell");
          const shortXPath = cell.querySelector(".short-xpath");
          const fullXPath = cell.querySelector(".full-xpath");
          const isExpanded = fullXPath.style.display === "inline";

          if (isExpanded) {
            fullXPath.style.display = "none";
            shortXPath.style.display = "inline";
            event.target.textContent = "Expand";
          } else {
            fullXPath.style.display = "inline";
            shortXPath.style.display = "none";
            event.target.textContent = "Collapse";
          }
        });
      });

      // Add copy functionality for XPath
      document.querySelectorAll(".copy-xpath-btn").forEach((button) => {
        button.addEventListener("click", (event) => {
          const cell = event.target.closest(".xpath-cell");
          const fullXPath = cell.querySelector(".full-xpath");
          const shortXPath = cell.querySelector(".short-xpath");
          const xpathToCopy =
            fullXPath.style.display === "inline"
              ? fullXPath.textContent
              : shortXPath.textContent;

          navigator.clipboard
            .writeText(xpathToCopy)
            .then(() => {
              alert("XPath copied to clipboard!");
            })
            .catch((err) => {
              console.error("Error copying XPath:", err);
            });
        });
      });

      // Attach Export to CSV functionality
      document.getElementById("exportButton").addEventListener("click", () => {
        exportCSV(fields);
      });
    });
  });
});

// Function to shorten the XPath
function shortenXPath(xpath) {
  const parts = xpath.split("/");
  if (parts.length > 4) {
    return parts.slice(0, 3).join("/") + "/...";
  }
  return xpath;
}

// Function to export data to CSV
function exportCSV(fields) {
  const header = ["Type", "XPath", "Name"];
  const rows = fields.map((field) => [
    field.type, // Type (button, link, input, etc.)
    field.xpath, // Full XPath (use this for CSV)
    field.name || "(Unnamed)", // Fallback to '(Unnamed)' if no name is found
  ]);

  let csvContent = "data:text/csv;charset=utf-8," + header.join(",") + "\n";
  rows.forEach((row) => {
    csvContent += row.join(",") + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "input_fields.csv");
  document.body.appendChild(link);
  link.click();
}
