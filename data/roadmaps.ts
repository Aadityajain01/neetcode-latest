export type RoadmapNodeVariant = "core" | "branch" | "support";

export type RoadmapNodeSize = "sm" | "md" | "lg";

export type RoadmapNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  why: string;
  focus: string[];
  variant?: RoadmapNodeVariant;
  size?: RoadmapNodeSize;
};

export type RoadmapEdgeStyle = "solid" | "dashed";

export type RoadmapEdge = {
  from: string;
  to: string;
  style?: RoadmapEdgeStyle;
  emphasis?: boolean;
};

export type RoadmapGraph = {
  width: number;
  height: number;
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
};

export type RoadmapNodeContent = {
  description?: string;
  syntax?: string;
  examples?: string[];
  bestPractices?: string[];
};

export type RoadmapLeafNode = {
  id: string;
  title: string;
  content: RoadmapNodeContent;
};

export type RoadmapSubtopic = {
  id: string;
  title: string;
  children: RoadmapLeafNode[];
};

export type RoadmapTopic = {
  id: string;
  title: string;
  description: string;
  subtopics: RoadmapSubtopic[];
};

export type RoadmapDefinition = {
  slug: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  status: "available";
  summary: string;
  description: string;
  topics: RoadmapTopic[];
};

export const roadmaps: Record<string, RoadmapDefinition> = {
  frontend: {
    slug: "frontend",
    title: "Frontend Development",
    level: "Intermediate",
    estimatedTime: "6-9 months",
    status: "available",
    summary: "HTML, CSS, JavaScript, Version Control, Responsive Design, and Deployment",
    description: "Complete roadmap to master modern frontend engineering",
    topics: [
      {
        id: "html",
        title: "HTML",
        description: "HyperText Markup Language - the structural backbone of all web pages.",
        subtopics: [
          {
            id: "html-basics",
            title: "HTML Basics",
            children: [
              { id: "doctype", title: "DOCTYPE", content: { description: "Declares the document type and HTML version. Must be the first line of every HTML file.", syntax: "<!DOCTYPE html>", examples: ["Always use HTML5 doctype: <!DOCTYPE html>", "Case insensitive but lowercase is standard"], bestPractices: ["Place at the very top of the file", "Never skip it to avoid quirks mode"] } },
              { id: "html-structure", title: "Basic Structure", content: { description: "The fundamental skeleton of every HTML page with head and body sections.", syntax: "<html>\n  <head>\n    <title>Page Title</title>\n  </head>\n  <body>\n    Visible Content\n  </body>\n</html>", examples: ["Head contains metadata", "Body contains visible content"], bestPractices: ["Always include lang attribute on html tag", "Set proper charset (UTF-8)"] } },
              { id: "meta-tags", title: "Meta Tags", content: { description: "Provide metadata about the HTML document for browsers, search engines, and social media.", syntax: "<meta charset='UTF-8'>\n<meta name='viewport' content='width=device-width, initial-scale=1.0'>", examples: ["charset", "viewport", "description", "keywords", "robots"], bestPractices: ["Always set UTF-8 encoding", "Include viewport tag for mobile responsiveness"] } }
            ]
          },
          {
            id: "html-elements",
            title: "Elements & Tags",
            children: [
              { id: "headings", title: "Headings (h1-h6)", content: { description: "Define hierarchical headings. h1 is the most important, h6 the least.", syntax: "<h1>Main Title</h1>\n<h2>Section Header</h2>\n<h3>Subsection Header</h3>", examples: ["h1 for main page title", "h2 for major sections", "h3 for subsections"], bestPractices: ["Use only one h1 per page", "Don't skip heading levels", "Use headings for structure, not for sizing"] } },
              { id: "paragraphs", title: "Paragraphs & Text", content: { description: "Block-level elements for organizing text paragraphs, along with inline text styling tags.", syntax: "<p>Paragraph text</p>\n<strong>Strong importance</strong>\n<em>Emphasis</em>", examples: ["p for text blocks", "strong for bold importance", "em for italic emphasis", "br for line breaks"], bestPractices: ["Use p for text blocks", "Don't use br for spacing", "Choose semantic formatting tags over visual ones"] } },
              { id: "links", title: "Links (a tag)", content: { description: "Create hyperlinks to other web pages, sections, or files.", syntax: "<a href='https://example.com' target='_blank'>Visit Site</a>", examples: ["External links", "Internal navigation", "Email links (mailto:)", "Anchor links (#section)"], bestPractices: ["Use descriptive link text", "Add rel='noopener' for external target='_blank' links", "Set proper target attribute"] } },
              { id: "images", title: "Images (img)", content: { description: "Embed images into web pages. Self-closing tag requiring src and alt.", syntax: "<img src='photo.jpg' alt='Descriptive text' width='400' height='300'>", examples: ["JPEG for photos", "PNG for transparent graphics", "SVG for icons", "WebP for modern web optimization"], bestPractices: ["Always include alt text", "Specify width and height to prevent layout shifts", "Use responsive images with srcset"] } }
            ]
          },
          {
            id: "html-forms",
            title: "Forms & Inputs",
            children: [
              { id: "input-types", title: "Input Types", content: { description: "Various input types for collecting different kinds of user data.", syntax: "<input type='text'>\n<input type='email'>\n<input type='password'>\n<input type='checkbox'>", examples: ["text, email, password", "number, date, time", "checkbox, radio", "file, color, range"], bestPractices: ["Use the appropriate input type for better mobile UX", "Always associate input with a label tag", "Use placeholder for hints, not labels"] } },
              { id: "form-validation", title: "Form Validation", content: { description: "Built-in HTML5 validation attributes for client-side form checking.", syntax: "<input required minlength='3' pattern='[A-Za-z]+'>", examples: ["required - must fill out", "minlength/maxlength - text length limits", "pattern - regex constraint", "min/max for numbers"], bestPractices: ["Always validate on the server too", "Show clear, helpful error messages", "Use :invalid CSS pseudo-class for styling feedback"] } }
            ]
          },
          {
            id: "semantic-html",
            title: "Semantic HTML",
            children: [
              { id: "semantic-elements", title: "Semantic Elements", content: { description: "Elements that clearly describe their meaning to both the browser and the developer.", syntax: "<header>\n  <nav>...</nav>\n</header>\n<main>\n  <article>...</article>\n</main>\n<footer>...</footer>", examples: ["header - introductory content", "nav - navigation links", "main - dominant content", "article - self-contained piece", "footer - closing content"], bestPractices: ["Use semantic elements over generic divs", "Improves accessibility", "Significantly helps SEO crawlers"] } },
              { id: "accessibility", title: "Accessibility (a11y)", content: { description: "Designing and developing web content that is usable by people with disabilities.", syntax: "<img alt='Description'>\n<button aria-label='Close Dialog'>✕</button>", examples: ["alt text for screen readers", "ARIA attributes", "Keyboard-accessible navigation", "Focus outline indicators"], bestPractices: ["Test accessibility with screen readers", "Use semantic HTML first before adding ARIA attributes", "Ensure sufficient color contrast"] } }
            ]
          }
        ]
      },
      {
        id: "css",
        title: "CSS",
        description: "Cascading Style Sheets - controls the styling, layout, and visual presentation of HTML documents.",
        subtopics: [
          {
            id: "css-basics",
            title: "CSS Fundamentals",
            children: [
              { id: "selectors", title: "Selectors", content: { description: "Patterns used to select and apply style rules to HTML elements.", syntax: "element { }\n.class { }\n#id { }\n[attr='value'] { }", examples: ["Element: p, div, h1", "Class: .button, .card", "ID: #header", "Attribute: [type='text']"], bestPractices: ["Prefer classes over IDs for styling", "Keep specificity low", "Use BEM naming conventions for cleanliness"] } },
              { id: "properties", title: "Properties & Values", content: { description: "CSS declarations that define how targeted elements should be styled.", syntax: "selector {\n  property: value;\n  color: red;\n  font-size: 16px;\n}", examples: ["color, background-color", "font-size, font-family", "margin, padding", "border, border-radius"], bestPractices: ["Use shorthand properties where possible", "Group related properties logically", "Leverage CSS custom properties (variables)"] } },
              { id: "units", title: "Units & Sizes", content: { description: "Measurement units for specifying sizes, padding, margins, and font sizes.", syntax: "width: 100px;\nwidth: 50%;\nfont-size: 1.25rem;\nwidth: 100vw;", examples: ["px - absolute pixels", "% - relative to parent element size", "rem - relative to root element font size", "vw/vh - relative to viewport width/height"], bestPractices: ["Use rem for scalable typography", "Use percentages or fr for layout widths", "Use viewport units for full-screen containers"] } }
            ]
          },
          {
            id: "css-layout",
            title: "Layout Systems",
            children: [
              { id: "box-model", title: "Box Model", content: { description: "Every HTML element is represented as a rectangular box with content, padding, border, and margin.", syntax: "box-sizing: border-box;\nmargin: 20px;\npadding: 10px;\nborder: 1px solid #000;", examples: ["content - actual text/images", "padding - spacing inside the border", "border - edge around padding", "margin - spacing outside the border"], bestPractices: ["Use box-sizing: border-box globally", "Understand margin collapse", "Establish a CSS reset/normalize baseline"] } },
              { id: "flexbox", title: "Flexbox", content: { description: "One-dimensional layout method for distributing space and aligning items inside containers.", syntax: ".container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 16px;\n}", examples: ["justify-content: center", "align-items: stretch", "flex-direction: column", "flex-wrap: wrap"], bestPractices: ["Use for 1D layouts (rows OR columns)", "Perfect for navigation bars and list items", "Use gap instead of margins for spacing items"] } },
              { id: "grid", title: "CSS Grid", content: { description: "Two-dimensional layout system designed for complex page layouts and rows/columns simultaneously.", syntax: ".container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 20px;\n}", examples: ["grid-template-columns", "grid-template-rows", "grid-template-areas", "grid-column: span 2"], bestPractices: ["Use for 2D layouts", "Use fr units for flexible columns", "Combine with Flexbox inside grid items"] } }
            ]
          },
          {
            id: "css-styling",
            title: "Styling & Effects",
            children: [
              { id: "colors", title: "Colors", content: { description: "Specifying colors in CSS using Hex, RGB, HSL, or named formats.", syntax: "color: #ff5733;\ncolor: rgba(255, 87, 51, 0.8);\ncolor: hsl(14, 100%, 60%);", examples: ["Hex: #ffffff", "RGB/RGBA for opacity", "HSL/HSLA for design intuition", "currentColor keyword"], bestPractices: ["Maintain WCAG color contrast ratios", "Use HSL for easy color variations", "Define a color palette in CSS variables"] } },
              { id: "typography", title: "Typography", content: { description: "Styling text elements with fonts, sizes, line heights, and alignments.", syntax: "font-family: 'Inter', sans-serif;\nfont-weight: 600;\nline-height: 1.6;\ntext-align: center;", examples: ["font-family stacks", "font-weight settings", "line-height line spacing", "letter-spacing tracking"], bestPractices: ["Limit web font loads to 2-3 weights", "Set base line-height at 1.5 minimum", "Use system font fallbacks"] } },
              { id: "transitions-animations", title: "Transitions & Animations", content: { description: "Adding motion and dynamic state transitions to elements.", syntax: "transition: all 0.3s ease;\n\n@keyframes slideIn {\n  from { transform: translateY(20px); opacity: 0; }\n  to { transform: translateY(0); opacity: 1; }\n}\nanimation: slideIn 0.4s ease forwards;", examples: ["hover transitions", "loading spinner loops", "slide-in overlays", "fade-in page effects"], bestPractices: ["Only animate transform and opacity properties for performance", "Keep transition durations under 300ms", "Respect prefers-reduced-motion media query"] } }
            ]
          }
        ]
      },
      {
        id: "javascript",
        title: "JavaScript",
        description: "A high-level, interpreted scripting language that enables interactive web pages.",
        subtopics: [
          {
            id: "js-basics",
            title: "JavaScript Basics",
            children: [
              { id: "variables", title: "Variables", content: { description: "Containers for storing data values.", syntax: "const name = 'Alice';\nlet age = 25;\nvar old = true; // avoid", examples: ["const - cannot reassign reference", "let - block-scoped reassignment variable", "var - function-scoped variable"], bestPractices: ["Use const by default", "Use let only when reassignment is required", "Never use var to avoid scope leaks"] } },
              { id: "data-types", title: "Data Types", content: { description: "The kind of values JavaScript can store and manipulate.", syntax: "const str = 'text';      // String\nconst num = 100;         // Number\nconst arr = [1, 2, 3];   // Array\nconst obj = { k: 'v' };  // Object", examples: ["String, Number, Boolean", "Array, Object", "null, undefined", "Symbol, BigInt"], bestPractices: ["Use typeof for runtime checks", "Understand truthy and falsy values", "Avoid implicit type coercion"] } },
              { id: "operators", title: "Operators", content: { description: "Symbols used to perform operations on variables and values.", syntax: "const sum = 5 + 3;\nconst isEqual = (a === b);\nconst value = a ?? 'default';", examples: ["Arithmetic: +, -, *, /, %", "Strict comparison: ===, !==", "Logical: &&, ||, !", "Nullish coalescing: ??"], bestPractices: ["Always use === over ==", "Leverage optional chaining ?.", "Use nullish coalescing ?? for fallback values"] } }
            ]
          },
          {
            id: "js-functions",
            title: "Functions",
            children: [
              { id: "function-declarations", title: "Declarations & Expressions", content: { description: "Traditional way to define reusable blocks of executable code.", syntax: "function greet(name) {\n  return 'Hello, ' + name;\n}\n\nconst greetExpr = function(name) { ... };", examples: ["Function declarations (hoisted)", "Function expressions", "Return statements", "Parameters and arguments"], bestPractices: ["Name functions descriptive of their action", "Follow single responsibility principle", "Limit function side effects"] } },
              { id: "arrow-functions", title: "Arrow Functions", content: { description: "Concise syntax for writing function expressions with lexical 'this' binding.", syntax: "const add = (a, b) => a + b;\nconst greet = name => `Hi ${name}`;", examples: ["Implicit return for single expressions", "Lexical 'this' binding", "Callbacks in array methods"], bestPractices: ["Use for short, inline functions", "Do not use as object methods", "Great for callback handlers"] } },
              { id: "callbacks", title: "Callbacks & Higher-Order", content: { description: "Functions passed as arguments to other functions to be invoked later.", syntax: "array.map(item => item * 2);\nbutton.addEventListener('click', handler);", examples: ["Array methods (map, filter, reduce)", "Event handler callbacks", "setTimeout/setInterval delays"], bestPractices: ["Avoid callback hell by modularizing", "Prefer Promises/async-await for async logic", "Keep callback handlers pure"] } }
            ]
          },
          {
            id: "js-dom",
            title: "DOM Manipulation",
            children: [
              { id: "selecting-elements", title: "Selecting Elements", content: { description: "Finding and accessing HTML elements from within JavaScript.", syntax: "const el = document.querySelector('.class');\nconst list = document.querySelectorAll('div');\nconst byId = document.getElementById('app');", examples: ["querySelector (most versatile)", "querySelectorAll (returns NodeList)", "getElementById (extremely fast)"], bestPractices: ["Cache selected elements in variables", "Prefer querySelector", "Verify element exists before acting on it"] } },
              { id: "modifying-elements", title: "Modifying Elements", content: { description: "Changing content, attributes, classes, and styles of selected elements.", syntax: "el.textContent = 'Updated';\nel.classList.add('active');\nel.setAttribute('href', '/url');", examples: ["textContent / innerHTML content", "classList add, remove, toggle", "style property updates", "setAttribute / getAttribute"], bestPractices: ["Prefer textContent over innerHTML for security (XSS prevention)", "Modify classes rather than inline styles", "Batch DOM updates where possible"] } },
              { id: "events", title: "Event Handling", content: { description: "Listening and responding to user actions and browser events.", syntax: "button.addEventListener('click', (e) => {\n  console.log('Clicked!', e.target);\n});", examples: ["click, dblclick mouse events", "keydown, keyup keyboard events", "submit, change form events", "DOMContentLoaded lifecycle event"], bestPractices: ["Always use addEventListener", "Remove event listeners on cleanup", "Use event delegation for dynamic lists"] } }
            ]
          },
          {
            id: "js-async",
            title: "Async JavaScript",
            children: [
              { id: "promises", title: "Promises", content: { description: "An object representing the eventual completion or failure of an asynchronous operation.", syntax: "fetch('/api')\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));", examples: ["Fetch API requests", "Promise.all() for parallel tasks", "then/catch handler chaining"], bestPractices: ["Always handle rejections with .catch()", "Return promises inside chains", "Avoid nested promise chains"] } },
              { id: "async-await", title: "Async / Await", content: { description: "Modern, cleaner syntax for working with promises that reads like synchronous code.", syntax: "async function loadData() {\n  try {\n    const res = await fetch('/api');\n    const data = await res.json();\n    return data;\n  } catch (err) {\n    console.error(err);\n  }\n}", examples: ["async function keyword", "await promise execution", "try / catch block error handling"], bestPractices: ["Always wrap await in try/catch blocks", "Use Promise.all with await for parallel operations", "Keep async helper functions small"] } }
            ]
          }
        ]
      },
      {
        id: "vcs",
        title: "Version Control",
        description: "Systems for tracking changes to code and files over time, enabling safe collaboration.",
        subtopics: [
          {
            id: "vcs-basics",
            title: "VCS Fundamentals",
            children: [
              { id: "vcs-intro", title: "What is VCS?", content: { description: "Version Control Systems record changes to files over time so you can recall specific versions later.", syntax: "# Key types:\n- Local VCS\n- Centralized VCS (e.g. SVN)\n- Distributed VCS (e.g. Git)", examples: ["Track file history", "Revert changes easily", "Compare changes over time"], bestPractices: ["Use a VCS for every project", "Back up your repositories remotely", "Learn how diffs work"] } }
            ]
          }
        ]
      },
      {
        id: "git",
        title: "Git",
        description: "Distributed version control system for tracking changes in source code during software development.",
        subtopics: [
          {
            id: "git-basics",
            title: "Git Fundamentals",
            children: [
              { id: "git-commands", title: "Essential Commands", content: { description: "Core commands used in the daily Git version control workflow.", syntax: "git init\ngit add .\ngit commit -m 'feat: add login'\ngit push origin main", examples: ["git init - start repo", "git clone - copy remote repo", "git status - check changes", "git commit - commit staged"], bestPractices: ["Commit early and commit often", "Write clean, descriptive commit messages", "Always pull changes before pushing"] } },
              { id: "branching", title: "Branching", content: { description: "Creating isolated development environments to work on features without affecting the main code.", syntax: "git checkout -b feature-login\ngit merge feature-login\ngit branch -d feature-login", examples: ["feature branches", "bugfix branches", "release branches", "main / master branch"], bestPractices: ["Name branches after features or fixes", "Merge frequently to avoid merge conflicts", "Delete branches after merging"] } },
              { id: "collaboration", title: "Collaboration", content: { description: "Working together using remote repositories like GitHub or GitLab.", syntax: "git remote add origin url\ngit pull origin main\ngit fetch", examples: ["GitHub Pull Requests", "Resolving merge conflicts", "Cloning remote repos", "Forking workflows"], bestPractices: ["Perform code reviews on PRs", "Keep pull requests small and focused", "Resolve conflicts locally before merging"] } }
            ]
          }
        ]
      },
      {
        id: "responsive",
        title: "Responsive Design",
        description: "Designing websites to behave fluidly and look beautiful on all screen sizes and devices.",
        subtopics: [
          {
            id: "responsive-basics",
            title: "Responsive Fundamentals",
            children: [
              { id: "media-queries", title: "Media Queries", content: { description: "Apply CSS rules based on device properties like screen width, height, or resolution.", syntax: "@media (max-width: 768px) {\n  .sidebar { display: none; }\n}", examples: ["Mobile: max-width 768px", "Tablet: 768px - 1024px", "Desktop: 1024px+", "Print media styles"], bestPractices: ["Take a mobile-first approach", "Define breakpoints based on content, not devices", "Use relative units inside media queries"] } },
              { id: "flexible-layouts", title: "Flexible Layouts", content: { description: "Layout structures that adapt fluidly to screen sizes using percentages and relative units.", syntax: ".container {\n  width: 100%;\n  max-width: 1200px;\n  margin: 0 auto;\n}", examples: ["Fluid layouts", "Flexible images (max-width: 100%)", "Relative sizing units (em, rem, %)", "Viewport units (vw, vh)"], bestPractices: ["Always set max-width on images", "Avoid fixed pixel widths for layout containers", "Test layouts at extreme widths"] } },
              { id: "mobile-first", title: "Mobile-First Design", content: { description: "Designing the mobile layout first, then progressively enhancing for larger screen sizes.", syntax: "/* Default mobile style */\n.main { padding: 10px; }\n\n/* Desktop enhancement */\n@media (min-width: 1024px) {\n  .main { padding: 30px; }\n}", examples: ["Default styles target mobile", "Use min-width queries for desktop", "Touch-friendly UI targets", "Progressive layout complexity"], bestPractices: ["Set touch targets to at least 44x44px", "Optimize assets for mobile speed first", "Focus on core content hierarchy"] } }
            ]
          }
        ]
      },
      {
        id: "deployment",
        title: "Deployment",
        description: "Getting your local website files hosted on a public web server and configured for the internet.",
        subtopics: [
          {
            id: "deployment-basics",
            title: "Deployment Fundamentals",
            children: [
              { id: "hosting", title: "Hosting Platforms", content: { description: "Web servers that store and serve your site files to public visitors.", syntax: "# Vercel deployment CLI\nvercel --prod\n\n# Netlify deployment CLI\nnetlify deploy --prod", examples: ["Vercel (serverless/frontend)", "Netlify (static site hosting)", "GitHub Pages (free simple hosting)", "Traditional VPS (AWS, DigitalOcean)"], bestPractices: ["Set up automated Git-based deployment (CI/CD)", "Enable production caching", "Secure backend credentials"] } },
              { id: "domains-dns", title: "Domains & DNS", content: { description: "Configuring a custom URL address (domain name) and directing traffic to your hosting server.", syntax: "# DNS Record Types:\n- A record: points to IP\n- CNAME: points to alias domain\n- TXT: domain verification", examples: ["Registering custom domain", "Configuring nameservers", "Adding DNS records", "Enabling SSL/HTTPS certificates"], bestPractices: ["Always redirect HTTP to HTTPS", "Maintain DNS backups", "Keep domain auto-renewal enabled"] } },
              { id: "performance", title: "Performance & Audits", content: { description: "Measuring website speed, accessibility, and SEO quality using developer tools.", syntax: "# Lighthouse Core Web Vitals:\n- LCP: Largest Contentful Paint\n- INP: Interaction to Next Paint\n- CLS: Cumulative Layout Shift", examples: ["Lighthouse browser audits", "Asset minification", "CDN file delivery", "Image lazy-loading"], bestPractices: ["Keep Lighthouse performance score above 90", "Serve next-gen image formats (WebP/AVIF)", "Enable text compression (Gzip/Brotli)"] } }
            ]
          }
        ]
      }
    ]
  }
};

export const roadmapList = Object.values(roadmaps);
export const frontendRoadmap = roadmaps.frontend;
