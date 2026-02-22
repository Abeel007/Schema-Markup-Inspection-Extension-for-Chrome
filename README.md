# Schema Markup Inspector

A Chrome extension that inspects and analyzes **schema.org** structured data on any web page. It helps developers and SEO practitioners see what structured data a page exposes and how it’s organized.

## What it does

- **Detects structured data** in three formats: **JSON-LD**, **Microdata**, and **RDFa**
- **Parses and normalizes** schema into a readable view in the extension popup
- **Groups fields** by category (Core Information, Content Details, Contact & Location, Pricing & Offers, Reviews & Ratings)
- **Supports common schema types**, including Article, BlogPosting, Organization, LocalBusiness, Product, Event, FAQPage, HowTo, BreadcrumbList, Person, WebPage, and WebSite
- **Copy to clipboard** so you can paste the extracted schema elsewhere

Use it to quickly check what structured data a site is using, debug markup, or compare implementations across pages.

## Features

- One-click inspection of the current tab
- Type-specific handling for articles (author, publisher, images), products (offers, ratings, reviews), events (location, organizer, tickets), FAQs, HowTo steps, breadcrumbs, and organizations (address, contact, opening hours)
- Expandable long text and clear display of arrays and nested objects
- Lightweight popup UI with status messages and scrollable results

## Tech stack

- **Chrome Extension Manifest V3**
- **Vanilla JavaScript** (no frameworks)
- **Content script** for reading the DOM and parsing schema
- **Popup** for UI and messaging with the active tab
- **Background service worker** for extension lifecycle

## Project structure

| File / folder | Role |
|---------------|------|
| `manifest.json` | Extension config, permissions, and script registration |
| `popup.html` / `popup.js` | Popup UI and “Inspect” / “Copy” behavior |
| `content.js` | Runs in page context; detects JSON-LD, Microdata, RDFa and normalizes schema |
| `background.js` | Service worker for extension events |
| `icons/` | Extension icons (16, 48, 128 px) |

---

*Built for inspecting and understanding schema.org markup on the web.*
