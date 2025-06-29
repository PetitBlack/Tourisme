import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SiteTouristique } from '../models/site.model';
import { Localite } from '../models/localite.model';
import { Activite } from '../models/activite.model';
import { CarteSpatiale } from '../models/carte.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080'; // Aligné avec le port de ton API FastAPI

  constructor(private http: HttpClient) { }

  // Gestion des erreurs HTTP
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code: ${error.status}, Message: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Récupérer toutes les localités
  getLocalites(): Observable<Localite[]> {
    return this.http.get<Localite[]>(`${this.baseUrl}/localites`).pipe(
      catchError(this.handleError)
    );
  }

  // Récupérer tous les sites touristiques
  getSites(): Observable<SiteTouristique[]> {
    return this.http.get<SiteTouristique[]>(`${this.baseUrl}/sites`).pipe(
      catchError(this.handleError)
    );
  }

  // Récupérer les sites par localité
  getSitesByLocalite(localiteNom: string): Observable<SiteTouristique[]> {
    return this.http.get<SiteTouristique[]>(`${this.baseUrl}/sites/localite/${encodeURIComponent(localiteNom)}`).pipe(
      catchError(this.handleError)
    );
  }

  // Récupérer toutes les activités
  getActivites(): Observable<Activite[]> {
    return this.http.get<Activite[]>(`${this.baseUrl}/activites`).pipe(
      catchError(this.handleError)
    );
  }

  // Récupérer les activités par lieu
  getActivitesByLieu(lieuNom: string): Observable<Activite[]> {
    return this.http.get<Activite[]>(`${this.baseUrl}/activites/lieu/${encodeURIComponent(lieuNom)}`).pipe(
      catchError(this.handleError)
    );
  }

  // Récupérer toutes les cartes spatiales
  getCartes(): Observable<CarteSpatiale[]> {
    return this.http.get<CarteSpatiale[]>(`${this.baseUrl}/cartes`).pipe(
      catchError(this.handleError)
    );
  }
}