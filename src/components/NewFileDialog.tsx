import { useState, useRef, useEffect } from "react";
import { FilePlus, FolderPlus, X, ChevronDown } from "lucide-react";

const TEMPLATES: Record<string, { label: string; extension: string; content: string }[]> = {
  "Blank File": [{ label: "Blank", extension: "", content: "" }],
  JavaScript: [
    { label: "Hello World", extension: ".js", content: `console.log("Hello, World!");\n` },
    { label: "Arrow Function", extension: ".js", content: `const greet = (name) => {\n  return \`Hello, \${name}!\`;\n};\n\nconsole.log(greet("World"));\n` },
    { label: "Fetch Example", extension: ".js", content: `const url = "https://jsonplaceholder.typicode.com/todos/1";\n\nfetch(url)\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));\n` },
  ],
  TypeScript: [
    { label: "Hello World", extension: ".ts", content: `const message: string = "Hello, World!";\nconsole.log(message);\n` },
    { label: "Interface Example", extension: ".ts", content: `interface Person {\n  name: string;\n  age: number;\n}\n\nconst person: Person = { name: "Alice", age: 30 };\nconsole.log(person);\n` },
  ],
  Python: [
    { label: "Hello World", extension: ".py", content: `print("Hello, World!")\n` },
    { label: "Functions", extension: ".py", content: `def greet(name: str) -> str:\n    return f"Hello, {name}!"\n\nif __name__ == "__main__":\n    print(greet("World"))\n` },
    { label: "Class Example", extension: ".py", content: `class Animal:\n    def __init__(self, name: str):\n        self.name = name\n\n    def speak(self):\n        return f"{self.name} makes a sound"\n\ndog = Animal("Dog")\nprint(dog.speak())\n` },
    { label: "List Comprehension", extension: ".py", content: `numbers = [1, 2, 3, 4, 5]\nsquares = [x**2 for x in numbers]\nprint(squares)\n` },
    { label: "CP Boilerplate", extension: ".py", content: `import sys\ninput = sys.stdin.readline\nfrom collections import defaultdict, deque\nfrom itertools import permutations, combinations\nfrom heapq import heappush, heappop\n\ndef solve():\n    n = int(input())\n    # your solution here\n    print(n)\n\nt = int(input())\n# t = 1\nfor _ in range(t):\n    solve()\n` },
    { label: "CP Graph", extension: ".py", content: `import sys\nfrom collections import deque\ninput = sys.stdin.readline\n\ndef bfs(src, adj, n):\n    visited = [False] * (n + 1)\n    q = deque([src])\n    visited[src] = True\n    order = []\n    while q:\n        u = q.popleft()\n        order.append(u)\n        for v in adj[u]:\n            if not visited[v]:\n                visited[v] = True\n                q.append(v)\n    return order\n\ndef solve():\n    n, m = map(int, input().split())\n    adj = [[] for _ in range(n + 1)]\n    for _ in range(m):\n        u, v = map(int, input().split())\n        adj[u].append(v)\n        adj[v].append(u)\n    print(bfs(1, adj, n))\n\nt = 1\nfor _ in range(t):\n    solve()\n` },
  ],
  HTML: [
    { label: "Basic Page", extension: ".html", content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n  <p>Welcome to my page.</p>\n</body>\n</html>\n` },
    { label: "With CSS", extension: ".html", content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Styled Page</title>\n  <style>\n    body {\n      font-family: Arial, sans-serif;\n      max-width: 800px;\n      margin: 0 auto;\n      padding: 20px;\n      background: #f5f5f5;\n    }\n    h1 { color: #333; }\n  </style>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n  <p>A styled page.</p>\n</body>\n</html>\n` },
  ],
  CSS: [
    { label: "Basic Styles", extension: ".css", content: `* {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n\nbody {\n  font-family: Arial, sans-serif;\n  background-color: #f5f5f5;\n  color: #333;\n}\n\nh1 {\n  font-size: 2rem;\n  margin-bottom: 1rem;\n}\n` },
  ],
  Rust: [
    { label: "Hello World", extension: ".rs", content: `fn main() {\n    println!("Hello, World!");\n}\n` },
    { label: "Functions", extension: ".rs", content: `fn add(a: i32, b: i32) -> i32 {\n    a + b\n}\n\nfn main() {\n    let result = add(5, 3);\n    println!("5 + 3 = {}", result);\n}\n` },
  ],
  Go: [
    { label: "Hello World", extension: ".go", content: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}\n` },
  ],
  Java: [
    { label: "Hello World", extension: ".java", content: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n` },
    { label: "Add Two Numbers", extension: ".java", content: `import java.util.Scanner;\n\npublic class AddNumbers {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n\n        int a, b, sum;\n\n        System.out.print("Enter first number: ");\n        a = sc.nextInt();\n\n        System.out.print("Enter second number: ");\n        b = sc.nextInt();\n\n        sum = a + b;\n\n        System.out.println("Sum = " + sum);\n    }\n}\n` },
    { label: "OOP Example", extension: ".java", content: `public class Animal {\n    String name;\n    String sound;\n\n    Animal(String name, String sound) {\n        this.name = name;\n        this.sound = sound;\n    }\n\n    void speak() {\n        System.out.println(this.name + " says " + this.sound);\n    }\n\n    public static void main(String[] args) {\n        Animal dog = new Animal("Dog", "Woof");\n        Animal cat = new Animal("Cat", "Meow");\n        dog.speak();\n        cat.speak();\n    }\n}\n` },
    { label: "CP Boilerplate", extension: ".java", content: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    static BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n    static StringTokenizer st;\n    static PrintWriter out = new PrintWriter(new BufferedWriter(new OutputStreamWriter(System.out)));\n\n    static int ni() throws Exception {\n        if (st == null || !st.hasMoreTokens())\n            st = new StringTokenizer(br.readLine());\n        return Integer.parseInt(st.nextToken());\n    }\n    static long nl() throws Exception {\n        if (st == null || !st.hasMoreTokens())\n            st = new StringTokenizer(br.readLine());\n        return Long.parseLong(st.nextToken());\n    }\n\n    static void solve() throws Exception {\n        int n = ni();\n        out.println(n);\n    }\n\n    public static void main(String[] args) throws Exception {\n        int t = ni();\n        // int t = 1;\n        while (t-- > 0) solve();\n        out.flush();\n    }\n}\n` },
  ],
  "C++": [
    { label: "Hello World", extension: ".cpp", content: `#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}\n` },
    { label: "CP Boilerplate", extension: ".cpp", content: `#include <bits/stdc++.h>\nusing namespace std;\n\n#define ll long long\n#define pii pair<int,int>\n#define vi vector<int>\n#define all(x) (x).begin(), (x).end()\n#define MOD 1000000007LL\n\nvoid solve() {\n    // Your solution here\n    int n;\n    cin >> n;\n    cout << n << "\\n";\n}\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    int t = 1;\n    // cin >> t;\n    while (t--) solve();\n\n    return 0;\n}\n` },
    { label: "Graph BFS/DFS", extension: ".cpp", content: `#include <bits/stdc++.h>\nusing namespace std;\n\nconst int MAXN = 1e5 + 5;\nvector<int> adj[MAXN];\nbool visited[MAXN];\n\nvoid bfs(int src, int n) {\n    queue<int> q;\n    q.push(src);\n    visited[src] = true;\n    while (!q.empty()) {\n        int u = q.front(); q.pop();\n        for (int v : adj[u]) {\n            if (!visited[v]) {\n                visited[v] = true;\n                q.push(v);\n            }\n        }\n    }\n}\n\nvoid dfs(int u) {\n    visited[u] = true;\n    for (int v : adj[u]) {\n        if (!visited[v]) dfs(v);\n    }\n}\n\nvoid solve() {\n    int n, m;\n    cin >> n >> m;\n    for (int i = 0; i < m; i++) {\n        int u, v;\n        cin >> u >> v;\n        adj[u].push_back(v);\n        adj[v].push_back(u);\n    }\n    bfs(1, n);\n}\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int t = 1;\n    while (t--) solve();\n    return 0;\n}\n` },
  ],
  C: [
    { label: "Hello World", extension: ".c", content: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}\n` },
    { label: "CP Boilerplate", extension: ".c", content: `#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\n#define MAXN 100005\n\nvoid solve() {\n    int n;\n    scanf("%d", &n);\n    printf("%d\\n", n);\n}\n\nint main() {\n    int t = 1;\n    // scanf("%d", &t);\n    while (t--) solve();\n    return 0;\n}\n` },
  ],
  PHP: [
    { label: "Hello World", extension: ".php", content: `<?php\necho "Hello, World!";\n?>\n` },
  ],
  Ruby: [
    { label: "Hello World", extension: ".rb", content: `puts "Hello, World!"\n` },
  ],
  Bash: [
    { label: "Hello World", extension: ".sh", content: `#!/bin/bash\necho "Hello, World!"\n` },
    { label: "Script Template", extension: ".sh", content: `#!/bin/bash\n\n# Script name: script.sh\n# Description: What this script does\n\nset -e\n\nmain() {\n    echo "Running script..."\n}\n\nmain "$@"\n` },
  ],
};

interface NewFileDialogProps {
  onConfirm: (name: string, content: string, type: "file" | "folder") => void;
  defaultType?: "file" | "folder";
  trigger?: React.ReactNode;
}

export function NewFileDialog({ onConfirm, defaultType = "file", trigger }: NewFileDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"file" | "folder">(defaultType);
  const [selectedCategory, setSelectedCategory] = useState("Blank File");
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [showTemplates, setShowTemplates] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setType(defaultType);
      setSelectedCategory("Blank File");
      setSelectedTemplate(0);
      setShowTemplates(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, defaultType]);

  const currentTemplates = TEMPLATES[selectedCategory] || [];
  const currentTemplate = currentTemplates[selectedTemplate];

  const handleConfirm = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    let finalName = trimmed;
    let content = "";

    if (type === "file" && currentTemplate) {
      if (currentTemplate.extension && !trimmed.includes(".")) {
        finalName = trimmed + currentTemplate.extension;
      }
      content = currentTemplate.content;
    }

    onConfirm(finalName, content, type);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {trigger ?? (
          <button
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
            title={type === "file" ? "New File" : "New Folder"}
          >
            {type === "file" ? <FilePlus size={15} /> : <FolderPlus size={15} />}
          </button>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-popover border border-popover-border rounded-lg shadow-2xl w-full max-w-sm mx-4">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-semibold text-foreground">
                {type === "file" ? "New File" : "New Folder"}
              </span>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Type toggle */}
              <div className="flex gap-1 p-1 bg-muted rounded">
                <button
                  onClick={() => setType("file")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-xs rounded transition-colors ${
                    type === "file" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FilePlus size={13} /> File
                </button>
                <button
                  onClick={() => setType("folder")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-xs rounded transition-colors ${
                    type === "folder" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FolderPlus size={13} /> Folder
                </button>
              </div>

              {/* Name input */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                <input
                  ref={inputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={type === "file" ? "filename.py" : "folder-name"}
                  className="w-full bg-input border border-border rounded px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              {/* Templates (file only) */}
              {type === "file" && (
                <div>
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="flex items-center justify-between w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span>
                      Starter template:{" "}
                      <span className="text-foreground font-medium">
                        {selectedCategory === "Blank File" ? "None" : `${selectedCategory} — ${currentTemplate?.label}`}
                      </span>
                    </span>
                    <ChevronDown size={13} className={`transition-transform ${showTemplates ? "rotate-180" : ""}`} />
                  </button>

                  {showTemplates && (
                    <div className="mt-2 border border-border rounded overflow-hidden max-h-48 overflow-y-auto">
                      {Object.entries(TEMPLATES).map(([cat, templates]) => (
                        <div key={cat}>
                          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted/50 uppercase tracking-wider">
                            {cat}
                          </div>
                          {templates.map((tpl, idx) => (
                            <button
                              key={tpl.label}
                              onClick={() => {
                                setSelectedCategory(cat);
                                setSelectedTemplate(idx);
                                setShowTemplates(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-sidebar-accent transition-colors ${
                                selectedCategory === cat && selectedTemplate === idx
                                  ? "bg-primary/10 text-primary"
                                  : "text-foreground"
                              }`}
                            >
                              {tpl.label}{tpl.extension && <span className="text-muted-foreground ml-1">{tpl.extension}</span>}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 px-4 pb-4">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-1.5 text-sm border border-border rounded text-foreground hover:bg-sidebar-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!name.trim()}
                className="flex-1 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
