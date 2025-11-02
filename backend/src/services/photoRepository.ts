import { randomUUID } from "crypto";
import { getDatabase } from "./database.js";
import { Photo } from "../types.js";

export interface PhotoInput {
  title: string;
  description?: string;
  takenAt?: string;
  fileName: string;
}

const toModel = (row: any): Photo => ({
  id: row.id,
  title: row.title,
  description: row.description ?? undefined,
  takenAt: row.taken_at ?? undefined,
  fileName: row.file_name,
  createdAt: row.created_at,
});

export class PhotoRepository {
  static list(): Photo[] {
    const db = getDatabase();
    const rows = db
      .prepare(
        `SELECT id, title, description, taken_at, file_name, created_at
         FROM photos ORDER BY datetime(created_at) DESC`,
      )
      .all();

    return rows.map(toModel);
  }

  static create(input: PhotoInput): Photo {
    const id = randomUUID();
    const now = new Date().toISOString();
    const db = getDatabase();
    db.prepare(
      `INSERT INTO photos (id, title, description, taken_at, file_name, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(id, input.title, input.description ?? null, input.takenAt ?? null, input.fileName, now);

    return this.find(id)!;
  }

  static find(id: string): Photo | undefined {
    const db = getDatabase();
    const row = db
      .prepare(
        `SELECT id, title, description, taken_at, file_name, created_at
         FROM photos WHERE id = ?`,
      )
      .get(id);

    return row ? toModel(row) : undefined;
  }

  static delete(id: string): void {
    const db = getDatabase();
    db.prepare(`DELETE FROM photos WHERE id = ?`).run(id);
  }
}
