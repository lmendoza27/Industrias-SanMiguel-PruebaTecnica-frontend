import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core'; // <-- Importar Capacitor
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Task } from '../domain/task.model';

@Injectable({
  providedIn: 'root'
})
export class LocalDbService {
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private db!: SQLiteDBConnection;
  private isReady: boolean = false;

  async initializePlugin(): Promise<void> {
    // Si estamos en navegador web (ng serve), omitimos SQLite
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      this.db = await this.sqlite.createConnection('tasks_db', false, 'no-encryption', 1, false);
      await this.db.open();

      const schema = `
        CREATE TABLE IF NOT EXISTS local_tasks (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT NOT NULL,
          synced INTEGER DEFAULT 0
        );
      `;
      await this.db.execute(schema);
      this.isReady = true;
    } catch (err) {
      console.error('Error al inicializar SQLite local:', err);
    }
  }

  async getLocalTasks(): Promise<Task[]> {
    if (!Capacitor.isNativePlatform()) return [];
    if (!this.isReady) await this.initializePlugin();
    const res = await this.db.query('SELECT * FROM local_tasks');
    return (res.values || []) as Task[];
  }

  async saveLocalTask(task: Task, isSynced: boolean = false): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    if (!this.isReady) await this.initializePlugin();
    const syncedValue = isSynced ? 1 : 0;
    const query = `
      INSERT OR REPLACE INTO local_tasks (id, title, description, status, synced)
      VALUES (?, ?, ?, ?, ?);
    `;
    await this.db.run(query, [
      task.id || crypto.randomUUID(), 
      task.title, 
      task.description || '', 
      task.status, 
      syncedValue
    ]);
  }

  async getUnsyncedTasks(): Promise<Task[]> {
    if (!Capacitor.isNativePlatform()) return [];
    if (!this.isReady) await this.initializePlugin();
    const res = await this.db.query('SELECT * FROM local_tasks WHERE synced = 0');
    return (res.values || []) as Task[];
  }

  async markAsSynced(id: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    if (!this.isReady) await this.initializePlugin();
    await this.db.run('UPDATE local_tasks SET synced = 1 WHERE id = ?', [id]);
  }

  async deleteLocalTask(id: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    if (!this.isReady) await this.initializePlugin();
    await this.db.run('DELETE FROM local_tasks WHERE id = ?', [id]);
  }
}