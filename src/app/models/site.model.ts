export interface SiteTouristique {
  nom: string;
  description: string;
  type: string;                // correspond à Neo4j
  photo: string;               // correspond à Neo4j
  coordonneeGPS: string;       // correspond à Neo4j
  accessibilite: string;       // correspond à Neo4j
  periodeRecommande?: string;  // correspond à Neo4j
  localiteNom?: string;
  localiteCoordonneeGPS?: string;
}
