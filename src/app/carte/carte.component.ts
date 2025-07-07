import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { ApiService } from '../services/api.service';
import { SiteTouristique } from '../models/site.model';
import { Localite } from '../models/localite.model';

@Component({
  selector: 'app-carte',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carte.component.html',
  styleUrls: ['./carte.component.css']
})
export class CarteComponent implements AfterViewInit {
  searchTerm: string = '';
  allSites: SiteTouristique[] = [];
  allLocalites: Localite[] = [];
  errorMessage: string | null = null;

  private map!: L.Map;
  private markers: L.Marker[] = [];

  constructor(private apiService: ApiService) {}

  ngAfterViewInit(): void {
    this.initMap();

    this.apiService.getSites().subscribe({
      next: (sites) => this.allSites = sites || [],
      error: () => this.errorMessage = 'Erreur chargement des sites.'
    });

    this.apiService.getLocalites().subscribe({
      next: (localites) => this.allLocalites = localites || [],
      error: () => this.errorMessage = 'Erreur chargement des localités.'
    });
  }

  private initMap(): void {
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('map', {
      center: [12.3714, -1.5197], // Centre Burkina Faso
      zoom: 6,
      maxBounds: [
        [9.0, -6.5],
        [15.0, 2.5]
      ],
      maxBoundsViscosity: 1.0
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Important pour corriger l'affichage de la carte
    setTimeout(() => {
      this.map.invalidateSize();
    }, 100);
  }

  onSearch(): void {
    this.clearMarkers();
    this.errorMessage = null;
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.map.setView([12.3714, -1.5197], 6);
      return;
    }

    // Recherche site touristique
    const site = this.allSites.find(s => s.nom?.toLowerCase().includes(term));
    if (site && site.coordonneeGPS) {
      const coords = this.parseAnyCoordinates(site.coordonneeGPS);
      if (coords) {
        const [lat, lng] = coords;
        const marker = L.marker([lat, lng])
          .addTo(this.map)
          .bindPopup(`<b>${site.nom}</b><br>${site.description || ''}`);
        this.markers.push(marker);
        this.map.setView([lat, lng], 13);
        marker.openPopup();
        return;
      }
    }

    // Recherche localité
    const localite = this.allLocalites.find(l => l.nom?.toLowerCase().includes(term));
    if (localite && localite.coordonneeGPS) {
      const coords = this.parseAnyCoordinates(localite.coordonneeGPS);
      if (coords) {
        const [lat, lng] = coords;
        const marker = L.marker([lat, lng])
          .addTo(this.map)
          .bindPopup(`<b>Localité : ${localite.nom}</b>`);
        this.markers.push(marker);
        this.map.setView([lat, lng], 13);
        marker.openPopup();
        return;
      }
    }

    this.errorMessage = "Aucun site ou localité correspondant trouvé.";
  }

  private clearMarkers(): void {
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];
  }

  private parseAnyCoordinates(coord: string): [number, number] | null {
    if (coord.includes(',')) {
      const parts = coord.split(',').map(p => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return [parts[0], parts[1]];
      }
    }

    const regex = /(\d+)°\s*(\d+)′\s*(\d+)″\s*(nord|sud),\s*(\d+)°\s*(\d+)′\s*(\d+)″\s*(est|ouest)/i;
    const match = coord.match(regex);
    if (!match) return null;

    const [, degLat, minLat, secLat, dirLat, degLng, minLng, secLng, dirLng] = match;
    let lat = parseInt(degLat) + parseInt(minLat) / 60 + parseInt(secLat) / 3600;
    let lng = parseInt(degLng) + parseInt(minLng) / 60 + parseInt(secLng) / 3600;
    if (dirLat.toLowerCase() === 'sud') lat = -lat;
    if (dirLng.toLowerCase() === 'ouest') lng = -lng;
    return [lat, lng];
  }
}
