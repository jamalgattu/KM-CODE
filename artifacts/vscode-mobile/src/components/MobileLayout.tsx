import { useState } from 'react'
import {
  FolderOpen, Play, Search,
  Settings, GitBranch, Menu, X, Save
} from 'lucide-react'

type Panel = 'editor' | 'files' | 'terminal' | 'search' | 'settings' | 'git'

type Props = {
  editor: React.ReactNode
  files: React.ReactNode
  terminal: React.ReactNode
  search: React.ReactNode
  settings: React.ReactNode
  git: React.ReactNode
  fileName: string
  language: string
  isSaved: boolean
  onSave: () => void
  onNewFile: () => void
  onNewProject: () => void
  onSignOut: () => void
}

export default function MobileLayout({
  editor, files, terminal, search, settings, git,
  fileName, language, isSaved,
  onSave, onNewFile, onNewProject, onSignOut
}: Props) {
  const [active, setActive] = useState<Panel>('editor')
  const [menuOpen, setMenuOpen] = useState(false)

  const panels: Record<Panel, React.ReactNode> = {
    editor, files, terminal, search, settings, git
  }

  const nav = [
    { id: 'files',    icon: FolderOpen, label: 'Files'  },
    { id: 'search',   icon: Search,     label: 'Search' },
    { id: 'editor',   icon: Menu,       label: 'Editor' },
    { id: 'terminal', icon: Play,       label: 'Run'    },
    { id: 'git',      icon: GitBranch,  label: 'Git'    },
  ] as const

  const menuItems = [
    { label: '📄 New File',    action: onNewFile    },
    { label: '📁 New Project', action: onNewProject },
    { label: '💾 Save',        action: onSave       },
    { label: '⚙️ Settings',    action: () => { setActive('settings'); setMenuOpen(false) } },
    { label: '🚪 Sign Out',    action: onSignOut    },
  ]

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">

      {/* Top Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1e1e1e] border-b border-gray-700 shrink-0">
        <span className="text-blue-400 font-bold text-sm tracking-wide">
          ⚡ Su Zai Zai
        </span>

        <div className="flex items-center gap-1.5 max-w-[40%]">
          <span className="text-gray-300 text-xs truncate">{fileName}</span>
          {!isSaved && (
            <span className="text-yellow-400 text-xs" title="Unsaved">●</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs hidden sm:block">{language}</span>
          <button
            onClick={onSave}
            className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="Save"
          >
            <Save size={15} />
          </button>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute top-11 right-2 z-50 bg-[#252526] border border-gray-600 rounded-xl shadow-2xl w-52 overflow-hidden">
            {menuItems.map(item => (
              <button
                key={item.label}
                onClick={() => { item.action(); setMenuOpen(false) }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-0"
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {panels[active]}
      </div>

      {/* Bottom Nav */}
      <div className="flex border-t border-gray-700 bg-[#1e1e1e] shrink-0">
        {nav.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActive(id as Panel)}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors
              ${active === id
                ? 'text-blue-400 border-t-2 border-blue-400 bg-[#252526]'
                : 'text-gray-500 hover:text-gray-300'
              }`}
          >
            <Icon size={18} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>

    </div>
  )
}
