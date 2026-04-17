import { db, filesTable } from "@workspace/db";

const DEFAULT_FILES = [
  {
    name: "my-project",
    type: "folder",
    path: "/my-project",
    content: null,
    language: null,
    parentId: null,
  },
  {
    name: "src",
    type: "folder",
    path: "/my-project/src",
    content: null,
    language: null,
    parentPath: "/my-project",
  },
  {
    name: "main.ts",
    type: "file",
    path: "/my-project/src/main.ts",
    language: "typescript",
    parentPath: "/my-project/src",
    content: `// Welcome to Code Editor - VS Code for Mobile!
// Start writing your TypeScript code here

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

class UserService {
  private users: User[] = [];

  constructor() {
    this.loadSampleUsers();
  }

  private loadSampleUsers(): void {
    this.users = [
      { id: 1, name: "Alice Johnson", email: "alice@example.com", createdAt: new Date() },
      { id: 2, name: "Bob Smith", email: "bob@example.com", createdAt: new Date() },
    ];
  }

  getAll(): User[] {
    return this.users;
  }

  create(data: Omit<User, "id" | "createdAt">): User {
    const user: User = { ...data, id: this.users.length + 1, createdAt: new Date() };
    this.users.push(user);
    return user;
  }
}

const service = new UserService();
console.log("Users:", service.getAll());
console.log("Created:", service.create({ name: "Dave Brown", email: "dave@example.com" }));
`,
  },
  {
    name: "utils.ts",
    type: "file",
    path: "/my-project/src/utils.ts",
    language: "typescript",
    parentPath: "/my-project/src",
    content: `// Utility functions

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function randomId(): string {
  return Math.random().toString(36).substring(2, 11);
}
`,
  },
  {
    name: "hello.js",
    type: "file",
    path: "/my-project/hello.js",
    language: "javascript",
    parentPath: "/my-project",
    content: `// Run this file with the ▶ Run button!
console.log("Hello from Code Editor!");
console.log("The current time is:", new Date().toLocaleTimeString());

const nums = [1, 2, 3, 4, 5];
const doubled = nums.map(n => n * 2);
console.log("Doubled:", doubled);
`,
  },
  {
    name: "hello.py",
    type: "file",
    path: "/my-project/hello.py",
    language: "python",
    parentPath: "/my-project",
    content: `# Run this file with the ▶ Run button!
print("Hello from Python!")

from datetime import datetime
print("Current time:", datetime.now().strftime("%H:%M:%S"))

numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]
print("Doubled:", doubled)
`,
  },
  {
    name: "package.json",
    type: "file",
    path: "/my-project/package.json",
    language: "json",
    parentPath: "/my-project",
    content: `{
  "name": "my-project",
  "version": "1.0.0",
  "description": "A modern TypeScript project",
  "scripts": {
    "dev": "node hello.js",
    "test": "echo 'No tests yet'"
  }
}
`,
  },
  {
    name: "README.md",
    type: "file",
    path: "/my-project/README.md",
    language: "markdown",
    parentPath: "/my-project",
    content: `# My Project

A code editor project running in the browser.

## Files

- **hello.js** — JavaScript example (click ▶ Run to execute)
- **hello.py** — Python example (click ▶ Run to execute)
- **src/main.ts** — TypeScript class example
- **src/utils.ts** — Utility functions

## Running Code

Open any \`.js\`, \`.py\`, \`.ts\`, or \`.sh\` file and click the green **▶ Run** button in the top right of the editor.

## Terminal

Use the Terminal panel at the bottom to run shell commands like:
\`\`\`
echo hello
ls
pwd
node --version
\`\`\`
`,
  },
];

async function seed() {
  const existing = await db.select().from(filesTable);
  if (existing.length > 0) {
    console.log(`DB already has ${existing.length} files — skipping seed.`);
    process.exit(0);
  }

  const pathToId = new Map<string, number>();

  for (const file of DEFAULT_FILES) {
    const parentId = "parentPath" in file && file.parentPath
      ? (pathToId.get(file.parentPath) ?? null)
      : null;

    const [created] = await db
      .insert(filesTable)
      .values({
        name: file.name,
        type: file.type as "file" | "folder",
        path: file.path,
        content: file.content ?? null,
        language: file.language ?? null,
        parentId,
      })
      .returning();

    pathToId.set(file.path, created.id);
    console.log(`  Created: ${file.type} ${file.path}`);
  }

  console.log(`\nSeeded ${DEFAULT_FILES.length} files.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
