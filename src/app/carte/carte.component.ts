import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { ApiService } from '../services/api.service';
import { SiteTouristique } from '../models/site.model';
import { CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-carte',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carte.component.html',
  styleUrls: ['./carte.component.css'],
})
export class CartesComponent implements OnInit {
  private map!: L.Map;
  searchTerm = '';
  allSites: SiteTouristique[] = [];
  private markers: L.Marker[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.initMap();

    this.apiService.getSites().subscribe({
      next: (sites: SiteTouristique[]) => {
        this.allSites = sites;
        this.updateMarkers(sites); // afficher tout au départ
      },
      error: (err) => {
        console.error('Erreur chargement sites', err);
      }
    });
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [12.3714, -1.5197],
      zoom: 6
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase();
    const filtered = this.allSites.filter(site =>
      site.nom.toLowerCase().includes(term) ||
      site.description.toLowerCase().includes(term)
    );
    this.updateMarkers(filtered);
  }

  private updateMarkers(sites: SiteTouristique[]) {
    // supprimer anciens marqueurs
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];

    // ajouter nouveaux marqueurs
    sites.forEach(site => {
      if (site.coordonneesGPS) {
        const [lat, lng] = site.coordonneesGPS.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          const marker = L.marker([lat, lng])
            .addTo(this.map)
            .bindPopup(`<b>${site.nom}</b><br>${site.description}`);
          this.markers.push(marker);
        }
      }
    });
  }
}
