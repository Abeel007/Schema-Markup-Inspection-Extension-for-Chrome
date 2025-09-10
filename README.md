# Schema Markup Inspector - Chrome Extension

## Overview
A standalone Chrome extension that inspects and analyzes schema.org markup on web pages. This tool detects JSON-LD, Microdata, and RDFa structured data formats and presents the information in a clean, organized interface.

## Features

### 🌐 Universal Schema Detection
- **JSON-LD**: Detects `<script type="application/ld+json">` elements
- **Microdata**: Parses `itemscope`, `itemtype`, and `itemprop` attributes
- **RDFa**: Extracts `typeof` and `property` attributes

### 📊 Schema Types Supported
- **Article/BlogPosting**: headline, author, publisher, datePublished, wordCount
- **Organization/LocalBusiness**: address, contact info, opening hours, geo coordinates
- **Product**: brand, price, offers, ratings, reviews
- **Event**: dates, location, organizer, ticket information
- **FAQ**: questions and answers
- **HowTo**: steps, supplies, tools
- **BreadcrumbList**: navigation hierarchy

### 🎨 Clean UI
- Organized by schema type with intuitive icons
- Readable field labels and values
- Clickable URLs and links
- Responsive design matching modern Chrome extension standards

## Installation & Testing

### 1. Load Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `spider-crawler` folder containing the extension files

### 2. Test the Extension
1. Navigate to any webpage with schema markup (try: news sites, e-commerce sites, local business pages)
2. Click the extension icon in the Chrome toolbar
3. Click "Inspect Current Page" button
4. View the detected schema data in organized sections

### 3. Test Pages
- **News Articles**: CNN, BBC, New York Times
- **E-commerce**: Amazon product pages, Shopify stores
- **Local Business**: Google My Business pages, restaurant websites
- **Events**: Eventbrite, Meetup event pages

## File Structure

```
spider-crawler/
├── manifest.json          # Extension manifest (Manifest V3)
├── popup.html             # Extension popup interface
├── popup.js               # Popup functionality
├── content.js             # Content script for schema detection
├── background.js          # Service worker
├── icons/                 # Extension icons (placeholder)
└── README.md              # This documentation
```

## Integration Instructions

### For Integration into Existing Extension

1. **Copy Core Files**:
   - `content.js` - Contains the main `SchemaInspector` class
   - Schema detection logic can be extracted into a separate module

2. **Key Integration Points**:
   ```javascript
   // In your existing content script or popup
   const schemaInspector = new SchemaInspector();
   const schemaData = schemaInspector.inspectSchema();
   ```

3. **UI Integration**:
   - The popup HTML/CSS can be adapted to match your existing extension's style
   - Schema data structure is consistent and can be easily integrated

4. **Message Handling**:
   ```javascript
   // Listen for schema inspection requests
   chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
     if (request.action === 'inspectSchema') {
       const schemaData = schemaInspector.inspectSchema();
       sendResponse({ success: true, data: schemaData });
     }
   });
   ```

## Schema Data Structure

The extension returns data in this format:

```javascript
{
  "Article": {
    "headline": "Article Title",
    "author": "Author Name",
    "datePublished": "2024-01-01",
    "wordCount": 1250,
    "url": "https://example.com/article"
  },
  "Organization": {
    "name": "Company Name",
    "address": "123 Main St, City, State",
    "telephone": "+1-555-0123",
    "url": "https://example.com"
  },
  "Product": {
    "name": "Product Name",
    "brand": "Brand Name",
    "price": "29.99",
    "priceCurrency": "USD",
    "rating": "4.5"
  }
}
```

## Technical Details

### Schema Detection Methods

1. **JSON-LD Detection**:
   - Searches for `<script type="application/ld+json">` elements
   - Parses JSON content and extracts `@type` and properties
   - Handles both single objects and arrays

2. **Microdata Detection**:
   - Finds elements with `itemscope` attribute
   - Extracts `itemtype` to determine schema type
   - Collects `itemprop` attributes and their values

3. **RDFa Detection**:
   - Locates elements with `typeof` attribute
   - Extracts `property` attributes and values
   - Handles nested RDFa structures

### Error Handling
- Graceful handling of malformed JSON-LD
- Fallback for missing or invalid schema data
- Console logging for debugging purposes

### Performance
- Lightweight content script injection
- Efficient DOM querying using modern selectors
- Minimal memory footprint

## Browser Compatibility
- Chrome (Manifest V3)
- Edge (Chromium-based)
- Other Chromium-based browsers

## Future Enhancements
- Schema validation against schema.org specifications
- Export functionality (JSON, CSV)
- Bulk page analysis
- Schema markup suggestions
- Integration with Google Search Console

## Support
For integration assistance or customization requests, refer to the code comments and this documentation. The extension is designed to be modular and easily adaptable to existing Chrome extension architectures.
