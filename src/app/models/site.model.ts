export interface SiteTouristique {
  nom: string;
  description: string;
  typeSite: string;
  photoUrl: string;
  coordonneesGPS: string;
  accessibleMobiliteReduite: string;
  dateDisponibilite: string;
  localiteNom?: string; // Optionnel, car retourné par l'API avec SITUE_DANS
  localiteCoordonneesGPS?: string; // Optionnel
}