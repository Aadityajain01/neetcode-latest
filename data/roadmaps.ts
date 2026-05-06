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

export type RoadmapDefinition = {
  slug: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  status: "available";
  summary: string;
  description: string;
  roadmap: RoadmapGraph;
  focusAreas?: string[];
  milestones?: { title: string; description: string }[];
};

export const roadmaps: Record<string, RoadmapDefinition> = {
  backend: {
    slug: "backend",
    title: "Backend Developer",
    level: "Intermediate",
    estimatedTime: "4-8 months",
    status: "available",
    summary: "APIs, auth, databases, async work, deployment, and operations in one backend path.",
    description:
      "A practical backend roadmap that starts with request fundamentals and moves toward production-ready APIs, data systems, background jobs, deployment, observability, and service hardening.",
    focusAreas: [
      'Service Foundations',
      'Data Systems',
      'Operate Safely',
      'Ship Faster',
    ],
    milestones: [
      { title: 'Foundations', description: 'Understand request flow, Linux basics, and pick one backend language.' },
      { title: 'API & Data', description: 'Design APIs, model data, and learn relational patterns with transactions.' },
      { title: 'Async & Resilience', description: 'Implement background jobs, caching, and observability for reliability.' },
      { title: 'Production', description: 'Containerize, deploy, and harden services for real traffic.' },
    ],
    roadmap: {
      width: 1680,
      height: 2020,
      nodes: [
        {
          id: "internet",
          label: "Internet & Request Flow",
          x: 840,
          y: 120,
          why: "Backend work starts with understanding how requests move from a client through DNS, transport, proxies, and into your server. Without that model, debugging latency, headers, and failures becomes guesswork.",
          focus: ["Client-server model", "Ports, headers, latency"],
          variant: "core",
          size: "lg"
        },
        {
          id: "http",
          label: "HTTP",
          x: 1280,
          y: 70,
          why: "Most backend APIs are HTTP contracts. Methods, status codes, caching behavior, and headers determine how clients talk to your service.",
          focus: ["Methods and status codes", "Headers and idempotency"],
          variant: "branch",
          size: "md"
        },
        {
          id: "https",
          label: "HTTPS",
          x: 1280,
          y: 145,
          why: "HTTPS protects credentials, cookies, and tokens in transit. Modern browsers, auth flows, and production platforms assume encrypted transport by default.",
          focus: ["TLS at a high level", "Certificates and secure cookies"],
          variant: "branch",
          size: "md"
        },
        {
          id: "dns",
          label: "DNS",
          x: 1280,
          y: 220,
          why: "Requests cannot reach your service reliably if naming and resolution are misunderstood. DNS issues often look like random outages until you know where to inspect.",
          focus: ["Record types", "Caching and propagation"],
          variant: "support",
          size: "sm"
        },
        {
          id: "linux",
          label: "Linux & Server Basics",
          x: 840,
          y: 280,
          why: "Production servers, containers, and deployment targets are usually Linux-based. Knowing how files, ports, processes, and permissions work is part of backend work, not separate from it.",
          focus: ["Processes and ports", "Files, services, permissions"],
          variant: "core",
          size: "lg"
        },
        {
          id: "linux-cli",
          label: "CLI & Shell",
          x: 400,
          y: 235,
          why: "The command line is the fastest way to inspect logs, configs, processes, and network state during development and outages.",
          focus: ["curl, grep, ps", "Log inspection"],
          variant: "branch",
          size: "md"
        },
        {
          id: "processes",
          label: "Processes & Permissions",
          x: 400,
          y: 320,
          why: "Services crash, restart, bind ports, and fail because of permissions. Understanding the process model prevents blind debugging.",
          focus: ["Signals and background jobs", "Users, groups, permissions"],
          variant: "support",
          size: "sm"
        },
        {
          id: "language",
          label: "One Backend Language",
          x: 840,
          y: 450,
          why: "Depth in one backend language matters more than shallow familiarity with many. Strong language fluency makes frameworks, tooling, and system design easier to reason about.",
          focus: ["Types or runtime behavior", "Errors and async IO"],
          variant: "core",
          size: "lg"
        },
        {
          id: "node-typescript",
          label: "Node.js + TypeScript",
          x: 1280,
          y: 405,
          why: "Node.js and TypeScript are a strong backend combination for APIs because they pair a mature ecosystem with explicit contracts across handlers, services, and data layers.",
          focus: ["Modules and async/await", "Types across layers"],
          variant: "branch",
          size: "md"
        },
        {
          id: "frameworks",
          label: "Frameworks",
          x: 1280,
          y: 480,
          why: "Frameworks speed up routing, middleware, validation, and composition, but they only help when you already understand the request lifecycle underneath them.",
          focus: ["Routing and middleware", "Validation and errors"],
          variant: "support",
          size: "sm"
        },
        {
          id: "git",
          label: "Git & Collaboration",
          x: 840,
          y: 620,
          why: "Backend systems affect other teams and production data. Git discipline is how you ship changes safely, review design decisions, and recover from mistakes.",
          focus: ["Readable commits", "Branching and rollback"],
          variant: "core",
          size: "lg"
        },
        {
          id: "git-github",
          label: "PR Workflow",
          x: 400,
          y: 620,
          why: "Pull requests and review culture catch security gaps, contract mistakes, and unclear migrations before they reach production.",
          focus: ["Review discipline", "CI before merge"],
          variant: "branch",
          size: "md"
        },
        {
          id: "api-design",
          label: "API Design",
          x: 840,
          y: 790,
          why: "API design is the part of backend work other systems depend on directly. Good contracts reduce confusion, duplication, and breaking changes later.",
          focus: ["Resource boundaries", "Versioning and consistency"],
          variant: "core",
          size: "lg"
        },
        {
          id: "rest",
          label: "REST Design",
          x: 1280,
          y: 745,
          why: "REST remains the most common API style for product backends. Knowing how to model resources cleanly keeps APIs understandable and easier to cache or debug.",
          focus: ["URLs and verbs", "Pagination and filters"],
          variant: "branch",
          size: "md"
        },
        {
          id: "validation",
          label: "Validation & Errors",
          x: 1280,
          y: 820,
          why: "Bad input is normal on real systems. Validation protects downstream services and stable error shapes make clients easier to build and support.",
          focus: ["Schema validation", "Consistent error responses"],
          variant: "support",
          size: "sm"
        },
        {
          id: "auth",
          label: "Authentication & Authorization",
          x: 840,
          y: 960,
          why: "Most backend services decide who a user is and what they can do. Auth mistakes expose data faster than most application bugs.",
          focus: ["Identity vs permission", "Session and token lifecycle"],
          variant: "core",
          size: "lg"
        },
        {
          id: "jwt",
          label: "JWT / Sessions",
          x: 1280,
          y: 915,
          why: "JWTs and sessions are common auth tools, but they come with tradeoffs around rotation, revocation, and state. You need to know when each is appropriate.",
          focus: ["Claims and expiry", "Refresh and revocation"],
          variant: "branch",
          size: "md"
        },
        {
          id: "database",
          label: "Databases",
          x: 840,
          y: 1130,
          why: "Backend services live or die on data modeling, read patterns, and consistency. Storage decisions shape performance and correctness more than most code-level choices.",
          focus: ["Access patterns", "Consistency and transactions"],
          variant: "core",
          size: "lg"
        },
        {
          id: "sql",
          label: "SQL / PostgreSQL",
          x: 1280,
          y: 1085,
          why: "Relational databases remain the default choice for many serious products because joins, constraints, and transactions map well to business data.",
          focus: ["Indexes and joins", "Migrations and transactions"],
          variant: "branch",
          size: "md"
        },
        {
          id: "orms",
          label: "ORM / Query Layer",
          x: 400,
          y: 1130,
          why: "Abstractions can speed development, but only if you still understand the generated queries and schema behavior underneath them.",
          focus: ["Model mapping", "Query visibility"],
          variant: "support",
          size: "sm"
        },
        {
          id: "cache",
          label: "Caching",
          x: 840,
          y: 1300,
          why: "Caching improves latency and reduces database pressure, but it only works well when you know exactly what can be stale and for how long.",
          focus: ["Cache-aside", "TTL and invalidation"],
          variant: "core",
          size: "lg"
        },
        {
          id: "redis",
          label: "Redis",
          x: 1280,
          y: 1255,
          why: "Redis is commonly used for caching, sessions, rate data, and lightweight coordination. It becomes more useful once you understand what should stay out of the request path.",
          focus: ["Data structures", "Sessions and cache keys"],
          variant: "branch",
          size: "md"
        },
        {
          id: "async-work",
          label: "Async Work & Jobs",
          x: 840,
          y: 1470,
          why: "Not every task belongs in a request-response cycle. Offloading slow or retryable work is how backend systems stay responsive under real load.",
          focus: ["Separate sync vs async work", "Idempotent job design"],
          variant: "core",
          size: "lg"
        },
        {
          id: "queues",
          label: "Queues",
          x: 1280,
          y: 1425,
          why: "Queues let you absorb spikes, process retries, and isolate background work. They matter once real throughput exceeds what a single request cycle can safely handle.",
          focus: ["Retries and dead letters", "Backpressure"],
          variant: "branch",
          size: "md"
        },
        {
          id: "testing",
          label: "Testing",
          x: 840,
          y: 1640,
          why: "Tests create confidence for refactors, bug fixes, and releases. Backend testing is especially important when APIs, persistence, and auth all interact.",
          focus: ["Critical path coverage", "Unit vs integration balance"],
          variant: "core",
          size: "lg"
        },
        {
          id: "unit-tests",
          label: "Unit / Integration Tests",
          x: 400,
          y: 1640,
          why: "You need fast tests for business logic and broader tests for contracts and data flow. Relying on only one level leaves blind spots.",
          focus: ["Pure logic tests", "Route and DB integration"],
          variant: "branch",
          size: "md"
        },
        {
          id: "deployment",
          label: "Deployment",
          x: 840,
          y: 1810,
          why: "A backend is only useful when it can be deployed repeatedly, configured safely, and rolled back when something goes wrong.",
          focus: ["Artifacts and environments", "Release and rollback flow"],
          variant: "core",
          size: "lg"
        },
        {
          id: "docker",
          label: "Docker",
          x: 1280,
          y: 1765,
          why: "Containers reduce environment drift and make it easier to package services, workers, and dependencies into repeatable releases.",
          focus: ["Images and layers", "Ports, env, networking"],
          variant: "branch",
          size: "md"
        },
        {
          id: "observability",
          label: "Observability",
          x: 840,
          y: 1980,
          why: "Production systems fail in ways you do not see locally. Observability is how you explain failures with evidence instead of intuition.",
          focus: ["Logs, metrics, traces", "Correlate requests and failures"],
          variant: "core",
          size: "lg"
        },
        {
          id: "logging",
          label: "Logging & Metrics",
          x: 400,
          y: 1935,
          why: "Structured logs and useful metrics turn incidents into diagnosable problems. Without them, even small production issues become expensive to reason about.",
          focus: ["Request IDs", "Latency, errors, saturation"],
          variant: "branch",
          size: "md"
        },
        {
          id: "security",
          label: "Security & Hardening",
          x: 1280,
          y: 1935,
          why: "Backend systems are exposed to bad input, abuse, leaks, and privilege mistakes. Hardening is what keeps ordinary bugs from becoming incidents.",
          focus: ["Secrets and least privilege", "Surface reduction"],
          variant: "branch",
          size: "md"
        },
        {
          id: "rate-limits",
          label: "Rate Limits",
          x: 1280,
          y: 2010,
          why: "Rate limiting protects your service from abuse, crawler mistakes, and accidental retry storms before they damage shared infrastructure.",
          focus: ["Per-user or IP quotas", "Graceful rejection and backoff"],
          variant: "support",
          size: "sm"
        },
        {
          id: "projects",
          label: "Build Real Projects",
          x: 840,
          y: 2140,
          why: "Projects force you to combine contracts, auth, persistence, caching, async jobs, deployment, and debugging into one working system. That integration is where backend skill becomes real.",
          focus: ["Ship end-to-end services", "Document tradeoffs and failures"],
          variant: "core",
          size: "lg"
        }
      ],
      edges: [
        { from: "internet", to: "linux", emphasis: true },
        { from: "linux", to: "language", emphasis: true },
        { from: "language", to: "git", emphasis: true },
        { from: "git", to: "api-design", emphasis: true },
        { from: "api-design", to: "auth", emphasis: true },
        { from: "auth", to: "database", emphasis: true },
        { from: "database", to: "cache", emphasis: true },
        { from: "cache", to: "async-work", emphasis: true },
        { from: "async-work", to: "testing", emphasis: true },
        { from: "testing", to: "deployment", emphasis: true },
        { from: "deployment", to: "observability", emphasis: true },
        { from: "observability", to: "projects", emphasis: true },
        { from: "internet", to: "http", style: "dashed" },
        { from: "internet", to: "https", style: "dashed" },
        { from: "internet", to: "dns", style: "dashed" },
        { from: "linux", to: "linux-cli", style: "dashed" },
        { from: "linux", to: "processes", style: "dashed" },
        { from: "language", to: "node-typescript", style: "dashed" },
        { from: "language", to: "frameworks", style: "dashed" },
        { from: "git", to: "git-github", style: "dashed" },
        { from: "api-design", to: "rest", style: "dashed" },
        { from: "api-design", to: "validation", style: "dashed" },
        { from: "auth", to: "jwt", style: "dashed" },
        { from: "database", to: "sql", style: "dashed" },
        { from: "database", to: "orms", style: "dashed" },
        { from: "cache", to: "redis", style: "dashed" },
        { from: "async-work", to: "queues", style: "dashed" },
        { from: "testing", to: "unit-tests", style: "dashed" },
        { from: "deployment", to: "docker", style: "dashed" },
        { from: "observability", to: "logging", style: "dashed" },
        { from: "observability", to: "security", style: "dashed" },
        { from: "security", to: "rate-limits", style: "dashed" }
      ]
    }
  },
  frontend: {
    slug: "frontend",
    title: "Frontend Developer",
    level: "Intermediate",
    estimatedTime: "6-9 months",
    status: "available",
    summary: "HTML, CSS, JavaScript, React, and modern tooling to build responsive web applications.",
    description:
      "A practical frontend roadmap that starts with web fundamentals and moves through styling, JavaScript, frameworks, state management, performance, and deployment.",
    focusAreas: [
      'Web Fundamentals',
      'Interactive Applications',
      'Performance & Optimization',
      'Deploy & Scale',
    ],
    milestones: [
      { title: 'Foundations', description: 'Master HTML, CSS, and vanilla JavaScript fundamentals.' },
      { title: 'Frameworks', description: 'Learn React, component design, and hooks for building UIs.' },
      { title: 'Advanced Patterns', description: 'State management, routing, and complex component patterns.' },
      { title: 'Production', description: 'Performance, testing, deployment, and monitoring.' },
    ],
    roadmap: {
      width: 1680,
      height: 2020,
      nodes: [
        {
          id: "html-css",
          label: "HTML & CSS Fundamentals",
          x: 840,
          y: 120,
          why: "Every interactive UI on the web is built on HTML structure and CSS styling. Understanding semantics, layouts, and responsive design is the foundation before adding JavaScript.",
          focus: ["Semantic HTML", "Flexbox and Grid"],
          variant: "core",
          size: "lg"
        },
        {
          id: "css-advanced",
          label: "CSS Advanced",
          x: 1280,
          y: 145,
          why: "Modern CSS with animations, transforms, and modern layout techniques makes interfaces feel smooth and responsive without over-relying on JavaScript.",
          focus: ["Animations and transitions", "Modern selectors and layout"],
          variant: "branch",
          size: "md"
        },
        {
          id: "responsive",
          label: "Responsive Design",
          x: 1280,
          y: 70,
          why: "Users access your site on phones, tablets, and desktops. Responsive design ensures your interface works and looks good on all screen sizes.",
          focus: ["Media queries", "Mobile-first approach"],
          variant: "support",
          size: "sm"
        },
        {
          id: "javascript",
          label: "JavaScript Core",
          x: 840,
          y: 280,
          why: "JavaScript powers interactivity, state changes, and API communication. Strong fundamentals in closures, async/await, and DOM manipulation prevent common bugs.",
          focus: ["Closures and scope", "Async/await and promises"],
          variant: "core",
          size: "lg"
        },
        {
          id: "dom-api",
          label: "DOM & Browser APIs",
          x: 400,
          y: 235,
          why: "The DOM is how JavaScript manipulates HTML. Understanding events, selectors, and native browser APIs helps you work with or without frameworks.",
          focus: ["Event listeners", "querySelector and manipulation"],
          variant: "branch",
          size: "md"
        },
        {
          id: "es6-plus",
          label: "ES6+ Features",
          x: 400,
          y: 320,
          why: "Modern JavaScript features like arrow functions, destructuring, modules, and classes make code more readable and maintainable.",
          focus: ["Arrow functions and destructuring", "Modules and classes"],
          variant: "support",
          size: "sm"
        },
        {
          id: "git",
          label: "Git & Version Control",
          x: 840,
          y: 450,
          why: "Working with teams and deploying code changes requires version control discipline. Git workflow and collaboration practices prevent lost work and enable rollbacks.",
          focus: ["Branching and merging", "Commit history"],
          variant: "core",
          size: "lg"
        },
        {
          id: "react",
          label: "React & Components",
          x: 840,
          y: 620,
          why: "React is the dominant framework for building component-based UIs. Understanding components, props, state, and hooks is essential for modern frontend work.",
          focus: ["Functional components", "Hooks and state"],
          variant: "core",
          size: "lg"
        },
        {
          id: "jsx",
          label: "JSX & Rendering",
          x: 400,
          y: 575,
          why: "JSX makes component markup readable and composable. Understanding how JSX transforms into function calls helps you debug and optimize rendering.",
          focus: ["JSX syntax", "Conditional rendering"],
          variant: "branch",
          size: "md"
        },
        {
          id: "hooks",
          label: "React Hooks",
          x: 1280,
          y: 620,
          why: "Hooks like useState, useEffect, and useContext let you manage state and side effects in functional components without class boilerplate.",
          focus: ["useState and useEffect", "Custom hooks"],
          variant: "branch",
          size: "md"
        },
        {
          id: "state-management",
          label: "State Management",
          x: 840,
          y: 790,
          why: "As apps grow, passing state through props becomes unwieldy. State management libraries help coordinate data flow and prevent prop drilling.",
          focus: ["Context API", "Redux or Zustand patterns"],
          variant: "core",
          size: "lg"
        },
        {
          id: "context",
          label: "Context API",
          x: 400,
          y: 745,
          why: "Context API is React's built-in way to share state without prop drilling. It's simpler than Redux for moderate apps.",
          focus: ["Provider patterns", "useContext"],
          variant: "branch",
          size: "md"
        },
        {
          id: "redux",
          label: "Redux",
          x: 1280,
          y: 745,
          why: "Redux provides predictable state management with clear patterns for actions, reducers, and selectors. It's powerful for complex apps with many state changes.",
          focus: ["Actions and reducers", "Selectors and middleware"],
          variant: "support",
          size: "sm"
        },
        {
          id: "routing",
          label: "Routing & Navigation",
          x: 840,
          y: 960,
          why: "Single Page Applications need client-side routing. Libraries like React Router handle URL changes and component matching without full page reloads.",
          focus: ["Route definitions", "Navigation and parameters"],
          variant: "core",
          size: "lg"
        },
        {
          id: "api-integration",
          label: "API Integration",
          x: 840,
          y: 1130,
          why: "Frontend apps fetch data from backend APIs. Understanding fetch, promises, error handling, and loading states is essential for real-world applications.",
          focus: ["Fetch and Axios", "Error handling"],
          variant: "core",
          size: "lg"
        },
        {
          id: "http-methods",
          label: "HTTP & REST",
          x: 400,
          y: 1085,
          why: "REST APIs use HTTP methods and status codes. Understanding GET, POST, PUT, DELETE and their status codes helps you work with backend services correctly.",
          focus: ["HTTP methods", "Status codes and headers"],
          variant: "branch",
          size: "md"
        },
        {
          id: "testing",
          label: "Testing",
          x: 840,
          y: 1300,
          why: "Frontend tests catch regressions, ensure components render correctly, and verify user interactions work as expected before shipping.",
          focus: ["Unit tests for components", "Integration testing"],
          variant: "core",
          size: "lg"
        },
        {
          id: "jest-testing",
          label: "Jest & RTL",
          x: 400,
          y: 1255,
          why: "Jest is the standard testing framework for React. React Testing Library encourages testing behavior instead of implementation details.",
          focus: ["Component testing", "User interactions"],
          variant: "branch",
          size: "md"
        },
        {
          id: "performance",
          label: "Performance Optimization",
          x: 840,
          y: 1470,
          why: "Slow frontends frustrate users and hurt rankings. Code splitting, lazy loading, memoization, and careful re-render optimization improve user experience.",
          focus: ["Code splitting", "Memoization and lazy loading"],
          variant: "core",
          size: "lg"
        },
        {
          id: "bundling",
          label: "Build Tools & Bundling",
          x: 1280,
          y: 1425,
          why: "Bundlers like Webpack or Vite transform your source code into optimized assets for the browser. Understanding your build pipeline helps with debugging and optimization.",
          focus: ["Webpack or Vite basics", "Code splitting and optimization"],
          variant: "branch",
          size: "md"
        },
        {
          id: "css-in-js",
          label: "Styling Solutions",
          x: 1280,
          y: 1500,
          why: "CSS Modules, CSS-in-JS, or Tailwind CSS help manage styles at scale. Each has tradeoffs in performance, maintainability, and developer experience.",
          focus: ["Component-scoped styles", "Tailwind or styled-components"],
          variant: "support",
          size: "sm"
        },
        {
          id: "accessibility",
          label: "Accessibility (a11y)",
          x: 1280,
          y: 1640,
          why: "Accessible frontends work for users with assistive tech and disabilities. ARIA labels, semantic HTML, and keyboard navigation make your app inclusive.",
          focus: ["ARIA attributes", "Keyboard navigation"],
          variant: "support",
          size: "sm"
        },
        {
          id: "deployment",
          label: "Deployment & DevOps",
          x: 840,
          y: 1640,
          why: "Frontend code only matters when deployed. Understanding builds, CDNs, environment variables, and CI/CD pipelines gets your app to users reliably.",
          focus: ["Build and deployment", "Environment management"],
          variant: "core",
          size: "lg"
        },
        {
          id: "hosting",
          label: "Hosting & CDN",
          x: 400,
          y: 1595,
          why: "Static frontends can be hosted cheaply on CDNs. Dynamic apps might use Vercel, Netlify, or cloud platforms. Choosing wisely affects cost and performance.",
          focus: ["Static hosting", "CDN caching"],
          variant: "branch",
          size: "md"
        },
        {
          id: "monitoring",
          label: "Monitoring & Analytics",
          x: 1280,
          y: 1595,
          why: "Production frontends need monitoring to catch errors, track performance, and understand user behavior. Tools like Sentry and analytics platforms provide visibility.",
          focus: ["Error tracking", "Performance metrics"],
          variant: "support",
          size: "sm"
        },
        {
          id: "projects",
          label: "Build Real Projects",
          x: 840,
          y: 1810,
          why: "Projects force you to integrate components, state, routing, API calls, testing, and deployment into one working application. That integration is where frontend skill becomes real.",
          focus: ["Build features end-to-end", "Iterate on feedback"],
          variant: "core",
          size: "lg"
        }
      ],
      edges: [
        { from: "html-css", to: "javascript", emphasis: true },
        { from: "javascript", to: "git", emphasis: true },
        { from: "git", to: "react", emphasis: true },
        { from: "react", to: "state-management", emphasis: true },
        { from: "state-management", to: "routing", emphasis: true },
        { from: "routing", to: "api-integration", emphasis: true },
        { from: "api-integration", to: "testing", emphasis: true },
        { from: "testing", to: "performance", emphasis: true },
        { from: "performance", to: "deployment", emphasis: true },
        { from: "deployment", to: "projects", emphasis: true },
        { from: "html-css", to: "css-advanced", style: "dashed" },
        { from: "html-css", to: "responsive", style: "dashed" },
        { from: "javascript", to: "dom-api", style: "dashed" },
        { from: "javascript", to: "es6-plus", style: "dashed" },
        { from: "react", to: "jsx", style: "dashed" },
        { from: "react", to: "hooks", style: "dashed" },
        { from: "state-management", to: "context", style: "dashed" },
        { from: "state-management", to: "redux", style: "dashed" },
        { from: "api-integration", to: "http-methods", style: "dashed" },
        { from: "testing", to: "jest-testing", style: "dashed" },
        { from: "performance", to: "bundling", style: "dashed" },
        { from: "performance", to: "css-in-js", style: "dashed" },
        { from: "performance", to: "accessibility", style: "dashed" },
        { from: "deployment", to: "hosting", style: "dashed" },
        { from: "deployment", to: "monitoring", style: "dashed" }
      ]
    }
  },
  devops: {
    slug: "devops",
    title: "DevOps Engineering",
    level: "Advanced",
    estimatedTime: "6-10 months",
    status: "available",
    summary: "Infrastructure, containerization, CI/CD, and deployment patterns for cloud systems.",
    description:
      "A practical DevOps roadmap covering Linux, networking, containerization, orchestration, CI/CD pipelines, infrastructure as code, monitoring, and production systems management.",
    focusAreas: [
      'Infrastructure Foundations',
      'Container & Orchestration',
      'CI/CD Automation',
      'Monitoring & Resilience',
    ],
    milestones: [
      { title: 'Foundations', description: 'Master Linux, networking, and server basics.' },
      { title: 'Containerization', description: 'Learn Docker, container orchestration, and deployment strategies.' },
      { title: 'Automation', description: 'Build CI/CD pipelines, infrastructure as code, and configuration management.' },
      { title: 'Production', description: 'Monitor systems, handle incidents, and optimize for reliability and scale.' },
    ],
    roadmap: {
      width: 1680,
      height: 1800,
      nodes: [
        {
          id: "linux-fundamentals",
          label: "Linux Fundamentals",
          x: 840,
          y: 120,
          why: "DevOps work happens on Linux systems. Understanding kernel concepts, package management, filesystems, and services is foundational to everything that follows.",
          focus: ["File systems", "Process management", "Users and permissions"],
          variant: "core",
          size: "lg"
        },
        {
          id: "networking",
          label: "Networking",
          x: 840,
          y: 280,
          why: "Services communicate over networks. Understanding TCP/IP, DNS, routing, and firewalls is essential for debugging and designing distributed systems.",
          focus: ["TCP/IP basics", "DNS and load balancing"],
          variant: "core",
          size: "lg"
        },
        {
          id: "dns-fundamentals",
          label: "DNS",
          x: 1280,
          y: 235,
          why: "DNS is how services discover each other in distributed systems. Misconfigured DNS causes mysterious failures and downtime.",
          focus: ["Record types", "Resolution and caching"],
          variant: "branch",
          size: "md"
        },
        {
          id: "containers",
          label: "Docker & Containers",
          x: 840,
          y: 440,
          why: "Containers are the standard unit of deployment. Understanding images, layers, registries, and the container runtime is central to modern DevOps work.",
          focus: ["Images and layers", "Registry management"],
          variant: "core",
          size: "lg"
        },
        {
          id: "dockerfile",
          label: "Dockerfile & Build",
          x: 1280,
          y: 395,
          why: "Efficient Dockerfiles reduce image size and build time. Understanding multi-stage builds, caching, and security context prevents bloat and vulnerabilities.",
          focus: ["Multi-stage builds", "Layer caching and security"],
          variant: "branch",
          size: "md"
        },
        {
          id: "registries",
          label: "Container Registries",
          x: 1280,
          y: 470,
          why: "Registries store and distribute container images. Managing versions, security scanning, and access control is part of the deployment pipeline.",
          focus: ["Image versioning", "Vulnerability scanning"],
          variant: "support",
          size: "sm"
        },
        {
          id: "orchestration",
          label: "Kubernetes & Orchestration",
          x: 840,
          y: 620,
          why: "Kubernetes orchestrates containers at scale. It handles deployment, scaling, networking, and persistence so teams don't have to manage individual machines.",
          focus: ["Pods and deployments", "Services and networking"],
          variant: "core",
          size: "lg"
        },
        {
          id: "kubectl",
          label: "kubectl & Management",
          x: 400,
          y: 575,
          why: "kubectl is how you interact with Kubernetes clusters. Knowing declarative config, debugging, and resource management is essential.",
          focus: ["YAML config", "Debugging and logs"],
          variant: "branch",
          size: "md"
        },
        {
          id: "helm",
          label: "Helm & Templating",
          x: 1280,
          y: 620,
          why: "Helm packages Kubernetes applications into reusable charts. It reduces configuration duplication and makes deployments more manageable.",
          focus: ["Chart structure", "Values and templating"],
          variant: "branch",
          size: "md"
        },
        {
          id: "iac",
          label: "Infrastructure as Code",
          x: 840,
          y: 790,
          why: "IaC tools let you version-control infrastructure decisions and reproduce environments reliably. It prevents manual snowflake servers and configuration drift.",
          focus: ["Declarative config", "Immutable infrastructure"],
          variant: "core",
          size: "lg"
        },
        {
          id: "terraform",
          label: "Terraform",
          x: 1280,
          y: 745,
          why: "Terraform is widely used to provision cloud infrastructure. Understanding state management, modules, and plan-apply workflows prevents costly mistakes.",
          focus: ["State and backends", "Modules and reuse"],
          variant: "branch",
          size: "md"
        },
        {
          id: "ansible",
          label: "Ansible & Configuration",
          x: 1280,
          y: 820,
          why: "Ansible configures systems without agents. Playbooks let you automate setup, updates, and remediation at scale.",
          focus: ["Playbooks and inventory", "Variables and handlers"],
          variant: "support",
          size: "sm"
        },
        {
          id: "cicd",
          label: "CI/CD Pipelines",
          x: 840,
          y: 960,
          why: "CI/CD automates testing and deployment. Good pipelines catch regressions early and reduce the risk of manual deployment steps.",
          focus: ["Build automation", "Test gates and deployment"],
          variant: "core",
          size: "lg"
        },
        {
          id: "git-hooks",
          label: "Git & Webhooks",
          x: 400,
          y: 915,
          why: "Git events trigger CI/CD workflows. Understanding branching strategies and webhook hooks connects version control to automated pipelines.",
          focus: ["Pre-commit hooks", "Webhook integration"],
          variant: "branch",
          size: "md"
        },
        {
          id: "github-actions",
          label: "GitHub Actions / Jenkins",
          x: 1280,
          y: 915,
          why: "CI/CD tools automate build, test, and deploy tasks. Choosing between GitHub Actions, Jenkins, GitLab CI, or others affects your workflow and costs.",
          focus: ["Workflow definition", "Matrix builds and secrets"],
          variant: "support",
          size: "sm"
        },
        {
          id: "monitoring",
          label: "Monitoring & Observability",
          x: 840,
          y: 1140,
          why: "Production systems need visibility into their health. Monitoring catches problems before customers notice and helps teams understand system behavior.",
          focus: ["Metrics collection", "Alerting and dashboards"],
          variant: "core",
          size: "lg"
        },
        {
          id: "prometheus",
          label: "Prometheus & Metrics",
          x: 1280,
          y: 1095,
          why: "Prometheus is the standard metrics platform. Understanding scraping, queries, and retention helps teams build effective monitoring.",
          focus: ["Scrape configs", "PromQL queries"],
          variant: "branch",
          size: "md"
        },
        {
          id: "logging-stack",
          label: "Logging Stack",
          x: 1280,
          y: 1170,
          why: "Centralized logging (ELK, Splunk, Loki) makes debugging distributed systems possible. Without it, finding a problem across many services is impossible.",
          focus: ["Log aggregation", "Parsing and filtering"],
          variant: "branch",
          size: "md"
        },
        {
          id: "incident-response",
          label: "Incident Response",
          x: 840,
          y: 1310,
          why: "When systems fail, the ability to diagnose and respond quickly minimizes damage. Incident response culture, runbooks, and post-mortems matter.",
          focus: ["On-call rotation", "Runbooks and escalation"],
          variant: "core",
          size: "lg"
        },
        {
          id: "observability-practices",
          label: "Observability Practices",
          x: 400,
          y: 1310,
          why: "Observability (logs, metrics, traces) is how teams understand systems when they fail. Building observability into systems early prevents blind spots.",
          focus: ["Structured logging", "Request tracing"],
          variant: "branch",
          size: "md"
        },
        {
          id: "cloud-platforms",
          label: "Cloud Platforms",
          x: 840,
          y: 1470,
          why: "Most DevOps work today involves cloud platforms. Understanding AWS, GCP, or Azure abstractions and pricing prevents costly mistakes.",
          focus: ["Compute and storage", "Networking and IAM"],
          variant: "core",
          size: "lg"
        },
        {
          id: "deployment-strategies",
          label: "Deployment Strategies",
          x: 840,
          y: 1630,
          why: "How you roll out changes affects risk and downtime. Blue-green, canary, and rolling deployments each have tradeoffs worth understanding.",
          focus: ["Zero-downtime updates", "Rollback strategies"],
          variant: "core",
          size: "lg"
        }
      ],
      edges: [
        { from: "linux-fundamentals", to: "networking", emphasis: true },
        { from: "networking", to: "containers", emphasis: true },
        { from: "containers", to: "orchestration", emphasis: true },
        { from: "orchestration", to: "iac", emphasis: true },
        { from: "iac", to: "cicd", emphasis: true },
        { from: "cicd", to: "monitoring", emphasis: true },
        { from: "monitoring", to: "incident-response", emphasis: true },
        { from: "incident-response", to: "cloud-platforms", emphasis: true },
        { from: "cloud-platforms", to: "deployment-strategies", emphasis: true },
        { from: "networking", to: "dns-fundamentals", style: "dashed" },
        { from: "containers", to: "dockerfile", style: "dashed" },
        { from: "containers", to: "registries", style: "dashed" },
        { from: "orchestration", to: "kubectl", style: "dashed" },
        { from: "orchestration", to: "helm", style: "dashed" },
        { from: "iac", to: "terraform", style: "dashed" },
        { from: "iac", to: "ansible", style: "dashed" },
        { from: "cicd", to: "git-hooks", style: "dashed" },
        { from: "cicd", to: "github-actions", style: "dashed" },
        { from: "monitoring", to: "prometheus", style: "dashed" },
        { from: "monitoring", to: "logging-stack", style: "dashed" },
        { from: "incident-response", to: "observability-practices", style: "dashed" }
      ]
    }
  },
  cloud: {
    slug: "cloud",
    title: "Cloud Architecture",
    level: "Advanced",
    estimatedTime: "7-11 months",
    status: "available",
    summary: "Design and manage cloud infrastructure on AWS, GCP, or Azure with best practices.",
    description:
      "A practical cloud architecture roadmap covering cloud fundamentals, compute, storage, networking, databases, serverless, scaling, security, and cost optimization.",
    focusAreas: [
      'Cloud Fundamentals',
      'Core Services',
      'Architecture Patterns',
      'Security & Optimization',
    ],
    milestones: [
      { title: 'Fundamentals', description: 'Understand cloud concepts, regions, and core services.' },
      { title: 'Core Services', description: 'Master compute, storage, networking, and databases.' },
      { title: 'Architecture', description: 'Design scalable, resilient systems with best practices.' },
      { title: 'Production', description: 'Implement security, optimize costs, and manage operations.' },
    ],
    roadmap: {
      width: 1680,
      height: 1800,
      nodes: [
        {
          id: "cloud-fundamentals",
          label: "Cloud Fundamentals",
          x: 840,
          y: 120,
          why: "Cloud computing changes how you think about infrastructure. Understanding regions, availability zones, and pay-as-you-go models prevents over-provisioning and downtime.",
          focus: ["Regions and AZs", "On-demand pricing"],
          variant: "core",
          size: "lg"
        },
        {
          id: "compute-services",
          label: "Compute Services",
          x: 840,
          y: 280,
          why: "Cloud compute options range from VMs to serverless functions. Choosing the right service for your workload affects performance, cost, and operational complexity.",
          focus: ["VMs vs containers", "Auto-scaling"],
          variant: "core",
          size: "lg"
        },
        {
          id: "ec2-vms",
          label: "EC2 / VMs",
          x: 1280,
          y: 235,
          why: "Virtual machines give you full control but require more management. Understanding instance types, storage, and network configuration is essential.",
          focus: ["Instance types", "EBS and snapshots"],
          variant: "branch",
          size: "md"
        },
        {
          id: "lambda-serverless",
          label: "Lambda / Serverless",
          x: 1280,
          y: 310,
          why: "Serverless functions scale automatically and you pay only for execution. They're ideal for event-driven workloads but come with limitations around state and cold starts.",
          focus: ["Function triggers", "Environment variables"],
          variant: "support",
          size: "sm"
        },
        {
          id: "storage",
          label: "Storage & Databases",
          x: 840,
          y: 440,
          why: "Cloud storage options span from managed databases to object storage to data warehouses. Choosing wisely affects cost, query performance, and data durability.",
          focus: ["Storage classes", "Query performance"],
          variant: "core",
          size: "lg"
        },
        {
          id: "object-storage",
          label: "Object Storage",
          x: 1280,
          y: 395,
          why: "Object storage (S3, GCS, Azure Blob) is cheap and durable for unstructured data. Understanding versioning, lifecycle policies, and access control prevents data loss.",
          focus: ["Lifecycle policies", "Access control"],
          variant: "branch",
          size: "md"
        },
        {
          id: "databases",
          label: "Cloud Databases",
          x: 1280,
          y: 470,
          why: "Managed databases reduce operational burden. Understanding replication, backups, and failover helps you build resilient data layers.",
          focus: ["Multi-region replication", "Automated backups"],
          variant: "branch",
          size: "md"
        },
        {
          id: "networking",
          label: "Networking",
          x: 840,
          y: 620,
          why: "Cloud networking is more complex than on-prem. VPCs, subnets, routing, and security groups control how traffic flows and who can access what.",
          focus: ["VPC design", "Security groups"],
          variant: "core",
          size: "lg"
        },
        {
          id: "load-balancing",
          label: "Load Balancing",
          x: 1280,
          y: 575,
          why: "Load balancers distribute traffic across instances. Understanding health checks, sticky sessions, and DDoS protection matters for reliability.",
          focus: ["Layer 4 vs 7", "Health checks"],
          variant: "branch",
          size: "md"
        },
        {
          id: "cdn",
          label: "CDN & Edge",
          x: 1280,
          y: 650,
          why: "CDNs cache content geographically close to users. Understanding cache control, invalidation, and edge computing reduces latency.",
          focus: ["Cache control", "Edge functions"],
          variant: "support",
          size: "sm"
        },
        {
          id: "scaling",
          label: "Scaling & Performance",
          x: 840,
          y: 790,
          why: "Cloud's main advantage is the ability to scale. Understanding auto-scaling groups, load testing, and cost monitoring prevents surprises.",
          focus: ["Horizontal vs vertical", "Cost modeling"],
          variant: "core",
          size: "lg"
        },
        {
          id: "auto-scaling",
          label: "Auto-Scaling",
          x: 1280,
          y: 745,
          why: "Auto-scaling policies automatically add or remove capacity based on demand. Understanding metrics, cooldown periods, and thresholds prevents flapping.",
          focus: ["Scaling policies", "Metrics-based triggers"],
          variant: "branch",
          size: "md"
        },
        {
          id: "monitoring-cloud",
          label: "Monitoring & Observability",
          x: 1280,
          y: 820,
          why: "Cloud services generate enormous amounts of telemetry. Setting up the right dashboards and alerts prevents missing outages.",
          focus: ["CloudWatch / Stackdriver", "Custom metrics"],
          variant: "support",
          size: "sm"
        },
        {
          id: "security",
          label: "Security",
          x: 840,
          y: 960,
          why: "Cloud security requires multiple layers. IAM, encryption, network isolation, and secrets management are non-negotiable.",
          focus: ["IAM policies", "Encryption in transit and at rest"],
          variant: "core",
          size: "lg"
        },
        {
          id: "iam",
          label: "IAM & Access Control",
          x: 400,
          y: 915,
          why: "IAM controls who can do what in your cloud account. Least privilege principles and regular audits prevent unauthorized access.",
          focus: ["Policies and roles", "MFA and service accounts"],
          variant: "branch",
          size: "md"
        },
        {
          id: "secrets-management",
          label: "Secrets Management",
          x: 1280,
          y: 915,
          why: "Storing secrets (API keys, passwords) safely is critical. Cloud secret managers rotate and audit access automatically.",
          focus: ["Encryption and rotation", "Audit logs"],
          variant: "branch",
          size: "md"
        },
        {
          id: "disaster-recovery",
          label: "Disaster Recovery",
          x: 840,
          y: 1140,
          why: "Data loss and regional outages happen. Having backup and recovery procedures prevents data loss and minimizes downtime.",
          focus: ["Backup frequency", "RTO and RPO"],
          variant: "core",
          size: "lg"
        },
        {
          id: "backup-strategies",
          label: "Backup & Replication",
          x: 1280,
          y: 1095,
          why: "Regular backups with tested restoration procedures are non-negotiable. Cross-region replication adds resilience.",
          focus: ["Backup retention", "Point-in-time recovery"],
          variant: "branch",
          size: "md"
        },
        {
          id: "high-availability",
          label: "High Availability",
          x: 1280,
          y: 1170,
          why: "Multi-region and multi-zone deployments reduce the blast radius of failures. Load testing and failover procedures ensure they work.",
          focus: ["Multi-region failover", "Health checks"],
          variant: "branch",
          size: "md"
        },
        {
          id: "cost-optimization",
          label: "Cost Optimization",
          x: 840,
          y: 1310,
          why: "Cloud costs grow quickly if not monitored. Reserved instances, spot pricing, and resource tagging help control expenses.",
          focus: ["Cost allocation", "Reserved vs on-demand"],
          variant: "core",
          size: "lg"
        },
        {
          id: "cost-analysis",
          label: "Cost Analysis & RI",
          x: 1280,
          y: 1255,
          why: "Understanding your bill and using reserved instances or spot pricing can cut costs significantly. Regular reviews prevent waste.",
          focus: ["Cost per service", "Savings plans"],
          variant: "branch",
          size: "md"
        },
        {
          id: "architecture-patterns",
          label: "Architecture Patterns",
          x: 840,
          y: 1470,
          why: "Proven patterns (microservices, event-driven, serverless) guide cloud design. Choosing the right pattern affects scalability and operational complexity.",
          focus: ["Microservices", "Event-driven architecture"],
          variant: "core",
          size: "lg"
        },
        {
          id: "project",
          label: "Build Cloud Systems",
          x: 840,
          y: 1630,
          why: "Projects force you to integrate compute, storage, networking, security, and cost considerations into one working system.",
          focus: ["Deploy end-to-end apps", "Iterate and optimize"],
          variant: "core",
          size: "lg"
        }
      ],
      edges: [
        { from: "cloud-fundamentals", to: "compute-services", emphasis: true },
        { from: "compute-services", to: "storage", emphasis: true },
        { from: "storage", to: "networking", emphasis: true },
        { from: "networking", to: "scaling", emphasis: true },
        { from: "scaling", to: "security", emphasis: true },
        { from: "security", to: "disaster-recovery", emphasis: true },
        { from: "disaster-recovery", to: "cost-optimization", emphasis: true },
        { from: "cost-optimization", to: "architecture-patterns", emphasis: true },
        { from: "architecture-patterns", to: "project", emphasis: true },
        { from: "compute-services", to: "ec2-vms", style: "dashed" },
        { from: "compute-services", to: "lambda-serverless", style: "dashed" },
        { from: "storage", to: "object-storage", style: "dashed" },
        { from: "storage", to: "databases", style: "dashed" },
        { from: "networking", to: "load-balancing", style: "dashed" },
        { from: "networking", to: "cdn", style: "dashed" },
        { from: "scaling", to: "auto-scaling", style: "dashed" },
        { from: "scaling", to: "monitoring-cloud", style: "dashed" },
        { from: "security", to: "iam", style: "dashed" },
        { from: "security", to: "secrets-management", style: "dashed" },
        { from: "disaster-recovery", to: "backup-strategies", style: "dashed" },
        { from: "disaster-recovery", to: "high-availability", style: "dashed" },
        { from: "cost-optimization", to: "cost-analysis", style: "dashed" }
      ]
    }
  }
};

export const roadmapList = Object.values(roadmaps);

export const backendRoadmap = roadmaps.backend;
export const frontendRoadmap = roadmaps.frontend;
export const devopsRoadmap = roadmaps.devops;
export const cloudRoadmap = roadmaps.cloud;
