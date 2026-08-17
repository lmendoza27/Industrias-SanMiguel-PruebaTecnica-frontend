import { Injectable, inject } from '@angular/core';
import { Network } from '@capacitor/network';
import { LocalDbService } from './local-db.service';
import { TaskService } from './task.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private localDb = inject(LocalDbService);
  private taskService = inject(TaskService);
  private isSyncing: boolean = false; // 👈 Candado para evitar ejecuciones simultáneas

  // Se define que el callback acepta el argumento syncedCount
  initNetworkListener(onSyncComplete?: (syncedCount: number) => void): void {
    Network.addListener('networkStatusChange', async (status) => {
      if (status.connected) {
        console.log('Conexión reestablecida en App Móvil. Sincronizando...');
        await this.syncPendingTasks(onSyncComplete);
      }
    });

    window.addEventListener('online', async () => {
      console.log('Conexión reestablecida en Navegador Web. Sincronizando...');
      await this.syncPendingTasks(onSyncComplete);
    });
  }

async syncPendingTasks(onSyncComplete?: (syncedCount: number) => void): Promise<void> {
    // Si ya hay un proceso de sincronización en marcha, ignorar nuevas llamadas
    if (this.isSyncing) return;

    this.isSyncing = true;

    try {
      const unsynced = await this.localDb.getUnsyncedTasks();

      if (unsynced.length === 0) {
        this.isSyncing = false;
        return;
      }

      let syncedCount = 0;

      for (const task of unsynced) {
        try {
          const response: any = await firstValueFrom(
            this.taskService.createTask({
              title: task.title,
              description: task.description || '',
              status: task.status
            })
          );

          const savedTask = response.task || response.data || response;

          // Borrar registro temporal offline y guardar el confirmado por Laravel
          if (task.id) await this.localDb.deleteLocalTask(task.id);
          await this.localDb.saveLocalTask(savedTask, true);
          syncedCount++;
        } catch (err) {
          console.error('Error al enviar tarea pendiente a Laravel:', err);
        }
      }

      if (onSyncComplete && syncedCount > 0) {
        onSyncComplete(syncedCount);
      }
    } finally {
      this.isSyncing = false; // 👈 Liberar el candado al terminar
    }
  }
}