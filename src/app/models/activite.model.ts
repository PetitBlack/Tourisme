export interface Activite {
  nom: string;
  type: string;
  description: string;
  dateHeure?: string;
  frequence: string;
  lieu: string;
  siteNom?: string;   // <-- ajouter ce champ optionnel si pas déjà fait
  localiteNom?: string;
}
