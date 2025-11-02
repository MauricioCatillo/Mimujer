import { randomUUID } from "crypto";
import { getDatabase } from "./database.js";
import { Project } from "../types.js";

export interface ProjectInput {
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
}

const toModel = (row: any): Project => ({
  id: row.id,
  title: row.title,
  description: row.description ?? undefined,
  url: row.url,
  thumbnailUrl: row.thumbnail_url ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export class ProjectRepository {
  static list(): Project[] {
    const db = getDatabase();
    const rows = db
      .prepare(
        `SELECT id, title, description, url, thumbnail_url, created_at, updated_at
         FROM projects ORDER BY datetime(created_at) DESC`,
      )
      .all();

    return rows.map(toModel);
  }

  static find(id: string): Project | undefined {
    const db = getDatabase();
    const row = db
      .prepare(
        `SELECT id, title, description, url, thumbnail_url, created_at, updated_at
         FROM projects WHERE id = ?`,
      )
      .get(id);

    return row ? toModel(row) : undefined;
  }

  static create(input: ProjectInput): Project {
    const id = randomUUID();
    const now = new Date().toISOString();
    const db = getDatabase();

    db.prepare(
      `INSERT INTO projects (id, title, description, url, thumbnail_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      input.title,
      input.description ?? null,
      input.url,
      input.thumbnailUrl ?? null,
      now,
      now,
    );

    return this.find(id)!;
  }

  static update(id: string, input: ProjectInput): Project {
    const db = getDatabase();
    const now = new Date().toISOString();

    db.prepare(
      `UPDATE projects SET
        title = ?,
        description = ?,
        url = ?,
        thumbnail_url = ?,
        updated_at = ?
      WHERE id = ?`,
    ).run(
      input.title,
      input.description ?? null,
      input.url,
      input.thumbnailUrl ?? null,
      now,
      id,
    );

    return this.find(id)!;
  }

  static delete(id: string): void {
    const db = getDatabase();
    db.prepare(`DELETE FROM projects WHERE id = ?`).run(id);
  }
}
