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
  }
};
