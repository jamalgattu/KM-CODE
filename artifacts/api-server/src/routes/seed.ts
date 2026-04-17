import { Router, type IRouter } from "express";
import { db, filesTable } from "@workspace/db";

const router: IRouter = Router();

const DEFAULT_SEED = [
  { name: "my-project", type: "folder", path: "/my-project", content: null, language: null, parentId: null },
  { name: "src", type: "folder", path: "/my-project/src", content: null, language: null, parentPath: "/my-project" },
  {
    name: "main.ts", type: "file", path: "/my-project/src/main.ts", language: "typescript", parentPath: "/my-project/src",
    content: `// Welcome to Code Editor!\n\ninterface User { id: number; name: string; email: string; }\n\nclass UserService {\n  private users: User[] = [];\n\n  add(user: Omit<User, "id">): User {\n    const u = { ...user, id: this.users.length + 1 };\n    this.users.push(u);\n    return u;\n  }\n\n  getAll(): User[] { return this.users; }\n}\n\nconst svc = new UserService();\nconsole.log(svc.add({ name: "Alice", email: "alice@example.com" }));\nconsole.log(svc.add({ name: "Bob", email: "bob@example.com" }));\nconsole.log("All users:", svc.getAll());\n`,
  },
  {
    name: "hello.js", type: "file", path: "/my-project/hello.js", language: "javascript", parentPath: "/my-project",
    content: `// Click the ▶ Run button to execute this file!\nconsole.log("Hello from Code Editor!");\nconsole.log("Time:", new Date().toLocaleTimeString());\n\nconst nums = [1, 2, 3, 4, 5];\nconsole.log("Doubled:", nums.map(n => n * 2));\n`,
  },
  {
    name: "hello.py", type: "file", path: "/my-project/hello.py", language: "python", parentPath: "/my-project",
    content: `# Click the ▶ Run button to execute this file!\nprint("Hello from Python!")\n\nfrom datetime import datetime\nprint("Time:", datetime.now().strftime("%H:%M:%S"))\n\nnumbers = [1, 2, 3, 4, 5]\nprint("Doubled:", [n * 2 for n in numbers])\n`,
  },
  {
    name: "README.md", type: "file", path: "/my-project/README.md", language: "markdown", parentPath: "/my-project",
    content: `# My Project\n\nA code editor running on mobile.\n\n## Running Code\n\nOpen any **.js**, **.py**, or **.ts** file and click the green **▶ Run** button.\n\n## Terminal\n\nUse the Terminal panel to run shell commands:\n\`\`\`\necho hello\nls /\npwd\n\`\`\`\n`,
  },
];

router.post("/seed", async (req, res): Promise<void> => {
  const existing = await db.select().from(filesTable);
  if (existing.length > 0) {
    res.json({ message: `Already seeded (${existing.length} files)`, skipped: true });
    return;
  }

  const pathToId = new Map<string, number>();
  const created = [];

  for (const file of DEFAULT_SEED) {
    const parentId = "parentPath" in file && file.parentPath
      ? (pathToId.get(file.parentPath) ?? null)
      : (file.parentId ?? null);

    const [row] = await db.insert(filesTable)
      .values({
        name: file.name,
        type: file.type as "file" | "folder",
        path: file.path,
        content: file.content ?? null,
        language: file.language ?? null,
        parentId,
      })
      .returning();

    pathToId.set(file.path, row.id);
    created.push(row.path);
  }

  res.json({ message: `Seeded ${created.length} files`, created });
});

export default router;
