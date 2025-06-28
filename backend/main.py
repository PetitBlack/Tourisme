from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from py2neo import Graph

app = FastAPI()

# Configuration Neo4j
NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "benh2000"

graph = Graph(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

# Autoriser Angular (localhost:4200) à accéder à l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Récupérer toutes les localités (avec tous leurs attributs)
@app.get("/localites")
def get_localites():
    query = """
    MATCH (l:Localite)
    RETURN l.nom AS nom, l.typeLocalite AS typeLocalite, l.coordonneesGPS AS coordonneesGPS
    """
    result = graph.run(query)
    return [record.data() for record in result]

# Récupérer tous les sites touristiques avec tous leurs attributs et la localité liée
@app.get("/sites")
def get_sites():
    query = """
    MATCH (s:SiteTouristique)
    RETURN s.nom AS nom,
           s.description AS description,
           s.typeSite AS typeSite,
           s.statut AS statut,
           s.periodeRecommandee AS periodeRecommandee,
           s.accessibilite AS accessibilite
    LIMIT 100
    """
    result = graph.run(query)
    data = [record.data() for record in result]
    print("Sites récupérés sans relation:", data)
    return data


# Récupérer toutes les activités avec leurs attributs
@app.get("/activites")
def get_activites():
    query = """
    MATCH (a:Activite)
    RETURN a.nom AS nom, a.type AS type, a.description AS description
    """
    result = graph.run(query)
    return [record.data() for record in result]
