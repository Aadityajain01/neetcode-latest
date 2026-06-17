export type TechDetail = {
  title: string;
  salary: string;
  demand: "High" | "Medium" | "Low" | "Very High";
  entry: string;
  summary: string;
  description: string;
  history: Array<{
    year: number;
    averageSalary: number;
    demandChange: number;
  }>;
  responsibilities: string[];
  standout: string[];
  skills: {
    core: string[];
    tools: string[];
  };
  suitability: string[];
};

export const techDetails: Record<string, TechDetail> = {
  backend: {
    title: "Backend Developer",
    salary: "₹8–25 LPA",
    demand: "High",
    entry: "Intermediate",
    summary: "Server-side APIs, databases, auth, and scalable application logic.",
    description:
      "A backend developer builds the brain of an application. While users interact with buttons, pages, and designs on the frontend, everything that happens behind the scenes like saving data, processing requests, handling authentication, and managing business logic is controlled by the backend. Backend developers ensure that systems are reliable, fast, and secure. Their work directly affects how well an application performs under real-world usage.",
    history: [
      { year: 2016, averageSalary: 4.8, demandChange: 5 },
      { year: 2017, averageSalary: 5.2, demandChange: 6 },
      { year: 2018, averageSalary: 5.9, demandChange: 8 },
      { year: 2019, averageSalary: 6.7, demandChange: 9 },
      { year: 2020, averageSalary: 7.1, demandChange: 4 },
      { year: 2021, averageSalary: 8.4, demandChange: 11 },
      { year: 2022, averageSalary: 9.6, demandChange: 13 },
      { year: 2023, averageSalary: 11.2, demandChange: 15 },
      { year: 2024, averageSalary: 12.9, demandChange: 17 },
      { year: 2025, averageSalary: 14.8, demandChange: 16 },
      { year: 2026, averageSalary: 16.5, demandChange: 18 }
    ],
    responsibilities: [
      "Design and develop APIs that connect frontend and backend systems",
      "Handle database operations such as storing, retrieving, and updating data",
      "Implement authentication and authorization (login systems, user roles)",
      "Write business logic that powers application features",
      "Optimize performance to handle thousands or millions of users",
      "Ensure security best practices (data protection, encryption, validation)",
      "Debug issues and fix bugs in server-side systems",
      "Collaborate with frontend developers and DevOps engineers",
      "Design scalable system architecture for long-term growth"
    ],
    standout: [
      "Understanding how systems behave at scale (not just writing code, but thinking like an architect)",
      "Writing efficient and optimized queries instead of relying on default solutions",
      "Designing clean and reusable API structures (RESTful or GraphQL)",
      "Handling edge cases properly (network failures, invalid inputs, race conditions)",
      "Strong debugging skills - ability to trace issues across multiple layers",
      "Awareness of security vulnerabilities (SQL injection, XSS, CSRF) and how to prevent them",
      "Ability to break down complex features into simple backend logic",
      "Writing clean, maintainable, and well-structured code instead of quick hacks",
      "Understanding real-world system design concepts like caching, load balancing, and queues"
    ],
    skills: {
      core: [
        "Strong programming fundamentals (JavaScript / Python / Java / Go)",
        "Understanding of data structures and algorithms",
        "API design and development (REST / GraphQL)",
        "Database management (SQL and NoSQL)",
        "Authentication & authorization concepts",
        "Error handling and logging",
        "Understanding asynchronous programming",
        "System design basics",
        "Understanding of HTTP protocols and request lifecycle"
      ],
      tools: [
        "Node.js / Express / Fastify",
        "Django / Flask (Python)",
        "Spring Boot (Java)",
        "MongoDB / PostgreSQL / MySQL",
        "Redis (caching)",
        "Docker (containerization)",
        "JWT / OAuth (authentication)",
        "Git & GitHub",
        "Postman / Thunder Client (API testing)",
        "NGINX (server handling)",
        "AWS / Vercel / Railway (deployment)",
        "Kafka / RabbitMQ (message queues)"
      ]
    },
    suitability: [
      "People who enjoy solving complex logical problems rather than designing UI",
      "Those who like understanding how systems work internally",
      "Developers who are patient and can debug deeply when things break",
      "Individuals comfortable working without visual output (most work is behind the scenes)",
      "People who enjoy thinking about performance, scalability, and efficiency",
      "Those who prefer structured thinking and system planning",
      "Developers who like working with data and workflows",
      "People who are curious about how big platforms (like Netflix, Instagram) actually work under the hood"
    ]
  },
  frontend: {
    title: "Frontend Developer",
    salary: "₹6–22 LPA",
    demand: "Very High",
    entry: "Beginner",
    summary: "User interfaces, responsive design, interactive experiences, and pixel-perfect web applications.",
    description:
      "A frontend developer creates everything users see and interact with in a web or mobile application. They turn designs into functional, beautiful, and responsive interfaces using HTML, CSS, and JavaScript. Modern frontend developers focus heavily on performance, accessibility, user experience, and building complex interactive applications with frameworks like React, Next.js, or Vue. Their work directly impacts how users perceive and engage with a product.",
    history: [
      { year: 2016, averageSalary: 4.2, demandChange: 8 },
      { year: 2017, averageSalary: 4.8, demandChange: 9 },
      { year: 2018, averageSalary: 5.5, demandChange: 11 },
      { year: 2019, averageSalary: 6.3, demandChange: 12 },
      { year: 2020, averageSalary: 6.8, demandChange: 7 },
      { year: 2021, averageSalary: 8.1, demandChange: 14 },
      { year: 2022, averageSalary: 9.4, demandChange: 15 },
      { year: 2023, averageSalary: 10.8, demandChange: 16 },
      { year: 2024, averageSalary: 12.4, demandChange: 18 },
      { year: 2025, averageSalary: 14.1, demandChange: 17 },
      { year: 2026, averageSalary: 15.7, demandChange: 19 }
    ],
    responsibilities: [
      "Translate UI/UX designs into responsive, pixel-perfect web interfaces",
      "Build interactive and dynamic user experiences using JavaScript frameworks",
      "Ensure mobile responsiveness and cross-browser compatibility",
      "Optimize frontend performance (loading speed, rendering, bundle size)",
      "Implement state management and data flow in complex applications",
      "Write accessible, semantic, and SEO-friendly code",
      "Integrate with backend APIs and handle data fetching",
      "Create reusable components and maintain design systems",
      "Collaborate closely with designers and backend developers",
      "Debug UI issues and ensure smooth user interactions"
    ],
    standout: [
      "Strong sense of design, typography, and visual hierarchy",
      "Writing clean, maintainable, and highly reusable component code",
      "Mastering performance optimization and Core Web Vitals",
      "Deep understanding of browser rendering and DOM manipulation",
      "Creating delightful micro-interactions and smooth animations",
      "Building accessible interfaces that work for everyone",
      "Thinking in terms of user experience, not just functionality",
      "Staying updated with rapidly evolving frontend ecosystem",
      "Ability to turn complex designs into efficient, scalable code"
    ],
    skills: {
      core: [
        "HTML5, CSS3, and modern JavaScript (ES6+)",
        "Responsive design and mobile-first approach",
        "Component-based architecture",
        "State management patterns",
        "Understanding of browser internals and rendering",
        "Web performance optimization",
        "Accessibility (a11y) standards",
        "Version control with Git",
        "Basic understanding of REST APIs and data fetching"
      ],
      tools: [
        "React.js / Next.js",
        "TypeScript",
        "Tailwind CSS / SCSS / Styled Components",
        "Redux / Zustand / React Query",
        "Vue.js / Nuxt.js (optional)",
        "Webpack / Vite",
        "Jest / React Testing Library",
        "Figma (design handoff)",
        "Git & GitHub",
        "Chrome DevTools",
        "Storybook",
        "Framer Motion (animations)"
      ]
    },
    suitability: [
      "People who love creating beautiful and intuitive user interfaces",
      "Those who enjoy seeing immediate visual results of their code",
      "Design-oriented developers who care about user experience",
      "Individuals who like working with colors, layouts, and animations",
      "Developers who enjoy fast feedback loops and visual creativity",
      "People who want to work closely with designers",
      "Those who are detail-oriented and have a good eye for design",
      "Developers who like building products users interact with daily"
    ]
  }, softwareEngineer: {
    title: "Software Engineer",
    salary: "₹10–35 LPA",
    demand: "Very High",
    entry: "Intermediate",
    summary: "End-to-end application development, system design, problem-solving, and building scalable software solutions.",
    description:
      "A Software Engineer is a versatile professional who designs, develops, tests, and maintains complete software applications. Unlike role-specific developers, Software Engineers work across the full stack or on complex systems. They focus on solving real-world problems, writing clean and efficient code, designing robust architectures, and ensuring software is reliable, maintainable, and scalable. This role often involves collaboration across teams and ownership of features from concept to production.",
    history: [
      { year: 2016, averageSalary: 5.5, demandChange: 7 },
      { year: 2017, averageSalary: 6.1, demandChange: 8 },
      { year: 2018, averageSalary: 7.0, demandChange: 10 },
      { year: 2019, averageSalary: 8.2, demandChange: 11 },
      { year: 2020, averageSalary: 8.8, demandChange: 6 },
      { year: 2021, averageSalary: 10.5, demandChange: 14 },
      { year: 2022, averageSalary: 12.3, demandChange: 16 },
      { year: 2023, averageSalary: 14.1, demandChange: 15 },
      { year: 2024, averageSalary: 16.5, demandChange: 18 },
      { year: 2025, averageSalary: 18.8, demandChange: 17 },
      { year: 2026, averageSalary: 21.2, demandChange: 19 }
    ],
    responsibilities: [
      "Design and implement scalable software solutions from scratch",
      "Write clean, efficient, and maintainable code across frontend, backend, or full-stack",
      "Participate in system design and architecture discussions",
      "Collaborate with cross-functional teams (product, design, QA, DevOps)",
      "Debug complex issues across multiple layers of the application",
      "Write unit, integration, and end-to-end tests",
      "Optimize application performance and resource usage",
      "Mentor junior developers and conduct code reviews",
      "Stay updated with best practices and emerging technologies",
      "Ensure code quality, security, and reliability standards"
    ],
    standout: [
      "Strong problem-solving and algorithmic thinking",
      "Ability to design systems that scale to millions of users",
      "Deep understanding of both frontend and backend ecosystems",
      "Excellent code quality and engineering practices",
      "Ownership mindset - taking features from idea to production",
      "Strong communication and collaboration skills",
      "Ability to break down complex problems into manageable tasks",
      "Continuous learning and adaptability to new technologies",
      "Focus on long-term maintainability and technical debt reduction"
    ],
    skills: {
      core: [
        "Strong fundamentals in Data Structures & Algorithms",
        "System design and architecture",
        "Full-stack development principles",
        "Object-Oriented Programming and Design Patterns",
        "Database design and optimization",
        "API development and integration",
        "Testing and quality assurance",
        "Version control and CI/CD concepts",
        "Problem-solving and analytical thinking"
      ],
      tools: [
        "JavaScript / TypeScript",
        "Python / Java / Go / C++",
        "React / Next.js",
        "Node.js / Express or Spring Boot",
        "SQL & NoSQL databases",
        "Docker & Kubernetes",
        "AWS / GCP / Azure",
        "Git & GitHub",
        "Postman / Swagger",
        "Jest / JUnit / PyTest"
      ]
    },
    suitability: [
      "People who enjoy solving complex technical problems",
      "Those who want a broad and versatile career in tech",
      "Developers who like working on complete products end-to-end",
      "Individuals with strong logical and analytical thinking",
      "Those who enjoy continuous learning and variety in their work",
      "Engineers who value clean architecture and long-term code quality",
      "People comfortable working across different layers of technology",
      "Aspiring tech leaders or system architects"
    ]
  },
    fullStack: {
    title: "Full Stack Developer",
    salary: "₹8–30 LPA",
    demand: "Very High",
    entry: "Intermediate",
    summary: "Complete web applications — frontend, backend, databases, and deployment.",
    description:
      "A Full Stack Developer works on both the frontend and backend of applications, building end-to-end features. They handle everything from designing user interfaces to managing servers, databases, and deployment. Full Stack Developers are highly valued for their versatility and ability to work independently on complete features or small applications. They bridge the gap between designers, backend teams, and DevOps, making them crucial in fast-moving startups and product teams.",
    history: [
      { year: 2016, averageSalary: 5.0, demandChange: 9 },
      { year: 2017, averageSalary: 5.8, demandChange: 10 },
      { year: 2018, averageSalary: 6.7, demandChange: 12 },
      { year: 2019, averageSalary: 7.8, demandChange: 13 },
      { year: 2020, averageSalary: 8.3, demandChange: 8 },
      { year: 2021, averageSalary: 10.2, demandChange: 15 },
      { year: 2022, averageSalary: 12.1, demandChange: 17 },
      { year: 2023, averageSalary: 14.0, demandChange: 16 },
      { year: 2024, averageSalary: 16.2, demandChange: 18 },
      { year: 2025, averageSalary: 18.5, demandChange: 17 },
      { year: 2026, averageSalary: 20.8, demandChange: 19 }
    ],
    responsibilities: [
      "Develop complete features across frontend and backend",
      "Build responsive user interfaces with modern frameworks",
      "Design and implement RESTful or GraphQL APIs",
      "Work with databases (SQL & NoSQL) for data management",
      "Integrate frontend with backend services and third-party APIs",
      "Handle authentication, authorization, and security",
      "Deploy and maintain applications on cloud platforms",
      "Optimize performance across the entire stack",
      "Write clean, maintainable, and well-documented code",
      "Collaborate with designers, product managers, and other developers"
    ],
    standout: [
      "Versatility across both client-side and server-side development",
      "Ability to quickly learn and switch between technologies",
      "Strong system thinking — understanding how all layers connect",
      "Building production-ready applications end-to-end",
      "Balancing speed of development with code quality",
      "Debugging complex issues spanning multiple layers",
      "Creating scalable and maintainable full-stack architectures",
      "Strong product sense and user experience awareness",
      "Excellent problem-solving across the entire tech stack"
    ],
    skills: {
      core: [
        "Frontend development (HTML, CSS, JavaScript)",
        "Backend development and API design",
        "Database management (SQL & NoSQL)",
        "State management and frontend architecture",
        "Authentication and security best practices",
        "Version control with Git",
        "Basic DevOps and deployment knowledge",
        "RESTful APIs and GraphQL",
        "Testing (unit, integration, E2E)"
      ],
      tools: [
        "React.js / Next.js",
        "Node.js / Express",
        "TypeScript",
        "MongoDB / PostgreSQL",
        "Tailwind CSS",
        "Redux / Zustand",
        "Docker",
        "AWS / Vercel / Railway",
        "Git & GitHub",
        "Postman",
        "Prisma / Mongoose"
      ]
    },
    suitability: [
      "People who want to work on complete products from start to finish",
      "Developers who enjoy variety and learning multiple technologies",
      "Those who like owning features end-to-end",
      "Independent problem-solvers comfortable wearing multiple hats",
      "Aspiring entrepreneurs or startup enthusiasts",
      "Developers who enjoy both design/UX and backend logic",
      "Those who want faster career growth through broad skill sets",
      "Engineers who thrive in dynamic, fast-paced environments"
    ]
  },  mobileAppDeveloper: {
    title: "Mobile App Developer",
    salary: "₹8–28 LPA",
    demand: "High",
    entry: "Intermediate",
    summary: "Native and cross-platform mobile applications for iOS and Android.",
    description:
      "A Mobile App Developer builds applications that run on smartphones and tablets. They create intuitive, performant, and engaging mobile experiences for both iOS and Android platforms. Modern mobile developers often work with cross-platform frameworks like React Native or Flutter to build once and deploy everywhere, while some specialize in native development using Swift or Kotlin. Their work focuses on device capabilities, offline functionality, performance, and delivering app store-ready products.",
    history: [
      { year: 2016, averageSalary: 5.2, demandChange: 10 },
      { year: 2017, averageSalary: 6.0, demandChange: 11 },
      { year: 2018, averageSalary: 7.1, demandChange: 12 },
      { year: 2019, averageSalary: 8.3, demandChange: 13 },
      { year: 2020, averageSalary: 8.7, demandChange: 7 },
      { year: 2021, averageSalary: 10.8, demandChange: 15 },
      { year: 2022, averageSalary: 12.6, demandChange: 14 },
      { year: 2023, averageSalary: 14.5, demandChange: 16 },
      { year: 2024, averageSalary: 16.8, demandChange: 17 },
      { year: 2025, averageSalary: 19.2, demandChange: 15 },
      { year: 2026, averageSalary: 21.5, demandChange: 18 }
    ],
    responsibilities: [
      "Design and develop mobile applications for iOS and/or Android",
      "Create smooth, responsive, and native-like user interfaces",
      "Integrate with backend APIs and third-party services",
      "Implement offline functionality and local data storage",
      "Optimize app performance, battery usage, and memory",
      "Handle device-specific features (camera, GPS, push notifications)",
      "Write unit and UI tests for mobile applications",
      "Publish and maintain apps on Google Play and App Store",
      "Ensure security and data privacy compliance",
      "Collaborate with designers and backend teams"
    ],
    standout: [
      "Deep understanding of mobile platform guidelines and UX patterns",
      "Building high-performance apps with smooth animations",
      "Expertise in state management for complex mobile apps",
      "Ability to create pixel-perfect, responsive UIs",
      "Strong debugging skills on real devices and emulators",
      "Knowledge of app deployment and store optimization (ASO)",
      "Balancing native performance with cross-platform development",
      "Handling complex features like real-time sync and background tasks"
    ],
    skills: {
      core: [
        "Mobile UI/UX principles",
        "RESTful APIs and data synchronization",
        "State management in mobile apps",
        "Offline-first architecture",
        "Performance optimization",
        "Testing and debugging on mobile devices",
        "Version control with Git",
        "Basic understanding of mobile security"
      ],
      tools: [
        "React Native",
        "Flutter",
        "Swift / SwiftUI (iOS)",
        "Kotlin / Jetpack Compose (Android)",
        "Firebase",
        "Redux / MobX / Riverpod",
        "Expo (for React Native)",
        "Android Studio / Xcode",
        "Git & GitHub",
        "Fastlane / App Center"
      ]
    },
    suitability: [
      "People who love building apps users carry in their pockets",
      "Developers who enjoy working with device hardware and sensors",
      "Those who want to create consumer-facing products",
      "Individuals who like seeing their work in app stores",
      "Developers interested in mobile-first user experiences",
      "People comfortable with platform-specific challenges",
      "Those who want high visibility and impact on users",
      "Aspiring indie developers or startup founders"
    ]
  },  webDeveloper: {
    title: "Web Developer",
    salary: "₹5–20 LPA",
    demand: "Very High",
    entry: "Beginner",
    summary: "Websites, web applications, landing pages, and interactive web experiences.",
    description:
      "A Web Developer builds and maintains websites and web-based applications. This role ranges from creating simple static websites to complex, dynamic web applications. Web Developers focus on delivering fast, accessible, and responsive experiences across all devices. While frontend developers are a subset, general Web Developers often handle both client-side development and basic backend or CMS integration.",
    history: [
      { year: 2016, averageSalary: 3.8, demandChange: 12 },
      { year: 2017, averageSalary: 4.5, demandChange: 11 },
      { year: 2018, averageSalary: 5.2, demandChange: 10 },
      { year: 2019, averageSalary: 6.0, demandChange: 13 },
      { year: 2020, averageSalary: 6.4, demandChange: 8 },
      { year: 2021, averageSalary: 7.8, demandChange: 15 },
      { year: 2022, averageSalary: 9.1, demandChange: 14 },
      { year: 2023, averageSalary: 10.5, demandChange: 16 },
      { year: 2024, averageSalary: 12.0, demandChange: 15 },
      { year: 2025, averageSalary: 13.6, demandChange: 14 },
      { year: 2026, averageSalary: 15.2, demandChange: 17 }
    ],
    responsibilities: [
      "Build responsive and accessible websites",
      "Convert designs into functional web pages",
      "Implement interactive features and animations",
      "Optimize websites for performance and SEO",
      "Integrate with content management systems (CMS)",
      "Ensure cross-browser and device compatibility",
      "Maintain and update existing websites",
      "Work with APIs to fetch and display dynamic content",
      "Debug and fix issues across different environments",
      "Collaborate with designers and stakeholders"
    ],
    standout: [
      "Creating beautiful, fast, and user-friendly websites",
      "Strong attention to detail and design implementation",
      "Mastery of modern HTML, CSS, and JavaScript",
      "SEO and performance optimization skills",
      "Building accessible websites for all users",
      "Ability to work with various CMS platforms",
      "Quick problem-solving for cross-device issues",
      "Keeping up with evolving web standards"
    ],
    skills: {
      core: [
        "HTML5, CSS3, and JavaScript (ES6+)",
        "Responsive and mobile-first design",
        "DOM manipulation and event handling",
        "Basic SEO principles",
        "Web performance optimization",
        "Accessibility standards",
        "Version control with Git",
        "Understanding of browsers and web protocols"
      ],
      tools: [
        "React.js / Next.js",
        "Tailwind CSS / Bootstrap",
        "WordPress / Webflow",
        "JavaScript frameworks",
        "Git & GitHub",
        "Chrome DevTools",
        "Figma",
        "Vercel / Netlify",
        "Webpack / Vite"
      ]
    },
    suitability: [
      "People who enjoy building things visible on the internet",
      "Creative individuals who like visual and interactive work",
      "Beginners looking for an accessible entry into tech",
      "Those who want quick visual feedback from their code",
      "Developers interested in design and user experience",
      "Freelancers who want to build client websites",
      "People who like working on diverse projects",
      "Anyone passionate about the open web"
    ]
  }
};
