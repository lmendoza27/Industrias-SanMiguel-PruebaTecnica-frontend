import { Injectable, inject } from '@angular/core';
import { Network } from '@capacitor/network';
import { LocalDbService } from './local-db.service';
import { TaskService } from './task.service';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private localDb = inject(LocalDbService);
  private taskService = inject(TaskService);

  initNetworkListener(): void {
    Network.addListener('networkStatusChange', async (status) => {
      if (status.connected) {
        console.log('Conexión reestablecida. Sincronizando datos...');
        await this.syncPendingTasks();
      }
    });
  }

  async syncPendingTasks(): Promise<void> {
    const unsynced = await this.localDb.getUnsyncedTasks();

    for (const task of unsynced) {
      this.taskService.createTask({
        title: task.title,
        description: task.description || '',
        status: task.status
      }).subscribe({
        next: async (res) => {
          if (task.id) await this.localDb.deleteLocalTask(task.id);
          await this.localDb.saveLocalTask(res.task, true);
        },
        error: (err) => console.error('Error al sincronizar tarea:', err)
      });
    }
  }
}