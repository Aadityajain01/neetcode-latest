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

export type MetroLineDefinition = {
  id: string;
  name: string;
  color: string;
  stations: Array<string | { x: number; y: number }>;
};

export type RoadmapTopic = {
  id: string;
  title: string;
  description: string;
  subtopics?: RoadmapSubtopic[];
  content?: RoadmapNodeContent;
  
  // Metromap properties
  x?: number;
  y?: number;
  labelPos?: "above" | "below" | "left" | "right" | "above-left" | "above-right" | "below-left" | "below-right";
  isInterchange?: boolean;
  subtitle?: string;
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
  
  // Metromap layout configuration
  layoutType?: "metromap" | "tree";
  metroLines?: MetroLineDefinition[];
};

export const roadmaps: Record<string, RoadmapDefinition> = {
  frontend: {
    slug: "frontend",
    title: "Frontend Development",
    level: "Intermediate",
    estimatedTime: "6-9 months",
    status: "available",
    summary: "HTML, CSS, JavaScript, React, Node.js, Express, REST APIs, MongoDB, Auth, Deploy, Projects, and DSA",
    description: "Complete roadmap to master modern frontend & full-stack engineering",
    layoutType: "metromap",
    metroLines: [
      {
        id: "foundations",
        name: "FOUNDATIONS LINE",
        color: "#4ade80",
        stations: ["html", "css", "javascript"]
      },
      {
        id: "advanced",
        name: "ADVANCED LINE",
        color: "#c084fc",
        stations: ["css", "dsa", "system-design", "interview-prep", "placement"]
      },
      {
        id: "frontend",
        name: "FRONTEND LINE",
        color: "#facc15",
        stations: ["javascript", { x: 450, y: 250 }, "react", "tailwind", "nextjs"]
      },
      {
        id: "backend",
        name: "BACKEND LINE",
        color: "#3b82f6",
        stations: ["nextjs", "nodejs", "express", "rest-api"]
      },
      {
        id: "data-deploy",
        name: "DATA & DEPLOY LINE",
        color: "#f87171",
        stations: ["rest-api", "mongodb", "auth", "cloud-deploy"]
      },
      {
        id: "career",
        name: "CAREER LINE",
        color: "#ec4899",
        stations: ["cloud-deploy", "portfolio", "internship", "placement"]
      }
    ],
    topics: [
      {
        id: "html",
        title: "HTML",
        description: "HyperText Markup Language - the structural backbone of all web pages.",
        x: 100,
        y: 100,
        labelPos: "above",
        subtitle: "structure",
        content: {
          description: "HTML (HyperText Markup Language) is the standard markup language for documents designed to be displayed in a web browser. It defines the structure and layout of web content.",
          syntax: "<!DOCTYPE html>\n<html>\n  <head>\n    <title>Page Title</title>\n  </head>\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>",
          examples: ["Semantic elements (header, nav, main, footer)", "Forms and validation attributes", "Meta tags for SEO and responsiveness"],
          bestPractices: ["Always use semantic HTML tags instead of generic div/span", "Include descriptive alt attributes on all images", "Ensure proper heading structure (h1-h6)"]
        }
      },
      {
        id: "css",
        title: "CSS",
        description: "Cascading Style Sheets - controls the styling, layout, and visual presentation of HTML documents.",
        x: 250,
        y: 100,
        labelPos: "above-left",
        isInterchange: true,
        subtitle: "styling - interchange",
        content: {
          description: "CSS (Cascading Style Sheets) styles the structural content of web pages. It controls layout, typography, colors, animations, and responsive breakpoints.",
          syntax: ".button {\n  background-color: #3b82f6;\n  padding: 0.5rem 1rem;\n  border-radius: 0.375rem;\n  transition: all 0.2s;\n}",
          examples: ["Flexbox and Grid layout systems", "Responsive media queries", "CSS variables (custom properties)"],
          bestPractices: ["Use relative units (rem, em, %) for scalable spacing", "Adopt CSS naming conventions like BEM", "Prioritize performance by animating transform/opacity"]
        }
      },
      {
        id: "javascript",
        title: "JavaScript",
        description: "A high-level, interpreted scripting language that enables interactive web pages.",
        x: 450,
        y: 100,
        labelPos: "above",
        isInterchange: true,
        subtitle: "logic - interchange",
        content: {
          description: "JavaScript is the programming language of the web. It enables interactive user interfaces, dynamic content updates, asynchronous communication, and complex web applications.",
          syntax: "const fetchData = async (url) => {\n  try {\n    const response = await fetch(url);\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error(\"API error:\", error);\n  }\n};",
          examples: ["DOM event listeners and modifiers", "Asynchronous fetch operations and Promises", "Modern ES6+ array methods (map, filter, reduce)"],
          bestPractices: ["Use const by default, let only when reassignment is needed", "Avoid implicit coercion by always using ===", "Wrap asynchronous operations in try/catch blocks"]
        }
      },
      {
        id: "react",
        title: "React",
        description: "A component-based JavaScript library for building user interfaces.",
        x: 530,
        y: 250,
        labelPos: "above",
        subtitle: "components",
        content: {
          description: "React is a popular open-source JavaScript library developed by Meta for building component-based user interfaces. It optimizes rendering using a virtual DOM.",
          syntax: "import { useState } from 'react';\n\nexport function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount(c => c + 1)}>\n      Count: {count}\n    </button>\n  );\n}",
          examples: ["Functional components and Hooks", "State management and context APIs", "Reusable component composition"],
          bestPractices: ["Keep components small and focused on a single task", "Avoid unnecessary state; compute values dynamically when possible", "Memoize heavy computations using useMemo"]
        }
      },
      {
        id: "tailwind",
        title: "Tailwind CSS",
        description: "A utility-first CSS framework for rapid UI development.",
        x: 700,
        y: 250,
        labelPos: "above",
        subtitle: "utility styling",
        content: {
          description: "Tailwind CSS is a utility-first CSS framework that provides low-level utility classes to build custom designs directly in HTML without writing custom CSS files.",
          syntax: "<div className=\"flex flex-col items-center justify-between p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-brand-500 transition-all shadow-xl\">\n  <h2 className=\"text-lg font-bold text-white\">Card Title</h2>\n</div>",
          examples: ["Responsive classes (md:flex-row)", "Interactive state modifiers (hover:bg-zinc-800)", "Arbitrary value styling (h-[400px])"],
          bestPractices: ["Extract repetitive class combinations into reusable React components", "Leverage design tokens in tailwind.config.js", "Use container queries and modern grid classes"]
        }
      },
      {
        id: "nextjs",
        title: "Next.js",
        description: "A production-grade React framework with server-side rendering capabilities.",
        x: 880,
        y: 250,
        labelPos: "above-right",
        isInterchange: true,
        subtitle: "framework - interchange",
        content: {
          description: "Next.js is a production-ready React framework that enables server-side rendering (SSR), static site generation (SSG), incremental static regeneration (ISR), and native API routes.",
          syntax: "// App Router Server Component\nimport React from 'react';\n\nexport default async function Page() {\n  const res = await fetch('https://api.example.com/data');\n  const data = await res.json();\n  return (\n    <main className=\"p-6 text-white\">\n      <h1>{data.title}</h1>\n    </main>\n  );\n}",
          examples: ["Server-side data fetching", "File-system-based App Routing", "Optimized image and font delivery"],
          bestPractices: ["Use Server Components by default for better performance", "Use Client Components only for interactivity and client-side hooks", "Leverage dynamic routing and loading UI states"]
        }
      },
      {
        id: "nodejs",
        title: "Node.js",
        description: "A server-side JavaScript runtime built on Chrome's V8 engine.",
        x: 880,
        y: 400,
        labelPos: "above-right",
        subtitle: "runtime",
        content: {
          description: "Node.js is an open-source, cross-platform JavaScript runtime environment built on Chrome's V8 engine that executes JavaScript code outside of a web browser (server-side).",
          syntax: "const http = require('http');\n\nconst server = http.createServer((req, res) => {\n  res.statusCode = 200;\n  res.setHeader('Content-Type', 'text/plain');\n  res.end('Hello from Node.js!');\n});\nserver.listen(3000);",
          examples: ["File system access and streaming", "Custom HTTP server setup", "Command-line tools and utilities"],
          bestPractices: ["Use asynchronous non-blocking methods for I/O tasks", "Handle process errors and unhandled rejections gracefully", "Manage configuration values in environment variables"]
        }
      },
      {
        id: "express",
        title: "Express",
        description: "A minimal and flexible web application framework for Node.js.",
        x: 1030,
        y: 400,
        labelPos: "above-right",
        subtitle: "server framework",
        content: {
          description: "Express is a minimal and flexible Node.js web application framework that provides a robust set of features for building single, multi-page, and hybrid web applications/APIs.",
          syntax: "const express = require('express');\nconst app = express();\n\napp.use(express.json());\napp.get('/api/users', (req, res) => {\n  res.json([{ id: 1, name: 'Alice' }]);\n});\napp.listen(3000);",
          examples: ["Routing and controller configuration", "Middleware pipelines (logging, body parsing)", "Error handling middleware integrations"],
          bestPractices: ["Keep routes clean by isolating controller logic", "Use middleware to validate requests", "Always return standard, predictable JSON structures"]
        }
      },
      {
        id: "rest-api",
        title: "REST APIs",
        description: "Stateless interface standard for web communication.",
        x: 1030,
        y: 550,
        labelPos: "right",
        isInterchange: true,
        subtitle: "data layer interchange",
        content: {
          description: "Representational State Transfer (REST) is an architectural style for designing networked applications. It relies on stateless, client-server communication using HTTP verbs.",
          syntax: "// HTTP Request Structure\nGET /api/users HTTP/1.1\nHost: api.example.com\nAuthorization: Bearer <token>\n\n// HTTP Response Structure\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{ \"users\": [] }",
          examples: ["Standard HTTP methods (GET, POST, PUT, DELETE)", "Standard HTTP response codes (200, 201, 400, 401, 403, 404, 500)", "Query parameters and route constraints"],
          bestPractices: ["Use plural nouns for resource endpoints (e.g., /users)", "Implement proper pagination and filtering", "Use nested routes for relationships (e.g., /users/1/posts)"]
        }
      },
      {
        id: "mongodb",
        title: "MongoDB",
        description: "Document-oriented database for flexible applications.",
        x: 1030,
        y: 700,
        labelPos: "right",
        subtitle: "database",
        content: {
          description: "MongoDB is a source-available, document-oriented NoSQL database. It stores data in flexible, JSON-like documents (BSON), enabling dynamic schemas and scalable queries.",
          syntax: "// Mongoose schema definition\nconst mongoose = require('mongoose');\nconst userSchema = new mongoose.Schema({\n  username: { type: String, required: true, unique: true },\n  email: { type: String, required: true },\n  createdAt: { type: Date, default: Date.now }\n});\nconst User = mongoose.model('User', userSchema);",
          examples: ["Document creation, reading, updating, and deletion (CRUD)", "Aggregation pipelines for analytical queries", "Indexing for search speed optimization"],
          bestPractices: ["Define indexes for frequently queried fields", "Avoid deep document nesting; link collections where appropriate", "Use transactions for multi-document operations"]
        }
      },
      {
        id: "auth",
        title: "Auth & JWT",
        description: "Secure login and authorization patterns.",
        x: 780,
        y: 700,
        labelPos: "below",
        subtitle: "security",
        content: {
          description: "JSON Web Tokens (JWT) are an open, industry-standard method for representing claims securely between two parties, commonly used for stateless authorization and secure login.",
          syntax: "const jwt = require('jsonwebtoken');\n\n// Sign Token\nconst token = jwt.sign({ userId: '123' }, process.env.JWT_SECRET, {\n  expiresIn: '24h'\n});\n\n// Verify Token\nconst decoded = jwt.verify(token, process.env.JWT_SECRET);",
          examples: ["Stateless token-based authentication", "Refresh token rotation flows", "Role-based authorization middleware"],
          bestPractices: ["Never store sensitive info (like passwords) inside JWT claims", "Set appropriate token expiration times", "Store JWTs securely on the client (e.g., in httpOnly cookies)"]
        }
      },
      {
        id: "cloud-deploy",
        title: "Cloud Deploy",
        description: "Deployment to AWS and Vercel services.",
        x: 580,
        y: 700,
        labelPos: "below",
        isInterchange: true,
        subtitle: "AWS / Vercel - interchange",
        content: {
          description: "Deploying frontend apps to serverless hosting (Vercel/Netlify) and backend services to cloud providers (AWS, Google Cloud, Heroku) for public access.",
          syntax: "# Vercel deployment command\nvercel --prod\n\n# Dockerfile template for Node.js backend\nFROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD [\"npm\", \"start\"]",
          examples: ["Vercel Git-integrated deployments", "AWS EC2 and ECS container instances", "Docker containerization and deployment"],
          bestPractices: ["Set up automated CI/CD pipelines", "Use environment variables for production secrets", "Enable CDN caching and asset optimization"]
        }
      },
      {
        id: "portfolio",
        title: "Portfolio Projects",
        description: "Building production-grade applications to showcase.",
        x: 580,
        y: 850,
        labelPos: "below",
        subtitle: "4 shipped apps",
        content: {
          description: "Building and launching high-quality, fully-functional web applications to demonstrate your technical skill set, system architecture design, and coding style.",
          syntax: "# Recommended Portfolio Project Stack:\n- App 1: SaaS Platform (Next.js, Tailwind, Node, Postgres, Stripe)\n- App 2: Real-time Chat App (React, Socket.io, Express, MongoDB)\n- App 3: Interactive Dashboard (Vite, CSS Grid, Chart.js, REST API)\n- App 4: Open Source Contribution / NPM Package",
          examples: ["A full-stack e-commerce store with payments", "A real-time collaborative tool (like Trello)", "A developer tool or utility package"],
          bestPractices: ["Deploy all apps live and provide visible links", "Ensure your Git repositories have high-quality, descriptive READMEs", "Focus on clean UI design, accessibility, and zero-bug execution"]
        }
      },
      {
        id: "internship",
        title: "Paid Internship",
        description: "Gain professional real-world software experience.",
        x: 400,
        y: 850,
        labelPos: "below",
        subtitle: "real client work",
        content: {
          description: "Gaining professional, real-world development experience by working in a team, writing production code, handling client feedback, and participating in agile ceremonies.",
          syntax: "# Core Internship Workflows:\n- Daily Standups (What you did yesterday, what you will do today, blockers)\n- Pull Request Reviews (Giving and receiving constructive code feedback)\n- Agile Sprint Cycles (Estimation, story points, retrospectives)",
          examples: ["Working on client-facing features", "Refactoring legacy code bases for performance", "Writing integration and unit tests"],
          bestPractices: ["Be proactive and ask questions after attempting solutions", "Document your work and findings cleanly", "Prioritize learning team processes and production standards"]
        }
      },
      {
        id: "placement",
        title: "Placement",
        description: "Transitioning to a professional software engineer role.",
        x: 250,
        y: 850,
        labelPos: "below-left",
        isInterchange: true,
        subtitle: "final stop",
        content: {
          description: "The final milestone where you transition into a professional software engineer role through job interviews, technical screens, portfolio showcases, and offers.",
          syntax: "# Target Placement Checklist:\n- Optimized Resume (focused on projects & internships)\n- Active LinkedIn and GitHub profiles\n- Confident communication & salary negotiation skills\n- Signed offer letter!",
          examples: ["Full-time frontend engineer roles", "Full-time full-stack developer roles", "Remote engineering opportunities"],
          bestPractices: ["Maintain a consistent application pipeline", "Prepare thoroughly for HR and technical interview stages", "Review salary benchmarks and practice negotiation"]
        }
      },
      {
        id: "dsa",
        title: "DSA",
        description: "Data Structures and Algorithms for problem solving.",
        x: 250,
        y: 400,
        labelPos: "left",
        subtitle: "problem solving",
        content: {
          description: "Data Structures and Algorithms (DSA) form the foundation of computer science. Master key concepts to solve complex computational problems and pass technical screens.",
          syntax: "// Binary Search Implementation\nfunction binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    let mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}",
          examples: ["Arrays, Linked Lists, Trees, and Graphs", "Sorting, searching, and traversal algorithms", "Dynamic Programming and Recursion"],
          bestPractices: ["Analyze time and space complexities (Big O notation)", "Solve patterns rather than memorizing individual problems", "Practice mock coding interviews regularly"]
        }
      },
      {
        id: "system-design",
        title: "System Design",
        description: "System architecture and scalability principles.",
        x: 250,
        y: 550,
        labelPos: "left",
        subtitle: "architecture",
        content: {
          description: "System Design involves defining the architecture, modules, interfaces, and data for a system to satisfy specified requirements, focusing on scalability and reliability.",
          syntax: "# Key Architectural Components:\n- Client (Browser, Mobile App)\n- CDN (Asset caching)\n- Load Balancer (Traffic distribution)\n- Web Servers (Stateless application layer)\n- Cache (Redis database load reduction)\n- Database (SQL/NoSQL storage)",
          examples: ["Scalable vertical and horizontal scaling designs", "Distributed caching and database replication structures", "Rate limiters and microservice architectures"],
          bestPractices: ["Identify scale requirements and bottlenecks first", "Design stateless server components", "Incorporate redundancy and failover mechanisms"]
        }
      },
      {
        id: "interview-prep",
        title: "Interview Prep",
        description: "Mock rounds and interview strategies.",
        x: 250,
        y: 700,
        labelPos: "left",
        subtitle: "mock rounds - interchange",
        content: {
          description: "Preparing for behavioral, system design, and coding interview rounds using mock practice sessions, resume reviews, and question banks.",
          syntax: "# STAR Method for Behavioral Questions:\n- Situation: Describe the context of your task\n- Task: Explain your responsibility or challenge\n- Action: Detail the steps you took to address it\n- Result: State the positive outcome and what you learned",
          examples: ["Peer-to-peer mock coding interviews", "Behavioral mock sessions", "Whiteboard system design practice"],
          bestPractices: ["Think out loud during coding sessions to share your process", "Prepare 3-4 key project stories using the STAR method", "Understand the business and culture of the company you are interviewing with"]
        }
      }
    ]
  }
};

export const roadmapList = Object.values(roadmaps);
export const frontendRoadmap = roadmaps.frontend;
