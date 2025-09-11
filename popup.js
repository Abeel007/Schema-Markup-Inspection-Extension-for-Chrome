// Popup script for Schema Markup Inspector
document.addEventListener('DOMContentLoaded', function() {
  const inspectBtn = document.getElementById('inspectBtn');
  const copyBtn = document.getElementById('copyBtn');
  const statusDiv = document.getElementById('status');
  const resultsDiv = document.getElementById('results');
  
  let currentSchemaData = null;
  
  function showStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
  }
  
  function hideStatus() {
    statusDiv.style.display = 'none';
  }
  
  function showResults(schemaData) {
    currentSchemaData = schemaData;
    resultsDiv.innerHTML = '';
    
    if (!schemaData || Object.keys(schemaData).length === 0) {
      resultsDiv.innerHTML = '<div class="no-schema">No schema markup found on this page</div>';
      copyBtn.style.display = 'none';
    } else {
      Object.keys(schemaData).forEach(schemaType => {
        const section = createSchemaSection(schemaType, schemaData[schemaType]);
        resultsDiv.appendChild(section);
      });
      copyBtn.style.display = 'block';
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
            value.innerHTML = fieldInfo.value.map((item, index) => {
              let itemContent;
              if (typeof item === 'object' && item !== null) {
                // Handle specific object types
                if (item.question && item.answer) {
                  itemContent = `Q: ${item.question}\nA: ${item.answer}`;
                } else if (item.name && item.url && item.position) {
                  itemContent = `${item.position}. ${item.name} (${item.url})`;
                } else if (item.name && item.url) {
                  itemContent = `${item.name} (${item.url})`;
                } else if (item.text) {
                  itemContent = item.text;
                } else if (item.stepNumber && item.name) {
                  itemContent = `Step ${item.stepNumber}: ${item.name}`;
                } else {
                  itemContent = JSON.stringify(item, null, 2);
                }
              } else {
                itemContent = item;
              }
              return `<div class="array-item">${itemContent}</div>`;
            }).join('');
          } else {
            // Handle long text with truncation
            const textValue = String(fieldInfo.value);
            if (textValue.length > 200) {
              const truncated = textValue.substring(0, 200) + '...';
              value.innerHTML = `<span class="truncated-text">${truncated}</span><button class="expand-btn">Show more</button><button class="collapse-btn" style="display:none;">Show less</button>`;
              
              // Add event listeners for expand/collapse buttons
              const expandBtn = value.querySelector('.expand-btn');
              const collapseBtn = value.querySelector('.collapse-btn');
              const truncatedSpan = value.querySelector('.truncated-text');
              
              expandBtn.addEventListener('click', function() {
                truncatedSpan.textContent = textValue;
                truncatedSpan.classList.add('expanded');
                expandBtn.style.display = 'none';
                collapseBtn.style.display = 'inline';
              });
              
              collapseBtn.addEventListener('click', function() {
                truncatedSpan.textContent = truncated;
                truncatedSpan.classList.remove('expanded');
                collapseBtn.style.display = 'none';
                expandBtn.style.display = 'inline';
              });
            } else {
              value.textContent = fieldInfo.value;
            }
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
      
      let displayValue;
      if (isArray) {
        displayValue = value;
      } else if (typeof value === 'object' && value !== null) {
        // Handle different object types more gracefully
        if (value.text || value.name || value.url) {
          // For simple objects with common properties, show the most relevant field
          displayValue = value.text || value.name || value.url || JSON.stringify(value, null, 2);
        } else {
          displayValue = JSON.stringify(value, null, 2);
        }
      } else {
        displayValue = value;
      }
      
      groups[groupName].push({
        key: key,
        value: displayValue,
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
  
  // Add event listener for copy button
  copyBtn.addEventListener('click', function() {
    copyToClipboard();
  });

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
          // Content script injection failed
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
    copyBtn.style.display = 'none';
  }
  
  function copyToClipboard() {
    if (!currentSchemaData) return;
    
    let copyText = '';
    Object.keys(currentSchemaData).forEach(schemaType => {
      copyText += `${getSchemaIcon(schemaType)} ${schemaType}\n`;
      copyText += 'Core Information\n';
      
      const data = currentSchemaData[schemaType];
      Object.keys(data).forEach(key => {
        const value = data[key];
        let displayValue;
        
        if (Array.isArray(value)) {
          displayValue = value.map((item, index) => {
            if (typeof item === 'object' && item !== null) {
              if (item.question && item.answer) {
                return `${index + 1}. Q: ${item.question}\n   A: ${item.answer}`;
              } else if (item.name && item.url && item.position) {
                return `${index + 1}. ${item.position}. ${item.name} (${item.url})`;
              } else if (item.name && item.url) {
                return `${index + 1}. ${item.name} (${item.url})`;
              } else if (item.text) {
                return `${index + 1}. ${item.text}`;
              } else if (item.stepNumber && item.name) {
                return `${index + 1}. Step ${item.stepNumber}: ${item.name}`;
              } else {
                return `${index + 1}. ${JSON.stringify(item)}`;
              }
            } else {
              return `${index + 1}. ${item}`;
            }
          }).join('\n');
        } else if (typeof value === 'object' && value !== null) {
          if (value.text || value.name || value.url) {
            displayValue = value.text || value.name || value.url;
          } else {
            displayValue = JSON.stringify(value, null, 2);
          }
        } else {
          displayValue = value;
        }
        
        copyText += `${key}: ${displayValue}\n`;
      });
      copyText += '\n';
    });
    
    navigator.clipboard.writeText(copyText).then(() => {
      showStatus('Results copied to clipboard!', 'success');
      setTimeout(hideStatus, 2000);
    }).catch(err => {
      showStatus('Failed to copy to clipboard', 'error');
    });
  };
});
