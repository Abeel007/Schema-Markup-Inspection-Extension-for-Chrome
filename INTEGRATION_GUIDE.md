# Schema Markup Inspector - Integration Guide

## Quick Integration Steps

### 1. Extract Core Functionality
Copy the `SchemaInspector` class from `content.js` into your existing extension:

```javascript
// Add this class to your existing content script or create a new module
class SchemaInspector {
  constructor() {
    this.schemaData = {};
  }
  
  inspectSchema() {
    this.schemaData = {};
    this.detectJsonLD();
    this.detectMicrodata();
    this.detectRDFa();
    return this.schemaData;
  }
  
  // ... rest of the methods from content.js
}
```

### 2. Add to Your Existing UI
Integrate the schema inspection button into your existing popup:

```javascript
// In your existing popup.js
document.getElementById('yourExistingButton').addEventListener('click', async function() {
  // Your existing functionality
  // ...
  
  // Add schema inspection
  const schemaData = await inspectSchemaOnPage();
  displaySchemaData(schemaData);
});

async function inspectSchemaOnPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const response = await chrome.tabs.sendMessage(tab.id, { action: 'inspectSchema' });
  return response.data;
}
```

### 3. Style Integration
Adapt the CSS from `popup.html` to match your existing extension's design:

```css
/* Add these styles to your existing CSS */
.schema-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.schema-type {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.schema-field {
  margin-bottom: 6px;
  font-size: 13px;
}

.schema-field-label {
  font-weight: 500;
  color: #555;
  display: inline-block;
  min-width: 100px;
}
```

### 4. Message Handling
Add schema inspection to your existing message handler:

```javascript
// In your existing content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'inspectSchema') {
    const schemaInspector = new SchemaInspector();
    const schemaData = schemaInspector.inspectSchema();
    sendResponse({ success: true, data: schemaData });
  }
  
  // Your existing message handling
  // ...
});
```

## Data Format
The schema data is returned as a clean object structure that can be easily integrated into your existing display logic:

```javascript
{
  "Article": {
    "headline": "Page Title",
    "author": "Author Name",
    "datePublished": "2024-01-01",
    "wordCount": 1250
  },
  "Organization": {
    "name": "Company Name",
    "address": "Full Address",
    "telephone": "Phone Number"
  }
}
```

## Testing
1. Load the standalone extension first to test functionality
2. Test on various websites with different schema types
3. Verify the data structure matches your needs
4. Integrate the core functionality into your existing extension
5. Test the integrated version thoroughly

## Customization Options
- Modify the schema types detected by editing the `processSchemaSpecific` method
- Add custom field processing for your specific needs
- Adjust the UI styling to match your extension's design
- Add additional schema.org types as needed
