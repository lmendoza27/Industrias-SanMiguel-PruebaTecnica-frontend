import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../data-access/task.service';
import { AuthService } from '../../auth/data-access/auth.service';
import { LocalDbService } from '../data-access/local-db.service';
import { SyncService } from '../data-access/sync.service';
import { Task } from '../domain/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private localDb = inject(LocalDbService);
  private syncService = inject(SyncService);
  private router = inject(Router);

  tasks: Task[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  newTask: { title: string; description: string; status: 'pending' | 'in_progress' | 'completed' } = {
    title: '',
    description: '',
    status: 'pending'
  };

  ngOnInit(): void {
    this.syncService.initNetworkListener();
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getTasks().subscribe({
      next: async (data) => {
        this.tasks = data;
        this.isLoading = false;
        // Guardar copia local en SQLite
        for (const task of data) {
          await this.localDb.saveLocalTask(task, true);
        }
      },
      error: async () => {
        // Si falla la API (modo offline), cargar de SQLite
        this.tasks = await this.localDb.getLocalTasks();
        this.errorMessage = 'Modo sin conexión: mostrando tareas locales.';
        this.isLoading = false;
      }
    });
  }

  async createTask(): Promise<void> {
    if (!this.newTask.title.trim()) return;

    const tempTask: Task = {
      id: crypto.randomUUID(),
      title: this.newTask.title,
      description: this.newTask.description,
      status: this.newTask.status
    };

    this.taskService.createTask(this.newTask).subscribe({
      next: async (res) => {
        this.tasks.push(res.task);
        await this.localDb.saveLocalTask(res.task, true);
        this.resetForm();
      },
      error: async () => {
        // Si falla por falta de red, guardar localmente para sincronizar luego
        this.tasks.push(tempTask);
        await this.localDb.saveLocalTask(tempTask, false);
        this.errorMessage = 'Tarea guardada en modo offline. Se sincronizará al conectar a internet.';
        this.resetForm();
      }
    });
  }

  private resetForm(): void {
    this.newTask = { title: '', description: '', status: 'pending' };
  }

  updateStatus(task: Task, newStatus: 'pending' | 'in_progress' | 'completed'): void {
    if (!task.id) return;

    this.taskService.updateTask(task.id, { status: newStatus }).subscribe({
      next: async () => {
        task.status = newStatus;
        await this.localDb.saveLocalTask(task, true);
      },
      error: async () => {
        task.status = newStatus;
        await this.localDb.saveLocalTask(task, false);
      }
    });
  }

  deleteTask(id?: string): void {
    if (!id) return;

    if (confirm('¿Estás seguro de eliminar esta tarea?')) {
      this.taskService.deleteTask(id).subscribe({
        next: async () => {
          this.tasks = this.tasks.filter(t => t.id !== id);
          await this.localDb.deleteLocalTask(id);
        },
        error: async () => {
          this.tasks = this.tasks.filter(t => t.id !== id);
          await this.localDb.deleteLocalTask(id);
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}