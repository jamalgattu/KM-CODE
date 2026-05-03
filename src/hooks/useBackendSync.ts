import { useEffect, useRef } from "react";
import { useEditorStore } from "@/store/editorStore";
import { FileNode, getLanguageFromPath } from "@/types/editor";
import { supabase, getUser, isSupabaseConfigured } from "@/lib/supabase";
import { getGuestSession } from "@/hooks/useAuth";

export const fileIdMap = new Map<string, string>();
export const apiIdMap = new Map<string, string>();

export function useBackendSync() {
  const setFilesFromApi = useEditorStore((s) => s.setFilesFromApi);
  const storeFiles = useEditorStore((s) => s.files);
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;

    async function loadFiles() {
      try {
        // Supabase not configured — keep local persisted files untouched
        if (!isSupabaseConfigured) return;

        // Guest session — user explicitly chose offline mode, don't touch their files
        if (getGuestSession()) return;

        const user = await getUser();

        // Not logged in — keep local persisted files untouched
        if (!user) {
          setFilesFromApi([{
            id: 'welcome',
            name: 'welcome.md',
            type: 'file',
            path: 'welcome.md',
            language: 'markdown',
            content: [
              '# Welcome to Su Zai Zai Code! ⚡',
              '',
              'A free mobile-first code editor for everyone.',
              '',
              '## Getting Started',
              '1. Sign in with Google to save your files',
              '2. Click the + button to create a new file',
              '3. Select a language and start coding!',
              '4. Hit the Run button to execute your code',
              '',
              '## Supported Languages',
              'JavaScript, TypeScript, Python, Java, C++,',
              'C, Rust, Go, PHP, Ruby, Swift, Bash',
              '',
              '## Tips',
              '- Ctrl+S to save',
              '- Ctrl+B to toggle sidebar',
              '- Ctrl+` to open terminal',
              '',
              'Happy coding! 🚀',
            ].join('\n'),
          }]);
          return;
        }

        // Get or create default project
        let { data: projects } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at')
          .limit(1);

        let project = projects?.[0];

        if (!project) {
          const { data: newProject } = await supabase
            .from('projects')
            .insert({
              name: 'My Project',
              user_id: user.id,
            })
            .select()
            .single();
          project = newProject;
        }

        if (!project) return;

        // Load files for this project
        const { data: files } = await supabase
          .from('files')
          .select('*')
          .eq('project_id', project.id)
          .order('path');

        if (!files || files.length === 0) {
          // New user — create welcome file in DB
          const { data: welcomeFile } = await supabase
            .from('files')
            .insert({
              project_id: project.id,
              name: 'welcome.md',
              path: 'welcome.md',
              language: 'markdown',
              content: [
                '# Welcome to Su Zai Zai Code! ⚡',
                '',
                'Start coding by creating a new file.',
                'Click the + button in the explorer.',
                '',
                'Happy coding! 🚀',
              ].join('\n'),
            })
            .select()
            .single();

          if (welcomeFile) {
            setFilesFromApi([{
              id: `api-${welcomeFile.id}`,
              name: welcomeFile.name,
              type: 'file',
              path: welcomeFile.path,
              language: welcomeFile.language,
              content: welcomeFile.content,
            }]);
          }
          return;
        }

        // Build file tree from Supabase files
        const tree: FileNode[] = files.map((f) => {
          const id = `api-${f.id}`;
          fileIdMap.set(id, f.id);
          apiIdMap.set(f.id, id);
          return {
            id,
            name: f.name,
            type: 'file' as const,
            path: f.path,
            language: f.language ?? getLanguageFromPath(f.name),
            content: f.content ?? '',
          };
        });

        setFilesFromApi(tree);

      } catch {
        // Silently fail — user continues with local state
      }
    }

    loadFiles();
  }, []);

  // Auto-save current file to Supabase
  const saveFile = async (
    fileId: string,
    content: string,
    name: string,
    path: string,
    language: string
  ) => {
    try {
      const user = await getUser();
      if (!user) return;

      const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      const projectId = projects?.[0]?.id;
      if (!projectId) return;

      const supabaseId = fileIdMap.get(fileId);

      if (supabaseId) {
        await supabase
          .from('files')
          .update({ content, updated_at: new Date().toISOString() })
          .eq('id', supabaseId);
      } else {
        const { data: newFile } = await supabase
          .from('files')
          .insert({ project_id: projectId, name, path, content, language })
          .select()
          .single();

        if (newFile) {
          fileIdMap.set(fileId, newFile.id);
          apiIdMap.set(newFile.id, fileId);
        }
      }
    } catch {
      // Silently fail — file saved locally, sync retried on next save
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      const supabaseId = fileIdMap.get(fileId);
      if (!supabaseId) return;
      await supabase.from('files').delete().eq('id', supabaseId);
      fileIdMap.delete(fileId);
      apiIdMap.delete(supabaseId);
    } catch {
      // Silently fail — file removed from local state
    }
  };

  return { saveFile, deleteFile };
              }
