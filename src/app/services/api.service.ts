import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Site } from '../models/site.model';
import { Localite } from '../models/localite.model';
import { Activite } from '../models/activite.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8000'; // ton fastAPI

  constructor(private http: HttpClient) {}

  getSites(): Observable<Site[]> {
    return this.http.get<Site[]>(`${this.baseUrl}/sites`);
  }

  getLocalites(): Observable<Localite[]> {
    return this.http.get<Localite[]>(`${this.baseUrl}/localites`);
  }

  getActivites(): Observable<Activite[]> {
    return this.http.get<Activite[]>(`${this.baseUrl}/activites`);
  }

  getSitesByLocalite(localiteNom: string): Observable<Site[]> {
    return this.http.get<Site[]>(`${this.baseUrl}/sites/localite/${localiteNom}`);
  }
}
