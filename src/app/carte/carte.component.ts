import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { ApiService } from '../services/api.service';
import { SiteTouristique } from '../models/site.model';

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
  filteredSites: SiteTouristique[] = [];
  errorMessage: string | null = null;
  private map!: L.Map;
  private markers: L.Marker[] = [];

  constructor(private apiService: ApiService) {}

  ngAfterViewInit(): void {
    this.initMap();

    this.apiService.getSites().subscribe({
      next: (sites: SiteTouristique[]) => {
        this.allSites = sites || [];
        this.filteredSites = sites || [];
        this.errorMessage = null;
        this.onSearch(); // Met à jour la carte avec les sites chargés
      },
      error: (err) => {
        this.errorMessage = "Impossible de charger les sites touristiques. Veuillez vérifier la connexion à l'API.";
      }
    });
  }

  private initMap(): void {
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('map', {
      center: [12.3714, -1.5197],
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
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredSites = [...this.allSites];
      this.updateMarkers(this.filteredSites, false);
      return;
    }
    this.filteredSites = this.allSites.filter(site =>
      (site.nom?.toLowerCase().includes(term) || '') ||
      (site.description?.toLowerCase().includes(term) || '') ||
      (site.typeSite?.toLowerCase().includes(term) || '') ||
      (site.localiteNom?.toLowerCase().includes(term) || '')
    );
    this.updateMarkers(this.filteredSites, this.filteredSites.length === 1);
  }

  private parseCoordinates(coord: string): [number, number] | null {
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

  private updateMarkers(sites: SiteTouristique[], singleMarker: boolean = false): void {
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];

    if (sites.length === 0) return;

    if (singleMarker) {
      const site = sites[0];
      if (site.coordonneesGPS) {
        const coords = this.parseCoordinates(site.coordonneesGPS);
        if (coords) {
          const [lat, lng] = coords;
          const marker = L.marker([lat, lng])
            .addTo(this.map)
            .bindPopup(`<b>${site.nom}</b><br>${site.description}`);
          this.markers.push(marker);
          this.map.setView([lat, lng], 13);
          marker.openPopup();
        }
      }
    } else {
      sites.forEach(site => {
        if (site.coordonneesGPS) {
          const coords = this.parseCoordinates(site.coordonneesGPS);
          if (coords) {
            const [lat, lng] = coords;
            const marker = L.marker([lat, lng])
              .addTo(this.map)
              .bindPopup(`<b>${site.nom}</b><br>${site.description}`);
            this.markers.push(marker);
          }
        }
      });
      this.map.setView([12.3714, -1.5197], 6);
    }
  }
}
