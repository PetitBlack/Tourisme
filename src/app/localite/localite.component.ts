import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Localite } from '../models/localite.model';

@Component({
  selector: 'app-localites',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './localite.component.html',
  styleUrls: ['./localite.component.css'],
})
export class LocaliteComponent implements OnInit {
  searchTerm = '';
  localites: Localite[] = [];
  filteredLocalites: Localite[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getLocalites().subscribe({
      next: (data) => {
        console.log('Localités reçues :', data);
        this.localites = data;
        this.filteredLocalites = data;
      },
      error: (err) => {
        console.error('Erreur chargement localités', err);
      }
    });
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase();
    this.filteredLocalites = this.localites.filter(localite =>
      localite.nom.toLowerCase().includes(term) ||
      localite.region.toLowerCase().includes(term)
    );
  }
}
