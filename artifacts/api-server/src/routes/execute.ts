import { Router, type IRouter } from "express";
import { exec } from "child_process";
import { writeFile, unlink, mkdir } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { promisify } from "util";
import { ExecuteCodeBody } from "@workspace/api-zod";

const execAsync = promisify(exec);
const router: IRouter = Router();

const LANG_CONFIG: Record<string, { ext: string; cmd: (f: string) => string }> = {
  javascript: { ext: "js", cmd: (f) => `node "${f}"` },
  typescript: { ext: "ts", cmd: (f) => `node --input-type=module < "${f}" 2>/dev/null || npx --yes tsx "${f}"` },
  python: { ext: "py", cmd: (f) => `python3 "${f}"` },
  python3: { ext: "py", cmd: (f) => `python3 "${f}"` },
  sh: { ext: "sh", cmd: (f) => `bash "${f}"` },
  bash: { ext: "sh", cmd: (f) => `bash "${f}"` },
};

router.post("/execute", async (req, res): Promise<void> => {
  const parsed = ExecuteCodeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { code, language } = parsed.data;
  const langKey = language.toLowerCase();
  const config = LANG_CONFIG[langKey];

  if (!config) {
    res.json({
      stdout: "",
      stderr: `Language "${language}" is not supported for execution.\nSupported: JavaScript, TypeScript, Python, Bash`,
      exitCode: 1,
      executionTime: 0,
    });
    return;
  }

  const tmpDir = tmpdir();
  const fileName = `code_${Date.now()}_${Math.random().toString(36).slice(2)}.${config.ext}`;
  const filePath = join(tmpDir, fileName);

  const start = Date.now();
  let stdout = "";
  let stderr = "";
  let exitCode = 0;

  try {
    await writeFile(filePath, code, "utf8");

    const cmd = config.cmd(filePath);
    req.log.info({ language, cmd }, "Executing code");

    try {
      const result = await execAsync(cmd, {
        timeout: 10000, // 10 second timeout
        maxBuffer: 1024 * 1024, // 1MB buffer
        env: {
          ...process.env,
          NODE_ENV: "production",
        },
      });
      stdout = result.stdout;
      stderr = result.stderr;
      exitCode = 0;
    } catch (err: unknown) {
      const execErr = err as { stdout?: string; stderr?: string; code?: number; killed?: boolean };
      stdout = execErr.stdout || "";
      stderr = execErr.stderr || `Process exited with code ${execErr.code}`;
      exitCode = execErr.code || 1;

      if (execErr.killed) {
        stderr = "Process timed out after 10 seconds\n" + stderr;
        exitCode = 124;
      }
    }
  } catch (err: unknown) {
    const error = err as Error;
    stderr = `Failed to execute code: ${error.message}`;
    exitCode = 1;
  } finally {
    // Clean up temp file
    unlink(filePath).catch(() => {});
  }

  const executionTime = (Date.now() - start) / 1000;

  req.log.info({ exitCode, executionTime }, "Code execution complete");

  res.json({
    stdout,
    stderr,
    exitCode,
    executionTime,
  });
});

export default router;
