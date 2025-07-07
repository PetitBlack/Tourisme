import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Localite } from '../models/localite.model';
import { SiteTouristique } from '../models/site.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-localites',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './localite.component.html',
  styleUrls: ['./localite.component.css'],
})
export class LocaliteComponent implements OnInit {
  allLocalites: Localite[] = [];
  filteredLocalites: Localite[] = [];
  searchTerm = '';

  // On met le bon type avec assertion non nulle pour éviter les soucis
  sitesParLocalite: Record<string, SiteTouristique[]> = {};

  constructor(private apiService: ApiService) {}
  getSitesForLocalite(localiteNom?: string): SiteTouristique[] {
  if (!localiteNom) return [];
  return this.sitesParLocalite[localiteNom] ?? [];
}

  ngOnInit() {
    this.apiService.getLocalites().subscribe({
      next: (localites) => {
        this.allLocalites = localites;
        this.filteredLocalites = localites;
        this.filteredLocalites.forEach(loc => {
          if (loc.nom) this.loadSitesByLocalite(loc.nom);
        });
      },
      error: (err) => console.error('Erreur chargement localités', err),
    });
  }

  onSearch() {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      this.filteredLocalites = this.allLocalites;
      this.filteredLocalites.forEach(loc => {
        if (loc.nom) this.loadSitesByLocalite(loc.nom);
      });
      return;
    }

    this.filteredLocalites = this.allLocalites.filter(loc =>
      loc.nom?.toLowerCase().includes(term) ||
      loc.region?.toLowerCase().includes(term)
    );

    this.filteredLocalites.forEach(loc => {
      if (loc.nom) this.loadSitesByLocalite(loc.nom);
    });
  }

  loadSitesByLocalite(localiteNom: string) {
    if (this.sitesParLocalite[localiteNom]) return;

    this.apiService.getSitesByLocalite(localiteNom).subscribe({
      next: (sites) => {
        this.sitesParLocalite[localiteNom] = sites;
      },
      error: (err) => {
        console.error(`Erreur chargement sites pour localité ${localiteNom}`, err);
        this.sitesParLocalite[localiteNom] = [];
      }
    });
  }
}
