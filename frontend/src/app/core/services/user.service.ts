import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Page, UserResponse } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/profile`);
  }

  getAllUsers(page: number = 0, size: number = 10): Observable<Page<UserResponse>> {
    return this.http.get<Page<UserResponse>>(`${this.apiUrl}/admin/users?page=${page}&size=${size}`);
  }

  updateUserStatus(userId: number, active: boolean): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/admin/users/${userId}/status?active=${active}`, {});
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/users/${userId}`);
  }

  getPendingGuideRequests(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/admin/guide-requests`);
  }

  approveGuide(guideId: number): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/admin/guide-requests/${guideId}/approve`, {});
  }

  rejectGuide(guideId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/guide-requests/${guideId}/reject`);
  }
}
