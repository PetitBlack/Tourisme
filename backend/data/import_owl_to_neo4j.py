from rdflib import Graph, Namespace, RDF
from py2neo import Graph as NeoGraph, Node, Relationship

# === Config ===
RDF_FILE = "tourisme_complet_avec_tous_individus.owl"  # Nom du fichier OWL
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
        "nom": str(g.value(loc, ONTO.nom)) or "",
        "region": str(g.value(loc, ONTO.region)) or "",
        "population": str(g.value(loc, ONTO.population)) or "",
        "coordonneesGPS": str(g.value(loc, ONTO.coordonneesGPS)) or "",
        "superficie": str(g.value(loc, ONTO.superficie)) or ""
    }
    node = Node("Localite", **props)
    neo4j.merge(node, "Localite", "nom")

# === Insertion des SitesTouristiques ===
for site in g.subjects(RDF.type, ONTO.SiteTouristique):
    props = {
        "nom": str(g.value(site, ONTO.nom)) or "",
        "description": str(g.value(site, ONTO.description)) or "",
        "typeSite": str(g.value(site, ONTO.typeSite)) or "",
        "photoUrl": str(g.value(site, ONTO.photoUrl)) or "",
        "coordonneesGPS": str(g.value(site, ONTO.coordonneesGPS)) or "",
        "accessibleMobiliteReduite": str(g.value(site, ONTO.accessibleMobiliteReduite)) or "",
        "dateDisponibilite": str(g.value(site, ONTO.dateDisponibilite)) or ""
    }
    site_node = Node("SiteTouristique", **props)
    neo4j.merge(site_node, "SiteTouristique", "nom")

    # Relation SITUE_DANS
    loc = g.value(site, ONTO.situeDans)
    if loc:
        loc_nom = str(g.value(loc, ONTO.nom)) or ""
        loc_node = Node("Localite", nom=loc_nom)
        neo4j.merge(loc_node, "Localite", "nom")
        neo4j.merge(Relationship(site_node, "SITUE_DANS", loc_node))

# === Insertion des Activites ===
for act in g.subjects(RDF.type, ONTO.Activite):
    props = {
        "nom": str(g.value(act, ONTO.nom)) or "",
        "type": str(g.value(act, ONTO.type)) or "",
        "description": str(g.value(act, ONTO.description)) or "",
        "dateHeure": str(g.value(act, ONTO.dateHeure)) or "",
        "frequence": str(g.value(act, ONTO.frequence)) or "",
        "lieu": str(g.value(act, ONTO.lieu)) or ""
    }
    act_node = Node("Activite", **props)
    neo4j.merge(act_node, "Activite", "nom")

    # Relation ASSOCIE_A (basée sur lieu)
    lieu_nom = props["lieu"]
    if lieu_nom:
        # Vérifier si lieu correspond à une Localite
        loc_node = neo4j.nodes.match("Localite", nom=lieu_nom).first()
        if loc_node:
            neo4j.merge(Relationship(act_node, "ASSOCIE_A", loc_node))
        else:
            # Vérifier si lieu correspond à un SiteTouristique
            site_node = neo4j.nodes.match("SiteTouristique", nom=lieu_nom).first()
            if site_node:
                neo4j.merge(Relationship(act_node, "ASSOCIE_A", site_node))

# === Insertion des CarteSpatiale ===
for carte in g.subjects(RDF.type, ONTO.CarteSpatiale):
    props = {
        "associeA": str(g.value(carte, ONTO.associeA)) or "",
        "echelle": str(g.value(carte, ONTO.echelle)) or "",
        "dimensions": str(g.value(carte, ONTO.dimensions)) or ""
    }
    carte_node = Node("CarteSpatiale", **props)
    neo4j.merge(carte_node, "CarteSpatiale", "associeA")

    # Relation ASSOCIE_A (vers SiteTouristique)
    site_nom = props["associeA"]
    if site_nom:
        site_node = Node("SiteTouristique", nom=site_nom)
        neo4j.merge(site_node, "SiteTouristique", "nom")
        neo4j.merge(Relationship(carte_node, "ASSOCIE_A", site_node))

print("✅ Ontologie RDF importée dans Neo4j avec succès !")