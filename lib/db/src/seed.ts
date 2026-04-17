import { db } from "./client";
import { filesTable } from "./schema";

const DEFAULT_FILES = [
  { name: "my-project", type: "folder", path: "/my-project", content: null, language: null, parentId: null },
  { name: "src", type: "folder", path: "/my-project/src", content: null, language: null, parentPath: "/my-project" },
  {
    name: "main.ts", type: "file", path: "/my-project/src/main.ts", language: "typescript", parentPath: "/my-project/src",
    content: `// Welcome to Code Editor!\n\ninterface User { id: number; name: string; email: string; }\n\nclass UserService {\n  private users: User[] = [];\n\n  add(user: Omit<User, "id">): User {\n    const u = { ...user, id: this.users.length + 1 };\n    this.users.push(u);\n    return u;\n  }\n\n  getAll(): User[] { return this.users; }\n}\n\nconst svc = new UserService();\nconsole.log(svc.add({ name: "Alice", email: "alice@example.com" }));\nconsole.log(svc.add({ name: "Bob", email: "bob@example.com" }));\nconsole.log("All users:", svc.getAll());\n`,
  },
  {
    name: "hello.js", type: "file", path: "/my-project/hello.js", language: "javascript", parentPath: "/my-project",
    content: `// Click the ▶ Run button to execute this file!\nconsole.log("Hello from Code Editor!");\nconsole.log("Time:", new Date().toLocaleTimeString());\n\nconst nums = [1, 2, 3, 4, 5];\nconst doubled = nums.map(n => n * 2);\nconsole.log("Doubled:", doubled);\n\n// Try modifying this code and running again!\n`,
  },
  {
    name: "hello.py", type: "file", path: "/my-project/hello.py", language: "python", parentPath: "/my-project",
    content: `# Click the ▶ Run button to execute this file!\nprint("Hello from Python!")\n\nfrom datetime import datetime\nprint("Time:", datetime.now().strftime("%H:%M:%S"))\n\nnumbers = [1, 2, 3, 4, 5]\ndoubled = [n * 2 for n in numbers]\nprint("Doubled:", doubled)\n`,
  },
  {
    name: "README.md", type: "file", path: "/my-project/README.md", language: "markdown", parentPath: "/my-project",
    content: `# My Project\n\nA code editor running on mobile.\n\n## Running Code\n\nOpen any **.js**, **.py**, or **.ts** file and click the green **▶ Run** button.\n\n## Terminal\n\nUse the Terminal panel to run shell commands:\n\`\`\`\necho hello\nls /\npwd\n\`\`\`\n`,
  },
];

async function seed() {
  const existing = await db.select().from(filesTable);
  if (existing.length > 0) {
    console.log(`DB already has ${existing.length} files — skipping.`);
    process.exit(0);
  }

  const pathToId = new Map<string, number>();

  for (const file of DEFAULT_FILES) {
    const parentId = "parentPath" in file && file.parentPath
      ? (pathToId.get(file.parentPath) ?? null)
      : (file.parentId ?? null);

    const [created] = await db.insert(filesTable)
      .values({ name: file.name, type: file.type as "file" | "folder", path: file.path, content: file.content, language: file.language, parentId })
      .returning();

    pathToId.set(file.path, created.id);
    console.log(`  Created: ${file.type} ${file.path}`);
  }
  console.log(`\nSeeded ${DEFAULT_FILES.length} items.`);
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
