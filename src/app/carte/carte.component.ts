import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carte',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carte.component.html',
  styleUrls: ['./carte.component.css'],
})
export class CartesComponent implements OnInit {
  private map!: L.Map;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.initMap();

    // charger les sites depuis l'API pour placer les marqueurs
    this.apiService.getSites().subscribe((sites) => {
      sites.forEach((site) => {
        // si tu récupères des coordonnées, utilise-les à la place
        L.marker([12.3714, -1.5197]) // coord. d'exemple (Ouagadougou)
          .addTo(this.map)
          .bindPopup(`<b>${site.nom}</b><br>${site.description}`);
      });
    });
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [12.3714, -1.5197], // centre sur Burkina Faso
      zoom: 6
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  }
}
