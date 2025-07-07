from rdflib import Graph, Namespace, RDF
from py2neo import Graph as NeoGraph, Node, Relationship

# === CONFIG ===
RDF_FILE = "tourisme_complet_avec_tous_individus.owl"
NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "benh2000"

# === CHARGER RDF ===
g = Graph()
g.parse(RDF_FILE, format="xml")

ONTO = Namespace("http://www.tourisme-burkina-ontologie.org/ontologie#")

# === CONNEXION NEO4J ===
neo4j = NeoGraph(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

# === INSERER Localite ===
for loc in g.subjects(RDF.type, ONTO.Localite):
    props = {
        "nom": str(g.value(loc, ONTO.nom)) or "",
        "region": str(g.value(loc, ONTO.region)) or "",
        "population": str(g.value(loc, ONTO.population)) or "",
        "coordonneeGPS": str(g.value(loc, ONTO.coordonneeGPS)) or "",
        "superficie": str(g.value(loc, ONTO.superficie)) or ""
    }
    node = Node("Localite", **props)
    neo4j.merge(node, "Localite", "nom")

# === INSERER SiteTouristique ===
for site in g.subjects(RDF.type, ONTO.SiteTouristique):
    props = {
        "nom": str(g.value(site, ONTO.nom)) or "",
        "description": str(g.value(site, ONTO.description)) or "",
        "type": str(g.value(site, ONTO.type)) or "",
        "photo": str(g.value(site, ONTO.photo)) or "",
        "coordonneeGPS": str(g.value(site, ONTO.coordonneeGPS)) or "",
        "accessibilite": str(g.value(site, ONTO.accessibilite)) or "",
        "periodeRecommande": str(g.value(site, ONTO.periodeRecommande)) or ""
    }
    site_node = Node("SiteTouristique", **props)
    neo4j.merge(site_node, "SiteTouristique", "nom")

    # Relation estLocaliseDans vers Localite
    loc = g.value(site, ONTO.estLocaliseDans)
    if loc:
        loc_nom = str(g.value(loc, ONTO.nom)) or ""
        loc_node = Node("Localite", nom=loc_nom)
        neo4j.merge(loc_node, "Localite", "nom")
        neo4j.merge(Relationship(site_node, "EST_LOCALISE_DANS", loc_node))

# === INSERER Activite ===
for act in g.subjects(RDF.type, ONTO.Activite):
    props = {
        "nom": str(g.value(act, ONTO.nom)) or "",
        "type": str(g.value(act, ONTO.type)) or "",
        "description": str(g.value(act, ONTO.description)) or "",
        "frequence": str(g.value(act, ONTO.frequence)) or "",
        "lieu": str(g.value(act, ONTO.lieu)) or ""
    }
    act_node = Node("Activite", **props)
    neo4j.merge(act_node, "Activite", "nom")

    # Relation propose vers SiteTouristique
    site = g.value(act, ONTO.propose)
    if site:
        site_nom = str(g.value(site, ONTO.nom)) or ""
        site_node = Node("SiteTouristique", nom=site_nom)
        neo4j.merge(site_node, "SiteTouristique", "nom")
        neo4j.merge(Relationship(act_node, "PROPOSE", site_node))

    # Relation estProposeeA vers Localite
    loc = g.value(act, ONTO.estProposeeA)
    if loc:
        loc_nom = str(g.value(loc, ONTO.nom)) or ""
        loc_node = Node("Localite", nom=loc_nom)
        neo4j.merge(loc_node, "Localite", "nom")
        neo4j.merge(Relationship(act_node, "EST_PROPOSEE_A", loc_node))

# === INSERER CarteSpatiale ===
for carte in g.subjects(RDF.type, ONTO.CarteSpatiale):
    props = {
        "nom": str(g.value(carte, ONTO.nom)) or "",
        "echelle": str(g.value(carte, ONTO.echelle)) or "",
        "format": str(g.value(carte, ONTO.format)) or ""
    }
    carte_node = Node("CarteSpatiale", **props)
    neo4j.merge(carte_node, "CarteSpatiale", "nom")

    # Relation represente vers Localite ou SiteTouristique
    represente = g.value(carte, ONTO.represente)
    if represente:
        represente_nom = str(g.value(represente, ONTO.nom)) or ""
        # On vérifie dans Localite
        loc_node = neo4j.nodes.match("Localite", nom=represente_nom).first()
        if loc_node:
            neo4j.merge(Relationship(carte_node, "REPRESENTE", loc_node))
        else:
            site_node = neo4j.nodes.match("SiteTouristique", nom=represente_nom).first()
            if site_node:
                neo4j.merge(Relationship(carte_node, "REPRESENTE", site_node))

print("✅ Import terminé et à jour avec l'ontologie !")
