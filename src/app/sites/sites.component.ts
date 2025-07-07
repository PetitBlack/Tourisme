import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { SiteTouristique } from '../models/site.model';
import { Activite } from '../models/activite.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sites',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sites.component.html',
  styleUrls: ['./sites.component.css'],
})
export class SitesComponent implements OnInit {
  allSites: SiteTouristique[] = [];
  filteredSites: SiteTouristique[] = [];
  selectedSite?: SiteTouristique;
  siteActivities: Activite[] = [];
  searchTerm = '';
  displayMode: 'intro' | 'details' = 'intro';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getSites().subscribe({
      next: (sites) => {
        this.allSites = sites;
        this.filteredSites = sites;
      },
      error: (err) => console.error(err),
    });
  }

  onSearch() {
    const term = this.searchTerm.trim().toLowerCase();

    if (term.length === 0) {
      this.displayMode = 'intro';
      this.filteredSites = this.allSites;
      this.selectedSite = undefined;
      this.siteActivities = [];
      return;
    }

    this.filteredSites = this.allSites.filter(site =>
      site.nom?.toLowerCase().includes(term) ||
      site.description?.toLowerCase().includes(term) ||
      site.type?.toLowerCase().includes(term) ||
      site.localiteNom?.toLowerCase().includes(term) ||
      site.accessibilite?.toLowerCase().includes(term)
    );

    this.displayMode = 'details';
    this.selectedSite = undefined;
    this.siteActivities = [];
  }

  selectSite(site: SiteTouristique) {
    this.selectedSite = site;
    this.apiService.getActivitesBySite(site.nom).subscribe({
      next: (acts) => this.siteActivities = acts,
      error: () => this.siteActivities = [],
    });
  }

  backToIntro() {
    this.displayMode = 'intro';
    this.searchTerm = '';
    this.filteredSites = this.allSites;
    this.selectedSite = undefined;
    this.siteActivities = [];
  }
}
