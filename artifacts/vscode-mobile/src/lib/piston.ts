const PISTON_URL = 'https://emkc.org/api/v2/piston'

const LANGUAGE_MAP: Record<string, {
  language: string
  version: string
  filename: string
}> = {
  javascript: { language: 'javascript', version: '18.15.0', filename: 'index.js' },
  typescript: { language: 'typescript', version: '5.0.3',  filename: 'index.ts' },
  python:     { language: 'python',     version: '3.10.0', filename: 'main.py'   },
  java:       { language: 'java',       version: '15.0.2', filename: 'Main.java' },
  cpp:        { language: 'c++',        version: '10.2.0', filename: 'main.cpp'  },
  c:          { language: 'c',          version: '10.2.0', filename: 'main.c'    },
  rust:       { language: 'rust',       version: '1.50.0', filename: 'main.rs'   },
  bash:       { language: 'bash',       version: '5.2.0',  filename: 'script.sh' },
  php:        { language: 'php',        version: '8.2.3',  filename: 'index.php' },
  go:         { language: 'go',         version: '1.16.2', filename: 'main.go'   },
  ruby:       { language: 'ruby',       version: '3.0.1',  filename: 'main.rb'   },
  swift:      { language: 'swift',      version: '5.3.3',  filename: 'main.swift'},
}

export type ExecutionResult = {
  stdout: string
  stderr: string
  exitCode: number
  language: string
  error?: string
}

export const executeCode = async (
  code: string,
  language: string,
  stdin = ''
): Promise<ExecutionResult> => {
  const runtime = LANGUAGE_MAP[language]

  if (!runtime) {
    return {
      stdout: '',
      stderr: `Language "${language}" not supported.\nSupported: ${Object.keys(LANGUAGE_MAP).join(', ')}`,
      exitCode: 1,
      language,
    }
  }

  try {
    const response = await fetch(`${PISTON_URL}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: runtime.language,
        version: runtime.version,
        files: [{ name: runtime.filename, content: code }],
        stdin,
        run_timeout: 10000,
        compile_timeout: 10000,
      }),
    })

    if (!response.ok) {
      throw new Error(`Piston error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const run = data.run ?? {}
    const compile = data.compile ?? {}

    if (compile.stderr) {
      return {
        stdout: '',
        stderr: compile.stderr,
        exitCode: compile.code ?? 1,
        language,
      }
    }

    return {
      stdout: run.stdout ?? '',
      stderr: run.stderr ?? '',
      exitCode: run.code ?? 0,
      language,
    }
  } catch (err: any) {
    return {
      stdout: '',
      stderr: `Failed to reach execution server.\n${err.message}`,
      exitCode: 1,
      language,
      error: err.message,
    }
  }
}

export const getSupportedLanguages = () => Object.keys(LANGUAGE_MAP)
