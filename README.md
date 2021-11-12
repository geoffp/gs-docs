# GS-Docs
A testbed for a new philosophy of web application architecture.

## Potential names for this web architecture
- Document-driven
- Semantic document
- Neoclassical
- SEO-first (ugh)

## Core Values & Guiding Principles
- Uphold and celebrate the nature of the web as a document platform without limiting our ability
- Keep architectural complexity to an absolute minimum
- Backwards compatible

### The Web is Documents, so Documents Are In Control
An **application** is, in general:
- A composition of **documents**
- A means of experiencing, navigating, and interacting with its **documents**

#### Specifically:
- The fundamental container unit, and primary view, is the **HTML document**: one per URL (except for hashes)
- **HTML documents** compose **microapplications** into an **application** experience, with the document as its centerpiece
- All **Content** is delivered with uncomplicated, semantically rich HTML
- All **Application** functionality is implemented in Javascript or WASM and delivered with custom elements, services workers

#### The Source Of Data is the Document
- The primary source of data available to the front-end is, naturally, the document
- As such, all data to be shown, filtered or otherwise manipulated by application functionality is almost always *already present* in the document.
- To display different data is to navigate to a different document

### Progressive enhancement all the way down
- An *application* is inherently a progressive enhancement of a set of *documents*
- Being documents, all documents are viewable, navigable and accessible without JS
- Being *semantically rich*, documents should be usable, if not beautiful, without CSS

### Dynamic vs. Static Content
- Documents are statically generated whenever possible
- Fully dynamic or personalized content can be:
  - Placed in a document, visualized by a microapplication backed by an API
  - A document, either:
    - Static, rendered offline/on-demand
    - Rendered on the fly by a server

### State Across Pages
- All Application state is that must be persisted across pages lives in straight up IndexedDB
