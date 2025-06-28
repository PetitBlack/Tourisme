from rdflib import RDF, Graph, Namespace
from neo4j import GraphDatabase

ONTO = Namespace("http://www.owl-ontologie-tourisme#")

class OntologyLoader:
    def __init__(self, owl_path, neo4j_uri, user, password):
        self.graph = Graph()
        self.graph.parse(owl_path, format='xml')
        self.driver = GraphDatabase.driver(neo4j_uri, auth=(user, password))

    def insert_data_into_neo4j(self):
        with self.driver.session() as session:
            for s, p, o in self.graph:
                # Sites touristiques
                if (p == ONTO.nom and (ONTO.SiteTouristique in self.graph.objects(s, RDF.type))):
                    nom = str(o)
                    session.run("MERGE (s:SiteTouristique {nom: $nom})", nom=nom)

                # Localités
                elif (p == ONTO.nom and (ONTO.Localite in self.graph.objects(s, RDF.type))):
                    nom = str(o)
                    session.run("MERGE (l:Localite {nom: $nom})", nom=nom)

                # Activités
                elif (p == ONTO.nom and (ONTO.Activite in self.graph.objects(s, RDF.type))):
                    nom = str(o)
                    session.run("MERGE (a:Activite {nom: $nom})", nom=nom)

                # Relations d'objet
                elif p == ONTO.situeDans:
                    session.run("""
                        MATCH (s:SiteTouristique), (l:Localite)
                        WHERE s.nom = $s_nom AND l.nom = $l_nom
                        MERGE (s)-[:SITUE_DANS]->(l)
                    """, s_nom=s.split("#")[-1], l_nom=o.split("#")[-1])

                elif p == ONTO.proposeActivite:
                    session.run("""
                        MATCH (s:SiteTouristique), (a:Activite)
                        WHERE s.nom = $s_nom AND a.nom = $a_nom
                        MERGE (s)-[:PROPOSE_ACTIVITE]->(a)
                    """, s_nom=s.split("#")[-1], a_nom=o.split("#")[-1])

        print("✅ Ontologie insérée dans Neo4j")
