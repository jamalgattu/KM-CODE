import { useState, useRef, useEffect } from 'react'
import { executeCode, getSupportedLanguages } from '../lib/piston'

type TerminalLine = {
  type: 'input' | 'output' | 'error' | 'system' | 'success'
  content: string
}

type Props = {
  currentCode: string
  currentLanguage: string
  currentFileName?: string
}

export default function Terminal({
  currentCode,
  currentLanguage,
  currentFileName = 'untitled'
}: Props) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'system',  content: '⚡ Su Zai Zai Code — Terminal' },
    { type: 'system',  content: 'Type "run" to execute your current file.' },
    { type: 'system',  content: 'Type "help" for all commands.' },
    { type: 'system',  content: '─────────────────────────────────' },
  ])
  const [input, setInput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  const push = (type: TerminalLine['type'], content: string) =>
    setLines(prev => [...prev, { type, content }])

  const handleCommand = async (raw: string) => {
    const cmd = raw.trim()
    if (!cmd) return

    push('input', `$ ${cmd}`)
    setCmdHistory(prev => [cmd, ...prev])
    setHistoryIdx(-1)

    if (cmd === 'clear') {
      setLines([{ type: 'system', content: '⚡ Su Zai Zai Code — Terminal' }])
      return
    }

    if (cmd === 'help') {
      push('system', 'Available commands:')
      push('system', '  run          → execute current file')
      push('system', '  clear        → clear terminal')
      push('system', '  languages    → list supported languages')
      push('system', '  file         → show current file name')
      push('system', '  lang         → show current language')
      return
    }

    if (cmd === 'languages') {
      push('system', 'Supported languages:')
      push('system', getSupportedLanguages().join(', '))
      return
    }

    if (cmd === 'file') {
      push('system', `Current file: ${currentFileName}`)
      return
    }

    if (cmd === 'lang') {
      push('system', `Current language: ${currentLanguage}`)
      return
    }

    if (cmd === 'run') {
      setIsRunning(true)
      push('system', `▶ Running ${currentFileName} (${currentLanguage})...`)
      push('system', '─────────────────────────────────')

      const result = await executeCode(currentCode, currentLanguage)

      if (result.stdout) {
        result.stdout
          .split('\n')
          .filter(l => l !== '')
          .forEach(line => push('output', line))
      }

      if (result.stderr) {
        result.stderr
          .split('\n')
          .filter(l => l !== '')
          .forEach(line => push('error', line))
      }

      if (result.exitCode === 0) {
        push('success', `✓ Exited with code 0`)
      } else {
        push('error', `✗ Exited with code ${result.exitCode}`)
      }

      push('system', '─────────────────────────────────')
      setIsRunning(false)
      return
    }

    push('error', `Unknown command: "${cmd}". Type "help" for commands.`)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input)
      setInput('')
      return
    }
    if (e.key === 'ArrowUp') {
      const idx = Math.min(historyIdx + 1, cmdHistory.length - 1)
      setHistoryIdx(idx)
      setInput(cmdHistory[idx] ?? '')
    }
    if (e.key === 'ArrowDown') {
      const idx = Math.max(historyIdx - 1, -1)
      setHistoryIdx(idx)
      setInput(cmdHistory[idx] ?? '')
    }
  }

  const colors: Record<TerminalLine['type'], string> = {
    input:   'text-green-400',
    output:  'text-gray-100',
    error:   'text-red-400',
    system:  'text-blue-400',
    success: 'text-emerald-400',
  }

  return (
    <div
      className="flex flex-col h-full bg-[#0d0d0d] font-mono text-sm select-text"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`${colors[line.type]} leading-5 break-all whitespace-pre-wrap`}
          >
            {line.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center border-t border-gray-800 px-3 py-2 gap-2 bg-[#111]">
        <span className="text-green-400 shrink-0">$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isRunning}
          placeholder={isRunning ? 'Running...' : 'Enter command...'}
          className="flex-1 bg-transparent text-gray-100 outline-none placeholder-gray-600 text-sm"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        <button
          onClick={() => { handleCommand('run'); setInput('') }}
          disabled={isRunning}
          className="shrink-0 bg-green-700 hover:bg-green-600 disabled:opacity-40 text-white text-xs px-3 py-1.5 rounded font-semibold transition-colors"
        >
          {isRunning ? '...' : '▶ Run'}
        </button>
      </div>
    </div>
  )
  }
