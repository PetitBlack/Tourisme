from fastapi import FastAPI
from py2neo import Graph
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "benh2000"

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
           l.nom AS localiteNom, l.coordonneesGPS AS coordonneesGPS
    """
    result = graph.run(query)
    return [record.data() for record in result]

@app.get("/sites/localite/{localite_nom}")
def get_sites_by_localite(localite_nom: str):
    query = """
    MATCH (s:SiteTouristique)-[:SITUE_DANS]->(l:Localite {nom: $localite_nom})
    RETURN s.nom AS nom, s.description AS description, s.typeSite AS typeSite
    """
    result = graph.run(query, localite_nom=localite_nom)
    return [record.data() for record in result]

@app.get("/activites")
def get_all_activites():
    query = """
    MATCH (a:Activite)
    RETURN a.nom AS nom, a.type AS type, a.description AS description
    """
    result = graph.run(query)
    return [record.data() for record in result]

@app.get("/localites")
def get_all_localites():
    query = """
    MATCH (l:Localite)
    RETURN l.nom AS nom, l.typeLocalite AS typeLocalite, l.coordonneesGPS AS coordonneesGPS
    """
    result = graph.run(query)
    return [record.data() for record in result]
