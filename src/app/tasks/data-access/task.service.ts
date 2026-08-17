import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Task } from '../domain/task.model';
import { AuthService } from '../../auth/data-access/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http: HttpClient = inject(HttpClient);
  private authService: AuthService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/tasks`;

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createTask(task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Observable<{ message: string; task: Task }> {
    return this.http.post<{ message: string; task: Task }>(this.apiUrl, task, { headers: this.getHeaders() });
  }

  updateTask(id: string, taskData: Partial<Task>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, taskData, { headers: this.getHeaders() });
  }

  deleteTask(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}