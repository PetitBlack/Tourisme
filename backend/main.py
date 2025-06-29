from fastapi import FastAPI
from py2neo import Graph
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"  # À ajuster si nécessaire
NEO4J_PASSWORD = "benh2000"  # À ajuster si nécessaire

graph = Graph(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/sites")
def get_all_sites():
    query = """
    MATCH (s:SiteTouristique)
    OPTIONAL MATCH (s)-[:SITUE_DANS]->(l:Localite)
    RETURN s.nom AS nom, s.description AS description, s.typeSite AS typeSite,
           s.photoUrl AS photoUrl, s.coordonneesGPS AS coordonneesGPS,
           s.accessibleMobiliteReduite AS accessibleMobiliteReduite,
           s.dateDisponibilite AS dateDisponibilite,
           l.nom AS localiteNom, l.coordonneesGPS AS localiteCoordonneesGPS
    """
    result = graph.run(query)
    return [record.data() for record in result]

@app.get("/sites/localite/{localite_nom}")
def get_sites_by_localite(localite_nom: str):
    query = """
    MATCH (s:SiteTouristique)-[:SITUE_DANS]->(l:Localite {nom: $localite_nom})
    RETURN s.nom AS nom, s.description AS description, s.typeSite AS typeSite,
           s.photoUrl AS photoUrl, s.coordonneesGPS AS coordonneesGPS,
           s.accessibleMobiliteReduite AS accessibleMobiliteReduite,
           s.dateDisponibilite AS dateDisponibilite
    """
    result = graph.run(query, localite_nom=localite_nom)
    return [record.data() for record in result]

@app.get("/activites")
def get_all_activites():
    query = """
    MATCH (a:Activite)
    RETURN a.nom AS nom, a.type AS type, a.description AS description,
           a.dateHeure AS dateHeure, a.frequence AS frequence, a.lieu AS lieu
    """
    result = graph.run(query)
    return [record.data() for record in result]

@app.get("/activites/lieu/{lieu_nom}")
def get_activites_by_lieu(lieu_nom: str):
    query = """
    MATCH (a:Activite {lieu: $lieu_nom})
    RETURN a.nom AS nom, a.type AS type, a.description AS description,
           a.dateHeure AS dateHeure, a.frequence AS frequence, a.lieu AS lieu
    """
    result = graph.run(query, lieu_nom=lieu_nom)
    return [record.data() for record in result]

@app.get("/localites")
def get_all_localites():
    query = """
    MATCH (l:Localite)
    RETURN l.nom AS nom, l.region AS region, l.population AS population,
           l.coordonneesGPS AS coordonneesGPS, l.superficie AS superficie
    """
    result = graph.run(query)
    return [record.data() for record in result]

@app.get("/cartes")
def get_all_cartes():
    query = """
    MATCH (c:CarteSpatiale)
    RETURN c.associeA AS associeA, c.echelle AS echelle, c.dimensions AS dimensions
    """
    result = graph.run(query)
    return [record.data() for record in result]