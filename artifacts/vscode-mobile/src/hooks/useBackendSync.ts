import { useEffect, useRef } from "react";
import { useListFiles, useCreateFile, useUpdateFile, useDeleteFile } from "@workspace/api-client-react";
import { useEditorStore } from "@/store/editorStore";
import { FileNode, getLanguageFromPath } from "@/types/editor";

// Map from local store ID -> backend numeric ID
export const fileIdMap = new Map<string, number>();
// Map from backend numeric ID -> local store ID
export const apiIdMap = new Map<number, string>();

function flattenNodes(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = [];
  function walk(n: FileNode) {
    result.push(n);
    if (n.children) n.children.forEach(walk);
  }
  nodes.forEach(walk);
  return result;
}

function buildTreeFromApi(apiFiles: {
  id: number;
  name: string;
  type: string;
  path: string;
  content: string | null;
  language: string | null;
  parentId: number | null;
}[]): FileNode[] {
  const nodes = new Map<number, FileNode>();
  const roots: FileNode[] = [];

  // Sort: folders first, then by path depth
  const sorted = [...apiFiles].sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.path.split("/").length - b.path.split("/").length;
  });

  for (const f of sorted) {
    const id = `api-${f.id}`;
    fileIdMap.set(id, f.id);
    apiIdMap.set(f.id, id);

    const node: FileNode = {
      id,
      name: f.name,
      type: f.type as "file" | "folder",
      path: f.path,
      content: f.content ?? undefined,
      language: f.language ?? getLanguageFromPath(f.name),
      isOpen: f.type === "folder",
      children: f.type === "folder" ? [] : undefined,
    };
    nodes.set(f.id, node);
  }

  for (const f of sorted) {
    const node = nodes.get(f.id)!;
    if (f.parentId !== null) {
      const parent = nodes.get(f.parentId);
      if (parent && parent.children) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export function useBackendSync() {
  const { data: apiFiles, isLoading, isSuccess } = useListFiles();
  const createFile = useCreateFile();
  const updateFile = useUpdateFile();
  const deleteFile = useDeleteFile();
  const setFilesFromApi = useEditorStore((s) => s.setFilesFromApi);
  const storeFiles = useEditorStore((s) => s.files);
  const seeded = useRef(false);

  // When API responds, sync files into store
  useEffect(() => {
    if (!isSuccess || seeded.current) return;
    seeded.current = true;

    if (apiFiles && apiFiles.length > 0) {
      // API has files — use them as source of truth
      const tree = buildTreeFromApi(apiFiles as Parameters<typeof buildTreeFromApi>[0]);
      setFilesFromApi(tree);
    } else {
      // API empty — seed from current store (default files)
      const allNodes = flattenNodes(storeFiles);
      // Sort: folders first, then by depth
      const sorted = allNodes.sort((a, b) => {
        if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
        return a.path.split("/").length - b.path.split("/").length;
      });

      const localToApi = new Map<string, number>();

      (async () => {
        for (const node of sorted) {
          const parentPath = node.path.split("/").slice(0, -1).join("/");
          const parentNode = allNodes.find((n) => n.path === parentPath);
          const parentApiId = parentNode ? localToApi.get(parentNode.id) : undefined;

          try {
            const result = await fetch("/api/files", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: node.name,
                type: node.type,
                path: node.path,
                content: node.content ?? undefined,
                language: node.language ?? undefined,
                parentId: parentApiId ?? null,
              }),
            });
            if (result.ok) {
              const created = await result.json();
              localToApi.set(node.id, created.id);
              fileIdMap.set(node.id, created.id);
              apiIdMap.set(created.id, node.id);
            }
          } catch {
            // ignore seed errors
          }
        }
      })();
    }
  }, [isSuccess, apiFiles]);

  return { isLoading, createFile, updateFile, deleteFile };
}
