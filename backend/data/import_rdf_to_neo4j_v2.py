
from rdflib import Graph, Namespace, RDF
from py2neo import Graph as NeoGraph, Node, Relationship

# === Config ===
RDF_FILE = "ontologie_tourisme_burkina.owl"  # nom du fichier RDF à placer dans le même dossier
NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "benh2000"

# === Chargement RDF ===
g = Graph()
g.parse(RDF_FILE, format="xml")

ONTO = Namespace("http://www.owl-ontologie-tourisme#")

# === Connexion à Neo4j ===
neo4j = NeoGraph(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

# === Insertion des Localites ===
for loc in g.subjects(RDF.type, ONTO.Localite):
    props = {
        "nom": str(g.value(loc, ONTO.nom)),
        "typeLocalite": str(g.value(loc, ONTO.typeLocalite)),
        "coordonneesGPS": str(g.value(loc, ONTO.coordonneesGPS))
    }
    node = Node("Localite", **props)
    neo4j.merge(node, "Localite", "nom")

# === Insertion des Activites ===
for act in g.subjects(RDF.type, ONTO.Activite):
    props = {
        "nom": str(g.value(act, ONTO.nom)),
        "type": str(g.value(act, ONTO.type)),
        "description": str(g.value(act, ONTO.description))
    }
    node = Node("Activite", **props)
    neo4j.merge(node, "Activite", "nom")

# === Insertion des SitesTouristiques ===
for site in g.subjects(RDF.type, ONTO.SiteTouristique):
    props = {
        "nom": str(g.value(site, ONTO.nom)),
        "description": str(g.value(site, ONTO.description)),
        "typeSite": str(g.value(site, ONTO.typeSite)),
        "statut": str(g.value(site, ONTO.statut)),
        "periodeRecommandee": str(g.value(site, ONTO.periodeRecommandee)),
        "accessibilite": str(g.value(site, ONTO.accessibilite))
    }
    site_node = Node("SiteTouristique", **props)
    neo4j.merge(site_node, "SiteTouristique", "nom")

    # relation situéDans
    loc = g.value(site, ONTO.situeDans)
    if loc:
        loc_nom = str(g.value(loc, ONTO.nom))
        loc_node = Node("Localite", nom=loc_nom)
        neo4j.merge(loc_node, "Localite", "nom")
        neo4j.merge(Relationship(site_node, "SITUE_DANS", loc_node))

    # relation proposeActivite
    for act in g.objects(site, ONTO.proposeActivite):
        act_nom = str(g.value(act, ONTO.nom))
        act_node = Node("Activite", nom=act_nom)
        neo4j.merge(act_node, "Activite", "nom")
        neo4j.merge(Relationship(site_node, "PROPOSE", act_node))

print("✅ Ontologie RDF importée dans Neo4j avec succès !")
