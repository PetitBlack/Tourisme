export interface Site {
  nom: string;
  description: string;
  typeSite: string;
  statut: string;
  periodeRecommandee: string;
  accessibilite: string;
  localiteNom?: string;
  coordonneesGPS?: string;
  activites?: string[];
}
