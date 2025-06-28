import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-left-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './left-sidebar.component.html',
  styleUrl: './left-sidebar.component.css',
})
export class LeftSidebarComponent {
  isLeftSidebarCollapsed = input.required<boolean>();
  changeIsLeftSidebarCollapsed = output<boolean>();
items = [
  {
    routeLink: 'home',
    icon: 'fas fa-home',       // maison
    label: 'Accueil',
  },
  {
    routeLink: 'sites',
    icon: 'fas fa-map-marker-alt', // site / lieu
    label: 'Sites',
  },
  {
    routeLink: 'localites',
    icon: 'fas fa-city',       // ville
    label: 'Localités',
  },
  {
    routeLink: 'carte',
    icon: 'fas fa-map',        // carte
    label: 'Cartes',
  },
];

  toggleCollapse(): void {
    this.changeIsLeftSidebarCollapsed.emit(!this.isLeftSidebarCollapsed());
  }

  closeSidenav(): void {
    this.changeIsLeftSidebarCollapsed.emit(true);
  }
}
