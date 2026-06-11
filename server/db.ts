import sqlite3 from "sqlite3";
import path from "path";

const DB_FILE = path.join(process.cwd(), "database.sqlite");

export interface DatabaseUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface DatabaseApplication {
  id: string;
  userId: string;
  name: string;
  clientId: string;
  clientSecret: string;
  redirectUris: string[];
  allowedOrigins: string[];
  createdAt: string;
  status: "active" | "inactive";
}

export interface SavedDatabaseRecord {
  id: string;
  clientId: string;
  collection: string;
  data: any;
  createdAt: string;
}

export interface SavedStorageRecord {
  id: string;
  clientId: string;
  filePath: string;
  originalName: string;
  simulatedUrl: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
}

export interface KeyLineEndUser {
  id: string;
  clientId: string;
  name: string;
  email: string;
  status: "active" | "suspended";
  createdAt: string;
}

export interface DatabaseSession {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: number;
}

class SQLiteDB {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(DB_FILE, (err) => {
      if (err) {
        console.error("Failed to open SQLite database:", err);
      } else {
        console.log("Connected to persistent SQLite database at: " + DB_FILE);
      }
    });
    this.init();
  }

  private init() {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT,
          email TEXT UNIQUE,
          passwordHash TEXT,
          createdAt TEXT
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS applications (
          id TEXT PRIMARY KEY,
          userId TEXT,
          name TEXT,
          clientId TEXT UNIQUE,
          clientSecret TEXT,
          redirectUris TEXT,
          allowedOrigins TEXT,
          createdAt TEXT,
          status TEXT
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS database_records (
          id TEXT PRIMARY KEY,
          clientId TEXT,
          collection TEXT,
          data TEXT,
          createdAt TEXT
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS storage_records (
          id TEXT PRIMARY KEY,
          clientId TEXT,
          filePath TEXT,
          originalName TEXT,
          simulatedUrl TEXT,
          sizeBytes INTEGER,
          mimeType TEXT,
          uploadedAt TEXT
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS end_users (
          id TEXT PRIMARY KEY,
          clientId TEXT,
          name TEXT,
          email TEXT,
          status TEXT,
          createdAt TEXT
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          userId TEXT,
          createdAt TEXT,
          expiresAt INTEGER
        )
      `);

      // Bootstrap initial clients if empty
      this.db.get(`SELECT COUNT(*) as count FROM applications`, (err, row: any) => {
        if (!err && row && row.count === 0) {
          console.log("[DATABASE INIT] Bootstrapping master developer applications in SQLite...");
          
          const defaultApps = [
            {
              userId: "demo-user",
              name: "SaaS Analytics Dashboard",
              clientId: "kl_client_8f9e2d1c",
              clientSecret: "kl_secret_7a8b9c0d1e2f3g4h5i6j7k8l9m",
              redirectUris: ["http://localhost:4000/auth/callback"],
              allowedOrigins: ["http://localhost:4000"],
              status: "active",
            },
            {
              userId: "demo-user",
              name: "KeyLine Sandbox Mobile App",
              clientId: "kl_client_a1b2c3d4",
              clientSecret: "kl_secret_9z8y7x6w5v4u3t2s1r0q9p8o7n",
              redirectUris: ["keyline-sandbox://callback"],
              allowedOrigins: [],
              status: "active",
            },
            {
              userId: "demo-user",
              name: "OIDC Debugger Client",
              clientId: "kl_client_6o8umibgxh1qsqdi",
              clientSecret: "kl_secret_6o8umibgxh1qsqdi_secret_keys",
              redirectUris: ["https://oidcdebugger.com/redirect"],
              allowedOrigins: ["https://oidcdebugger.com"],
              status: "active",
            },
            {
              userId: "demo-user",
              name: "Permanent Production Client",
              clientId: "kl_client_7pgm182dqdo6ewsr",
              clientSecret: "kl_secret_7pgm182dqdo6ewsr_secret_key",
              redirectUris: ["https://oidcdebugger.com/redirect"],
              allowedOrigins: ["https://oidcdebugger.com"],
              status: "active",
            }
          ];

          for (const app of defaultApps) {
            const id = "kl_app_" + Math.random().toString(36).substr(2, 9);
            this.db.run(
              `INSERT INTO applications (id, userId, name, clientId, clientSecret, redirectUris, allowedOrigins, createdAt, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                id,
                app.userId,
                app.name,
                app.clientId,
                app.clientSecret,
                JSON.stringify(app.redirectUris),
                JSON.stringify(app.allowedOrigins),
                new Date().toISOString(),
                app.status
              ]
            );
          }
        }
      });
    });
  }

  // Promise helpers
  private run(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  private get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  private all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Users Helpers
  public users = {
    findMany: async (): Promise<DatabaseUser[]> => {
      const rows = await this.all(`SELECT * FROM users`);
      return rows;
    },
    findFirst: async (predicate: (u: DatabaseUser) => boolean): Promise<DatabaseUser | null> => {
      const rows = await this.all(`SELECT * FROM users`);
      return rows.find(predicate) || null;
    },
    create: async (user: Omit<DatabaseUser, "id" | "createdAt">): Promise<DatabaseUser> => {
      const newUser: DatabaseUser = {
        ...user,
        id: "kl_usr_" + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      };
      await this.run(
        `INSERT INTO users (id, name, email, passwordHash, createdAt) VALUES (?, ?, ?, ?, ?)`,
        [newUser.id, newUser.name, newUser.email, newUser.passwordHash, newUser.createdAt]
      );
      return newUser;
    },
    update: async (id: string, updates: Partial<Omit<DatabaseUser, "id" | "createdAt">>): Promise<DatabaseUser | null> => {
      const row = await this.get(`SELECT * FROM users WHERE id = ?`, [id]);
      if (!row) return null;
      const updated = { ...row, ...updates };
      await this.run(
        `UPDATE users SET name = ?, email = ?, passwordHash = ? WHERE id = ?`,
        [updated.name, updated.email, updated.passwordHash, id]
      );
      return updated;
    }
  };

  // Applications Helpers
  public applications = {
    findMany: async (predicate?: (app: DatabaseApplication) => boolean): Promise<DatabaseApplication[]> => {
      const rows = await this.all(`SELECT * FROM applications`);
      const mapped = rows.map((r) => ({
        ...r,
        redirectUris: JSON.parse(r.redirectUris || "[]"),
        allowedOrigins: JSON.parse(r.allowedOrigins || "[]")
      }));
      if (predicate) return mapped.filter(predicate);
      return mapped;
    },
    findFirst: async (predicate: (app: DatabaseApplication) => boolean): Promise<DatabaseApplication | null> => {
      const apps = await this.applications.findMany();
      return apps.find(predicate) || null;
    },
    create: async (app: Omit<DatabaseApplication, "id" | "clientId" | "clientSecret" | "createdAt" | "status">): Promise<DatabaseApplication> => {
      const newApp: DatabaseApplication = {
        ...app,
        id: "kl_app_" + Math.random().toString(36).substr(2, 9),
        clientId: "kl_client_" + Math.random().toString(36).substr(2, 8) + Math.random().toString(36).substr(2, 8),
        clientSecret: "kl_secret_" + Array.from({ length: 4 }, () => Math.random().toString(36).substr(2)).join("").substring(0, 32),
        status: "active",
        createdAt: new Date().toISOString(),
      };
      await this.run(
        `INSERT INTO applications (id, userId, name, clientId, clientSecret, redirectUris, allowedOrigins, createdAt, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newApp.id,
          newApp.userId,
          newApp.name,
          newApp.clientId,
          newApp.clientSecret,
          JSON.stringify(newApp.redirectUris),
          JSON.stringify(newApp.allowedOrigins),
          newApp.createdAt,
          newApp.status
        ]
      );
      return newApp;
    },
    update: async (id: string, updates: Partial<Omit<DatabaseApplication, "id" | "clientId" | "createdAt">>): Promise<DatabaseApplication | null> => {
      const row = await this.get(`SELECT * FROM applications WHERE id = ?`, [id]);
      if (!row) return null;
      const current = {
        ...row,
        redirectUris: JSON.parse(row.redirectUris || "[]"),
        allowedOrigins: JSON.parse(row.allowedOrigins || "[]")
      };
      const updated = { ...current, ...updates };
      await this.run(
        `UPDATE applications SET name = ?, clientSecret = ?, redirectUris = ?, allowedOrigins = ?, status = ? WHERE id = ?`,
        [
          updated.name,
          updated.clientSecret,
          JSON.stringify(updated.redirectUris),
          JSON.stringify(updated.allowedOrigins),
          updated.status,
          id
        ]
      );
      return updated;
    },
    delete: async (id: string): Promise<boolean> => {
      const result = await this.run(`DELETE FROM applications WHERE id = ?`, [id]);
      return result.changes > 0;
    }
  };

  // Database Records Helpers
  public databaseRecords = {
    findMany: async (predicate?: (rec: SavedDatabaseRecord) => boolean): Promise<SavedDatabaseRecord[]> => {
      const rows = await this.all(`SELECT * FROM database_records`);
      const mapped = rows.map((r) => ({
        ...r,
        data: JSON.parse(r.data || "{}")
      }));
      if (predicate) return mapped.filter(predicate);
      return mapped;
    },
    create: async (payload: Omit<SavedDatabaseRecord, "id" | "createdAt">): Promise<SavedDatabaseRecord> => {
      const newRecord: SavedDatabaseRecord = {
        ...payload,
        id: "rec_" + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      };
      await this.run(
        `INSERT INTO database_records (id, clientId, collection, data, createdAt) VALUES (?, ?, ?, ?, ?)`,
        [newRecord.id, newRecord.clientId, newRecord.collection, JSON.stringify(newRecord.data), newRecord.createdAt]
      );
      return newRecord;
    },
    clearAll: async (clientId: string): Promise<void> => {
      await this.run(`DELETE FROM database_records WHERE clientId = ?`, [clientId]);
    }
  };

  // Storage Records Helpers
  public storageRecords = {
    findMany: async (predicate?: (rec: SavedStorageRecord) => boolean): Promise<SavedStorageRecord[]> => {
      const rows = await this.all(`SELECT * FROM storage_records`);
      if (predicate) return rows.filter(predicate);
      return rows;
    },
    create: async (payload: Omit<SavedStorageRecord, "id" | "uploadedAt">): Promise<SavedStorageRecord> => {
      const newRecord: SavedStorageRecord = {
        ...payload,
        id: "file_" + Math.random().toString(36).substr(2, 9),
        uploadedAt: new Date().toISOString(),
      };
      await this.run(
        `INSERT INTO storage_records (id, clientId, filePath, originalName, simulatedUrl, sizeBytes, mimeType, uploadedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newRecord.id,
          newRecord.clientId,
          newRecord.filePath,
          newRecord.originalName,
          newRecord.simulatedUrl,
          newRecord.sizeBytes,
          newRecord.mimeType,
          newRecord.uploadedAt
        ]
      );
      return newRecord;
    },
    clearAll: async (clientId: string): Promise<void> => {
      await this.run(`DELETE FROM storage_records WHERE clientId = ?`, [clientId]);
    }
  };

  // End Users Helpers
  public endUsers = {
    findMany: async (predicate?: (user: KeyLineEndUser) => boolean): Promise<KeyLineEndUser[]> => {
      const rows = await this.all(`SELECT * FROM end_users`);
      if (predicate) return rows.filter(predicate);
      return rows;
    },
    create: async (payload: Omit<KeyLineEndUser, "id" | "createdAt">): Promise<KeyLineEndUser> => {
      const newUser: KeyLineEndUser = {
        ...payload,
        id: "kl_usr_" + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      };
      await this.run(
        `INSERT INTO end_users (id, clientId, name, email, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
        [newUser.id, newUser.clientId, newUser.name, newUser.email, newUser.status, newUser.createdAt]
      );
      return newUser;
    },
    delete: async (id: string): Promise<boolean> => {
      const result = await this.run(`DELETE FROM end_users WHERE id = ?`, [id]);
      return result.changes > 0;
    },
    clearAll: async (clientId: string): Promise<void> => {
      await this.run(`DELETE FROM end_users WHERE clientId = ?`, [clientId]);
    }
  };

  // Sessions Helpers (Active persistent sessions)
  public sessions = {
    findMany: async (): Promise<DatabaseSession[]> => {
      const rows = await this.all(`SELECT * FROM sessions`);
      return rows;
    },
    findFirst: async (predicate: (s: DatabaseSession) => boolean): Promise<DatabaseSession | null> => {
      const rows = await this.all(`SELECT * FROM sessions`);
      return rows.find(predicate) || null;
    },
    create: async (session: Omit<DatabaseSession, "createdAt">): Promise<DatabaseSession> => {
      const newSession: DatabaseSession = {
        ...session,
        createdAt: new Date().toISOString()
      };
      await this.run(
        `INSERT INTO sessions (id, userId, createdAt, expiresAt) VALUES (?, ?, ?, ?)`,
        [newSession.id, newSession.userId, newSession.createdAt, newSession.expiresAt]
      );
      return newSession;
    },
    delete: async (id: string): Promise<boolean> => {
      const result = await this.run(`DELETE FROM sessions WHERE id = ?`, [id]);
      return result.changes > 0;
    }
  };
}

export const db = new SQLiteDB();
