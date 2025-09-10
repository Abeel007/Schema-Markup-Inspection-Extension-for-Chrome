// Popup script for Schema Markup Inspector
document.addEventListener('DOMContentLoaded', function() {
  const inspectBtn = document.getElementById('inspectBtn');
  const statusDiv = document.getElementById('status');
  const resultsDiv = document.getElementById('results');
  
  function showStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
  }
  
  function hideStatus() {
    statusDiv.style.display = 'none';
  }
  
  function showResults(schemaData) {
    resultsDiv.innerHTML = '';
    
    if (!schemaData || Object.keys(schemaData).length === 0) {
      resultsDiv.innerHTML = '<div class="no-schema">No schema markup found on this page</div>';
    } else {
      Object.keys(schemaData).forEach(schemaType => {
        const section = createSchemaSection(schemaType, schemaData[schemaType]);
        resultsDiv.appendChild(section);
      });
    }
    
    resultsDiv.style.display = 'block';
  }
  
  function createSchemaSection(type, data) {
    const section = document.createElement('div');
    section.className = 'schema-section';
    
    const typeHeader = document.createElement('div');
    typeHeader.className = 'schema-type';
    typeHeader.innerHTML = `<span class="icon">${getSchemaIcon(type)}</span>${type}`;
    section.appendChild(typeHeader);
    
    // Group fields by category for better organization
    const fieldGroups = organizeFieldsByCategory(type, data);
    
    Object.keys(fieldGroups).forEach(groupName => {
      if (fieldGroups[groupName].length > 0) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'field-group';
        
        const groupHeader = document.createElement('div');
        groupHeader.className = 'field-group-header';
        groupHeader.textContent = groupName;
        groupDiv.appendChild(groupHeader);
        
        fieldGroups[groupName].forEach(fieldInfo => {
          const field = document.createElement('div');
          field.className = 'schema-field';
          
          const label = document.createElement('span');
          label.className = 'schema-field-label';
          label.textContent = `${fieldInfo.key}:`;
          
          const value = document.createElement('span');
          value.className = 'schema-field-value';
          
          if (fieldInfo.isUrl) {
            value.className += ' url';
            value.textContent = fieldInfo.value;
          } else if (fieldInfo.isArray) {
            value.innerHTML = fieldInfo.value.map(item => 
              `<div class="array-item">${item}</div>`
            ).join('');
          } else {
            value.textContent = fieldInfo.value;
          }
          
          field.appendChild(label);
          field.appendChild(value);
          groupDiv.appendChild(field);
        });
        
        section.appendChild(groupDiv);
      }
    });
    
    return section;
  }
  
  function organizeFieldsByCategory(type, data) {
    const groups = {
      'Core Information': [],
      'Content Details': [],
      'Contact & Location': [],
      'Pricing & Offers': [],
      'Reviews & Ratings': [],
      'Additional Data': []
    };
    
    Object.keys(data).forEach(key => {
      const value = data[key];
      const isUrl = key.toLowerCase().includes('url') || key.toLowerCase().includes('link');
      const isArray = Array.isArray(value);
      
      let groupName = 'Additional Data';
      
      // Categorize fields based on schema type and field name
      if (['@context', '@type', 'name', 'description', 'url', 'inLanguage', 'mainEntityOfPage'].includes(key)) {
        groupName = 'Core Information';
      } else if (['headline', 'image', 'author', 'publisher', 'datePublished', 'dateModified', 'articleBody', 'wordCount'].includes(key)) {
        groupName = 'Content Details';
      } else if (['address', 'telephone', 'openingHours', 'sameAs', 'contactPoint', 'geo', 'location', 'organizer'].includes(key)) {
        groupName = 'Contact & Location';
      } else if (['offers', 'price', 'priceCurrency', 'availability', 'brand', 'sku', 'gtin', 'mpn'].includes(key)) {
        groupName = 'Pricing & Offers';
      } else if (['aggregateRating', 'review', 'rating', 'ratingCount'].includes(key)) {
        groupName = 'Reviews & Ratings';
      }
      
      groups[groupName].push({
        key: key,
        value: isArray ? value : (typeof value === 'object' ? JSON.stringify(value, null, 2) : value),
        isUrl: isUrl,
        isArray: isArray
      });
    });
    
    return groups;
  }
  
  function getSchemaIcon(type) {
    const icons = {
      'Article': '📰',
      'BlogPosting': '📝',
      'Organization': '🏢',
      'LocalBusiness': '🏪',
      'Product': '🛒',
      'Service': '🔧',
      'Event': '📅',
      'FAQPage': '❓',
      'HowTo': '📋',
      'BreadcrumbList': '🍞',
      'Person': '👤',
      'WebPage': '🌐',
      'WebSite': '🌍'
    };
    return icons[type] || '📄';
  }
  
  inspectBtn.addEventListener('click', async function() {
    inspectBtn.disabled = true;
    showStatus('Analyzing page for schema markup...', 'info');
    hideResults();
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Check if we're on a valid webpage
      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('moz-extension://')) {
        showStatus('Please navigate to a valid webpage to inspect schema markup.', 'error');
        inspectBtn.disabled = false;
        return;
      }
      
      // Check if content script is already loaded
      try {
        const testResponse = await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
        if (testResponse && testResponse.success) {
          // Content script is already loaded
        }
      } catch (pingError) {
        // Content script not loaded, try to inject it
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          // Wait a moment for the script to initialize
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (injectError) {
          console.log('Content script injection failed:', injectError.message);
        }
      }
      
      // Try to send message to content script with timeout
      const response = await Promise.race([
        chrome.tabs.sendMessage(tab.id, { action: 'inspectSchema' }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]);
      
      if (response && response.success) {
        showStatus(`Found ${Object.keys(response.data).length} schema types`, 'success');
        showResults(response.data);
      } else {
        showStatus('No schema markup found on this page', 'info');
        showResults({});
      }
    } catch (error) {
      console.error('Error:', error);
      
      if (error.message === 'Timeout') {
        showStatus('Content script not responding. Please refresh the page and try again.', 'error');
      } else if (error.message.includes('Receiving end does not exist')) {
        showStatus('Content script not loaded. Please refresh the page and try again.', 'error');
      } else {
        showStatus('Error analyzing page. Please refresh the page and try again.', 'error');
      }
      
      showResults({});
    } finally {
      inspectBtn.disabled = false;
    }
  });
  
  function hideResults() {
    resultsDiv.style.display = 'none';
  }
});
