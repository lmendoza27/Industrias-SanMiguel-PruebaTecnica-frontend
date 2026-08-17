import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Task } from '../domain/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http: HttpClient = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tasks`;

  /**
   * Obtiene todas las tareas del usuario autenticado
   */
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  /**
   * Obtiene una tarea específica por su UUID
   */
  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea una nueva tarea
   */
  createTask(task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Observable<{ message: string; task: Task }> {
    return this.http.post<{ message: string; task: Task }>(this.apiUrl, task);
  }

  /**
   * Actualiza el estado, título o descripción de una tarea existente
   */
  updateTask(id: string, taskData: Partial<Task>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, taskData);
  }

  /**
   * Elimina una tarea por su UUID
   */
  deleteTask(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}