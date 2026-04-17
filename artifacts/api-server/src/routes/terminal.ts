import { Router, type IRouter } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import { RunTerminalCommandBody } from "@workspace/api-zod";

const execAsync = promisify(exec);
const router: IRouter = Router();

// Allowed commands (whitelist for security)
const BLOCKED_COMMANDS = [
  "rm -rf /",
  "dd if=",
  ":(){:|:&};:",
  "mkfs",
  "sudo rm",
  "chmod 777 /",
  "curl | bash",
  "wget | bash",
];

const SAFE_COMMANDS: Record<string, (args: string[]) => Promise<string>> = {
  // All others go through exec
};

router.post("/terminal", async (req, res): Promise<void> => {
  const parsed = RunTerminalCommandBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ output: "", exitCode: 1, error: parsed.error.message });
    return;
  }

  const { command } = parsed.data;
  const trimmed = command.trim();

  // Security: block dangerous commands
  const blocked = BLOCKED_COMMANDS.find((b) => trimmed.toLowerCase().includes(b.toLowerCase()));
  if (blocked) {
    res.json({
      output: "",
      exitCode: 1,
      error: `Command blocked for security reasons: ${blocked}`,
    });
    return;
  }

  // Block empty commands
  if (!trimmed) {
    res.json({ output: "", exitCode: 0, error: null });
    return;
  }

  req.log.info({ command: trimmed }, "Executing terminal command");

  try {
    const result = await execAsync(trimmed, {
      timeout: 15000,
      maxBuffer: 512 * 1024,
      cwd: process.env.HOME || "/tmp",
      env: {
        ...process.env,
        TERM: "xterm-256color",
      },
    });

    res.json({
      output: result.stdout + (result.stderr ? `\n${result.stderr}` : ""),
      exitCode: 0,
      error: null,
    });
  } catch (err: unknown) {
    const execErr = err as { stdout?: string; stderr?: string; code?: number; killed?: boolean; message?: string };

    if (execErr.killed) {
      res.json({
        output: execErr.stdout || "",
        exitCode: 124,
        error: "Command timed out after 15 seconds",
      });
      return;
    }

    // Many commands return non-zero but have useful output
    res.json({
      output: (execErr.stdout || "") + (execErr.stderr ? `\n${execErr.stderr}` : ""),
      exitCode: execErr.code || 1,
      error: null,
    });
  }
});

export default router;
