import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { getDatabase } from "./database.js";

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export class UserService {
  static findByEmail(email: string): UserRecord | undefined {
    const db = getDatabase();
    return db
      .prepare(`SELECT id, email, password_hash, created_at FROM users WHERE email = ?`)
      .get(email);
  }

  static ensureSeedUser(email: string, password: string): void {
    const existing = this.findByEmail(email);
    const db = getDatabase();
    const hash = bcrypt.hashSync(password, 10);

    if (existing) {
      const passwordMatches = bcrypt.compareSync(password, existing.password_hash);
      if (!passwordMatches) {
        db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(hash, existing.id);
      }
      return;
    }

    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)`,
    ).run(randomUUID(), email, hash, now);
  }

  static verifyCredentials(email: string, password: string): UserRecord | null {
    const user = this.findByEmail(email);
    if (!user) {
      return null;
    }

    const match = bcrypt.compareSync(password, user.password_hash);
    return match ? user : null;
  }
}
