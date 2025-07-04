import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { SiteTouristique } from '../models/site.model';

@Component({
  selector: 'app-sites',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sites.component.html',
  styleUrls: ['./sites.component.css'],
})
export class SitesComponent implements OnInit {
  searchTerm: string = '';
  sites: SiteTouristique[] = [];
  filteredSites: SiteTouristique[] = [];
  errorMessage: string | null = null;

  constructor(private apiService: ApiService) {}

ngOnInit(): void {
  this.apiService.getSites().subscribe({
    next: (data: SiteTouristique[]) => {
      this.sites = data.map(site => ({ ...site, flipped: false }));
      this.filteredSites = [];
      this.errorMessage = null;
    },
    error: (err) => {
      console.error('Erreur lors du chargement des sites:', err);
      this.errorMessage = 'Impossible de charger les sites touristiques. Vérifiez la connexion.';
    }
  });
}


toggleFlip(site: any): void {
  site.flipped = !site.flipped;
}

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredSites = [...this.sites];
      return;
    }
    this.filteredSites = this.sites.filter(site =>
      (site.nom?.toLowerCase()?.includes(term) || '') ||
      (site.description?.toLowerCase()?.includes(term) || '') ||
      (site.typeSite?.toLowerCase()?.includes(term) || '') ||
      (site.localiteNom?.toLowerCase()?.includes(term) || '')
    );
  }
}