// Content script for Schema Markup Inspector
// This script runs on every webpage and handles schema detection

// Prevent multiple script injections
if (typeof window.schemaInspectorLoaded === 'undefined') {
  window.schemaInspectorLoaded = true;

class SchemaInspector {
  constructor() {
    this.schemaData = {};
    this.isReady = false;
  }
  
  // Initialize the inspector
  init() {
    this.isReady = true;
    console.log('Schema Inspector initialized');
  }
  
  // Main inspection method
  inspectSchema() {
    if (!this.isReady) {
      this.init();
    }
    
    this.schemaData = {};
    
    // Detect JSON-LD
    this.detectJsonLD();
    
    // Detect Microdata
    this.detectMicrodata();
    
    // Detect RDFa
    this.detectRDFa();
    
    return this.schemaData;
  }
  
  // Detect JSON-LD structured data
  detectJsonLD() {
    const jsonLDScripts = document.querySelectorAll('script[type="application/ld+json"]');
    
    jsonLDScripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent);
        const schemas = Array.isArray(data) ? data : [data];
        
        schemas.forEach(schema => {
          if (schema['@type']) {
            const type = Array.isArray(schema['@type']) ? schema['@type'][0] : schema['@type'];
            this.processSchema(type, schema);
          }
        });
      } catch (error) {
        console.warn('Error parsing JSON-LD:', error);
      }
    });
  }
  
  // Detect Microdata
  detectMicrodata() {
    const microdataElements = document.querySelectorAll('[itemscope]');
    
    microdataElements.forEach(element => {
      const itemType = element.getAttribute('itemtype');
      if (itemType) {
        const schemaType = this.extractSchemaTypeFromURL(itemType);
        const data = this.extractMicrodataProperties(element);
        this.processSchema(schemaType, data);
      }
    });
  }
  
  // Detect RDFa
  detectRDFa() {
    const rdfaElements = document.querySelectorAll('[typeof]');
    
    rdfaElements.forEach(element => {
      const typeofAttr = element.getAttribute('typeof');
      if (typeofAttr) {
        const schemaType = this.extractSchemaTypeFromURL(typeofAttr);
        const data = this.extractRDFaProperties(element);
        this.processSchema(schemaType, data);
      }
    });
  }
  
  // Extract schema type from URL
  extractSchemaTypeFromURL(url) {
    if (url.includes('schema.org/')) {
      return url.split('schema.org/')[1].split(' ')[0];
    }
    return url.split('/').pop();
  }
  
  // Extract properties from Microdata element
  extractMicrodataProperties(element) {
    const data = {};
    
    // Get direct properties
    const properties = element.querySelectorAll('[itemprop]');
    properties.forEach(prop => {
      const propName = prop.getAttribute('itemprop');
      const propValue = this.getPropertyValue(prop);
      
      if (data[propName]) {
        if (!Array.isArray(data[propName])) {
          data[propName] = [data[propName]];
        }
        data[propName].push(propValue);
      } else {
        data[propName] = propValue;
      }
    });
    
    return data;
  }
  
  // Extract properties from RDFa element
  extractRDFaProperties(element) {
    const data = {};
    
    // Get direct properties
    const properties = element.querySelectorAll('[property]');
    properties.forEach(prop => {
      const propName = prop.getAttribute('property');
      const propValue = this.getPropertyValue(prop);
      
      if (data[propName]) {
        if (!Array.isArray(data[propName])) {
          data[propName] = [data[propName]];
        }
        data[propName].push(propValue);
      } else {
        data[propName] = propValue;
      }
    });
    
    return data;
  }
  
  // Get property value from element
  getPropertyValue(element) {
    if (element.tagName === 'IMG') {
      return element.src;
    } else if (element.tagName === 'A') {
      return element.href;
    } else if (element.hasAttribute('content')) {
      return element.getAttribute('content');
    } else {
      return element.textContent.trim();
    }
  }
  
  // Process and normalize schema data
  processSchema(type, data) {
    if (!this.schemaData[type]) {
      this.schemaData[type] = {};
    }
    
    // Merge data, handling arrays - but avoid duplicating universal fields
    Object.keys(data).forEach(key => {
      // Skip if this field is already captured as a universal field
      const universalFields = ['@context', '@type', 'name', 'description', 'url', 'inLanguage', 'mainEntityOfPage'];
      if (universalFields.includes(key) && this.schemaData[type][key]) {
        return; // Skip to avoid duplication
      }
      
      if (this.schemaData[type][key]) {
        if (!Array.isArray(this.schemaData[type][key])) {
          this.schemaData[type][key] = [this.schemaData[type][key]];
        }
        if (Array.isArray(data[key])) {
          this.schemaData[type][key] = this.schemaData[type][key].concat(data[key]);
        } else {
          this.schemaData[type][key].push(data[key]);
        }
      } else {
        this.schemaData[type][key] = data[key];
      }
    });
    
    // Apply schema-specific processing
    this.processSchemaSpecific(type, this.schemaData[type]);
  }
  
  // Schema-specific processing
  processSchemaSpecific(type, data) {
    switch (type) {
      case 'Article':
      case 'BlogPosting':
        this.processArticleSchema(data);
        break;
      case 'Organization':
      case 'LocalBusiness':
        this.processOrganizationSchema(data);
        break;
      case 'Product':
        this.processProductSchema(data);
        break;
      case 'Event':
        this.processEventSchema(data);
        break;
      case 'FAQPage':
        this.processFAQSchema(data);
        break;
      case 'HowTo':
        this.processHowToSchema(data);
        break;
      case 'BreadcrumbList':
        this.processBreadcrumbSchema(data);
        break;
      default:
        this.processGenericSchema(data);
    }
  }
  
  // Process Article schema
  processArticleSchema(data) {
    // Extract word count from articleBody if present
    if (data.articleBody) {
      const text = typeof data.articleBody === 'string' ? data.articleBody : 
                   data.articleBody.textContent || '';
      data.wordCount = text.split(/\s+/).length;
    }
    
    // Process author information (Person or Organization)
    if (data.author) {
      if (typeof data.author === 'object') {
        data.authorName = data.author.name || data.author;
        data.authorType = data.author['@type'] || 'Person';
        data.authorUrl = data.author.url;
      } else {
        data.authorName = data.author;
      }
    }
    
    // Process publisher information (with logo)
    if (data.publisher) {
      if (typeof data.publisher === 'object') {
        data.publisherName = data.publisher.name || data.publisher;
        data.publisherLogo = data.publisher.logo || data.publisher.image;
        data.publisherUrl = data.publisher.url;
        data.publisherType = data.publisher['@type'] || 'Organization';
      } else {
        data.publisherName = data.publisher;
      }
    }
    
    // Process image (featured image or gallery)
    if (data.image) {
      if (Array.isArray(data.image)) {
        data.imageGallery = data.image.map(img => 
          typeof img === 'string' ? img : img.url || img
        );
        data.featuredImage = data.imageGallery[0];
      } else if (typeof data.image === 'object') {
        data.featuredImage = data.image.url || data.image;
      } else {
        data.featuredImage = data.image;
      }
    }
  }
  
  // Process Organization schema
  processOrganizationSchema(data) {
    // Process address (streetAddress, addressLocality, addressRegion, postalCode, addressCountry)
    if (data.address && typeof data.address === 'object') {
      const addr = data.address;
      data.streetAddress = addr.streetAddress;
      data.addressLocality = addr.addressLocality;
      data.addressRegion = addr.addressRegion;
      data.postalCode = addr.postalCode;
      data.addressCountry = addr.addressCountry;
      data.fullAddress = [
        addr.streetAddress,
        addr.addressLocality,
        addr.addressRegion,
        addr.postalCode,
        addr.addressCountry
      ].filter(Boolean).join(', ');
    }
    
    // Process contact information
    if (data.contactPoint && typeof data.contactPoint === 'object') {
      data.contactPhone = data.contactPoint.telephone;
      data.contactEmail = data.contactPoint.email;
      data.contactType = data.contactPoint.contactType;
    }
    
    // Process geo coordinates (latitude/longitude)
    if (data.geo && typeof data.geo === 'object') {
      data.latitude = data.geo.latitude;
      data.longitude = data.geo.longitude;
      data.coordinates = `${data.geo.latitude}, ${data.geo.longitude}`;
    }
    
    // Process opening hours
    if (data.openingHours) {
      if (Array.isArray(data.openingHours)) {
        data.openingHoursList = data.openingHours;
      } else {
        data.openingHoursList = [data.openingHours];
      }
    }
    
    // Process sameAs (links to social media, profiles, directories)
    if (data.sameAs) {
      if (Array.isArray(data.sameAs)) {
        data.socialMediaLinks = data.sameAs;
      } else {
        data.socialMediaLinks = [data.sameAs];
      }
    }
    
    // Process logo
    if (data.logo) {
      if (typeof data.logo === 'object') {
        data.logoUrl = data.logo.url || data.logo;
      } else {
        data.logoUrl = data.logo;
      }
    }
  }
  
  // Process Product schema
  processProductSchema(data) {
    // Process offers
    if (data.offers && typeof data.offers === 'object') {
      data.price = data.offers.price;
      data.priceCurrency = data.offers.priceCurrency;
      data.availability = data.offers.availability;
      data.offerUrl = data.offers.url;
      data.offerValidFrom = data.offers.priceValidFrom;
      data.offerValidUntil = data.offers.priceValidUntil;
    }
    
    // Process ratings
    if (data.aggregateRating && typeof data.aggregateRating === 'object') {
      data.rating = data.aggregateRating.ratingValue;
      data.ratingCount = data.aggregateRating.reviewCount;
      data.bestRating = data.aggregateRating.bestRating;
      data.worstRating = data.aggregateRating.worstRating;
    }
    
    // Process reviews
    if (data.review && Array.isArray(data.review)) {
      data.reviews = data.review.map(review => ({
        reviewer: review.author ? review.author.name : 'Anonymous',
        rating: review.reviewRating ? review.reviewRating.ratingValue : null,
        date: review.datePublished,
        text: review.reviewBody
      }));
    } else if (data.review && typeof data.review === 'object') {
      data.reviews = [{
        reviewer: data.review.author ? data.review.author.name : 'Anonymous',
        rating: data.review.reviewRating ? data.review.reviewRating.ratingValue : null,
        date: data.review.datePublished,
        text: data.review.reviewBody
      }];
    }
    
    // Process unique identifiers (sku, gtin, mpn)
    if (data.sku) data.productSku = data.sku;
    if (data.gtin) data.productGtin = data.gtin;
    if (data.mpn) data.productMpn = data.mpn;
    
    // Process brand
    if (data.brand && typeof data.brand === 'object') {
      data.brandName = data.brand.name || data.brand;
      data.brandUrl = data.brand.url;
    } else if (data.brand) {
      data.brandName = data.brand;
    }
  }
  
  // Process Event schema
  processEventSchema(data) {
    // Process location (name + address)
    if (data.location && typeof data.location === 'object') {
      data.locationName = data.location.name;
      if (data.location.address) {
        data.locationAddress = data.location.address;
        if (typeof data.location.address === 'object') {
          data.locationFullAddress = [
            data.location.address.streetAddress,
            data.location.address.addressLocality,
            data.location.address.addressRegion,
            data.location.address.postalCode,
            data.location.address.addressCountry
          ].filter(Boolean).join(', ');
        }
      }
    }
    
    // Process organizer
    if (data.organizer && typeof data.organizer === 'object') {
      data.organizerName = data.organizer.name;
      data.organizerUrl = data.organizer.url;
      data.organizerType = data.organizer['@type'] || 'Organization';
    } else if (data.organizer) {
      data.organizerName = data.organizer;
    }
    
    // Process offers (ticket price, availability)
    if (data.offers && typeof data.offers === 'object') {
      data.ticketPrice = data.offers.price;
      data.ticketCurrency = data.offers.priceCurrency;
      data.ticketAvailability = data.offers.availability;
      data.ticketUrl = data.offers.url;
      data.ticketValidFrom = data.offers.priceValidFrom;
      data.ticketValidUntil = data.offers.priceValidUntil;
    }
    
    // Process event status
    if (data.eventStatus) {
      data.status = data.eventStatus;
    }
  }
  
  // Process FAQ schema
  processFAQSchema(data) {
    if (data.mainEntity && Array.isArray(data.mainEntity)) {
      data.faqItems = data.mainEntity.map(item => ({
        question: item.name,
        answer: item.acceptedAnswer ? item.acceptedAnswer.text : ''
      }));
    }
  }
  
  // Process HowTo schema
  processHowToSchema(data) {
    if (data.step && Array.isArray(data.step)) {
      data.steps = data.step.map((step, index) => ({
        stepNumber: index + 1,
        name: step.name,
        text: step.text,
        url: step.url,
        image: step.image
      }));
    }
    
    // Process supplies
    if (data.supply && Array.isArray(data.supply)) {
      data.supplies = data.supply.map(supply => ({
        name: supply.name,
        url: supply.url
      }));
    }
    
    // Process tools
    if (data.tool && Array.isArray(data.tool)) {
      data.tools = data.tool.map(tool => ({
        name: tool.name,
        url: tool.url
      }));
    }
  }
  
  // Process Breadcrumb schema
  processBreadcrumbSchema(data) {
    if (data.itemListElement && Array.isArray(data.itemListElement)) {
      data.breadcrumbs = data.itemListElement.map(item => ({
        name: item.name,
        url: item.item,
        position: item.position
      }));
    }
  }
  
  // Process generic schema
  processGenericSchema(data) {
    // Basic processing for any schema type
    if (data.url && typeof data.url === 'string') {
      data.isValidUrl = this.isValidUrl(data.url);
    }
  }
  
  // Utility method to validate URLs
  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }
}

// Initialize schema inspector
const schemaInspector = new SchemaInspector();

// Initialize immediately when script loads
schemaInspector.init();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ping') {
    sendResponse({ success: true, message: 'Content script is ready' });
  } else if (request.action === 'inspectSchema') {
    try {
      const schemaData = schemaInspector.inspectSchema();
      sendResponse({ success: true, data: schemaData });
    } catch (error) {
      console.error('Schema inspection error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  return true; // Keep message channel open for async response
});

// Also listen for page load events to reinitialize if needed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    schemaInspector.init();
  });
} else {
  schemaInspector.init();
}

} // End of window.schemaInspectorLoaded check
