from fastapi import FastAPI
from py2neo import Graph
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# === Connexion Neo4j ===
NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "benh2000"

graph = Graph(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

# === CORS pour Angular ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Endpoints ===

@app.get("/sites")
def get_all_sites():
    query = """
    MATCH (s:SiteTouristique)
    OPTIONAL MATCH (s)-[:EST_LOCALISE_DANS]->(l:Localite)
    RETURN 
        s.nom AS nom,
        s.description AS description,
        s.type AS type,
        s.photo AS photo,
        s.coordonneeGPS AS coordonneeGPS,
        s.accessibilite AS accessibilite,
        s.periodeRecommande AS periodeRecommande,
        l.nom AS localiteNom,
        l.coordonneeGPS AS localiteCoordonneeGPS
    """
    result = graph.run(query)
    return [record.data() for record in result]

@app.get("/activites/site/{site_nom}")
def get_activites_by_site(site_nom: str):
    query = """
    MATCH (a:Activite)-[:PROPOSE]->(s:SiteTouristique {nom: $site_nom})
    RETURN 
        a.nom AS nom,
        a.type AS type,
        a.description AS description,
        a.frequence AS frequence,
        a.lieu AS lieu
    """
    result = graph.run(query, site_nom=site_nom)
    return [record.data() for record in result]


@app.get("/sites/localite/{localite_nom}")
def get_sites_by_localite(localite_nom: str):
    query = """
    MATCH (s:SiteTouristique)-[:EST_LOCALISE_DANS]->(l:Localite {nom: $localite_nom})
    RETURN 
        s.nom AS nom,
        s.description AS description,
        s.type AS type,
        s.photo AS photo,
        s.coordonneeGPS AS coordonneeGPS,
        s.accessibilite AS accessibilite,
        s.periodeRecommande AS periodeRecommande
    """
    result = graph.run(query, localite_nom=localite_nom)
    return [record.data() for record in result]


@app.get("/activites")
def get_all_activites():
    query = """
    MATCH (a:Activite)
    OPTIONAL MATCH (a)-[:PROPOSE]->(s:SiteTouristique)
    OPTIONAL MATCH (a)-[:EST_PROPOSEE_A]->(l:Localite)
    RETURN 
        a.nom AS nom,
        a.type AS type,
        a.description AS description,
        a.frequence AS frequence,
        a.lieu AS lieu,
        s.nom AS siteNom,
        l.nom AS localiteNom
    """
    result = graph.run(query)
    return [record.data() for record in result]

@app.get("/activites/site/{site_nom}")
def get_activites_by_site(site_nom: str):
    query = """
    MATCH (a:Activite)-[:PROPOSE]->(s:SiteTouristique {nom: $site_nom})
    RETURN
        a.nom AS nom,
        a.type AS type,
        a.description AS description,
        a.frequence AS frequence,
        a.lieu AS lieu,
        s.nom AS siteNom
    """
    result = graph.run(query, site_nom=site_nom)
    return [record.data() for record in result]


@app.get("/activites/lieu/{lieu_nom}")
def get_activites_by_lieu(lieu_nom: str):
    query = """
    MATCH (a:Activite {lieu: $lieu_nom})
    RETURN 
        a.nom AS nom,
        a.type AS type,
        a.description AS description,
        a.frequence AS frequence,
        a.lieu AS lieu
    """
    result = graph.run(query, lieu_nom=lieu_nom)
    return [record.data() for record in result]


@app.get("/localites")
def get_all_localites():
    query = """
    MATCH (l:Localite)
    RETURN 
        l.nom AS nom,
        l.region AS region,
        l.population AS population,
        l.coordonneeGPS AS coordonneeGPS,
        l.superficie AS superficie
    """
    result = graph.run(query)
    return [record.data() for record in result]


@app.get("/cartes")
def get_all_cartes():
    query = """
    MATCH (c:CarteSpatiale)
    OPTIONAL MATCH (c)-[:REPRESENTE]->(n)
    RETURN 
        c.nom AS nom,
        c.echelle AS echelle,
        c.format AS format,
        n.nom AS representeNom,
        labels(n) AS representeType
    """
    result = graph.run(query)
    return [record.data() for record in result]
