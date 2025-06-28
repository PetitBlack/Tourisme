import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-sites',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sites.component.html',
  styleUrls: ['./sites.component.css'],
})
export class SitesComponent implements OnInit {
  searchTerm = '';
  sites: any[] = [];
  filteredSites: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getSites().subscribe({
      next: (data) => {
        console.log('Sites reçus:', data);  // <-- Ajouté ici
        this.sites = data;
        this.filteredSites = data;
      },
      error: (err) => {
        console.error('Erreur chargement sites', err);  // <-- Ajouté ici
      }
    });
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase();
    this.filteredSites = this.sites.filter(site =>
      site.nom.toLowerCase().includes(term) ||
      site.description.toLowerCase().includes(term)
    );
  }
}
