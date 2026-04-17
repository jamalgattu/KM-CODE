import { Router, type IRouter } from "express";
import { eq, isNull } from "drizzle-orm";
import { db, filesTable } from "@workspace/db";
import {
  CreateFileBody,
  GetFileParams,
  UpdateFileParams,
  UpdateFileBody,
  DeleteFileParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

// List all files
router.get("/files", async (req, res): Promise<void> => {
  req.log.info("Listing files");
  const files = await db
    .select()
    .from(filesTable)
    .orderBy(filesTable.path);

  const mapped = files.map((f) => ({
    id: f.id,
    name: f.name,
    type: f.type,
    path: f.path,
    content: f.content ?? null,
    language: f.language ?? null,
    parentId: f.parentId ?? null,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  }));

  res.json(mapped);
});

// Get single file
router.get("/files/:id", async (req, res): Promise<void> => {
  const params = GetFileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [file] = await db
    .select()
    .from(filesTable)
    .where(eq(filesTable.id, params.data.id));

  if (!file) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  res.json({
    id: file.id,
    name: file.name,
    type: file.type,
    path: file.path,
    content: file.content ?? null,
    language: file.language ?? null,
    parentId: file.parentId ?? null,
    createdAt: file.createdAt.toISOString(),
    updatedAt: file.updatedAt.toISOString(),
  });
});

// Create file or folder
router.post("/files", async (req, res): Promise<void> => {
  const parsed = CreateFileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, type, path, content, language, parentId } = parsed.data;

  const [file] = await db
    .insert(filesTable)
    .values({
      name,
      type,
      path,
      content: content ?? null,
      language: language ?? null,
      parentId: parentId ?? null,
    })
    .returning();

  req.log.info({ path }, "Created file");

  res.status(201).json({
    id: file.id,
    name: file.name,
    type: file.type,
    path: file.path,
    content: file.content ?? null,
    language: file.language ?? null,
    parentId: file.parentId ?? null,
    createdAt: file.createdAt.toISOString(),
    updatedAt: file.updatedAt.toISOString(),
  });
});

// Update file
router.put("/files/:id", async (req, res): Promise<void> => {
  const params = UpdateFileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateFileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.content !== undefined) updates.content = parsed.data.content;
  if (parsed.data.language !== undefined) updates.language = parsed.data.language;
  if (parsed.data.path !== undefined) updates.path = parsed.data.path;

  const [file] = await db
    .update(filesTable)
    .set(updates)
    .where(eq(filesTable.id, params.data.id))
    .returning();

  if (!file) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  req.log.info({ id: file.id }, "Updated file");

  res.json({
    id: file.id,
    name: file.name,
    type: file.type,
    path: file.path,
    content: file.content ?? null,
    language: file.language ?? null,
    parentId: file.parentId ?? null,
    createdAt: file.createdAt.toISOString(),
    updatedAt: file.updatedAt.toISOString(),
  });
});

// Delete file or folder (cascades to children)
router.delete("/files/:id", async (req, res): Promise<void> => {
  const params = DeleteFileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  // Get the file's path first so we can delete all children
  const [fileToDelete] = await db
    .select()
    .from(filesTable)
    .where(eq(filesTable.id, params.data.id));

  if (!fileToDelete) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  // Delete all children (files with paths starting with this folder's path)
  if (fileToDelete.type === "folder") {
    const allFiles = await db.select().from(filesTable);
    const toDelete = allFiles
      .filter((f) => f.path.startsWith(fileToDelete.path + "/") || f.id === params.data.id)
      .map((f) => f.id);
    for (const id of toDelete) {
      await db.delete(filesTable).where(eq(filesTable.id, id));
    }
  } else {
    await db.delete(filesTable).where(eq(filesTable.id, params.data.id));
  }

  req.log.info({ id: params.data.id }, "Deleted file");
  res.sendStatus(204);
});

export default router;
