1. # CREATE LOCATION TYPES

POST /programs/{program_id}/location-types

Request: { "name": "District" }

Response: { "message": "Location type created successfully", "locationType": {
"id": 1, "programId": 1, "name": "District" } }

Create hierarchy (top to bottom):

- District (id: 1)
- SubCounty (id: 2)
- Parish (id: 3)
- Village (id: 4)
- Household (id: 5)

2. # GET LOCATION TYPES FOR A PROGRAM

GET /programs/{program_id}/location-types

Response: { "locationTypes": [ { "id": 1, "programId": 1, "name": "District" },
{ "id": 2, "programId": 1, "name": "SubCounty" }, { "id": 3, "programId": 1,
"name": "Parish" }, { "id": 4, "programId": 1, "name": "Village" }, { "id": 5,
"programId": 1, "name": "Household" } ] }

3. # CREATE LOCATIONS (NEW HIERARCHICAL SCHEMA)

A. Root Location (District): POST /sites/register { "programId": 1,
"locationTypeId": 1, "name": "Kampala", "isActive": true }

Response: { "message": "Site created successfully", "site": { "siteId": 100,
"programId": 1, "locationTypeId": 1, "name": "Kampala", "isActive": true,
"hasData": false, "District": "Kampala" } }

B. Child Location (SubCounty under District): POST /sites/register {
"programId": 1, "locationTypeId": 2, "parentId": 100, "name": "Rubaga",
"isActive": true }

Response: { "site": { "siteId": 101, "programId": 1, "locationTypeId": 2,
"parentId": 100, "name": "Rubaga", "isActive": true, "hasData": false,
"District": "Kampala", "SubCounty": "Rubaga" } }

C. Leaf Location (Household): POST /sites/register { "programId": 1,
"locationTypeId": 5, "parentId": 104, "name": "House-001", "isActive": true }

Response: { "site": { "siteId": 105, "programId": 1, "locationTypeId": 5,
"parentId": 104, "name": "House-001", "isActive": true, "hasData": false,
"District": "Kampala", "SubCounty": "Rubaga", "Parish": "Namirembe", "Village":
"Kasubi", "Household": "House-001" } }

4. # CREATE LOCATIONS (OLD FLAT SCHEMA - BACKWARD COMPATIBLE)

POST /sites/register { "programId": 1, "district": "Kampala", "subCounty":
"Rubaga", "parish": "Namirembe", "villageName": "Kasubi", "houseNumber": "001",
"healthCenter": "Rubaga HC", "isActive": true }

Response: { "site": { "siteId": 200, "programId": 1, "district": "Kampala",
"subCounty": "Rubaga", "parish": "Namirembe", "villageName": "Kasubi",
"houseNumber": "001", "healthCenter": "Rubaga HC", "isActive": true, "hasData":
false } }

5. # FETCH LOCATIONS LIST (NEW HIERARCHY SCHEMA)

A. All locations for a program: GET /sites?programId=1&limit=20&offset=0

B. Filter by hierarchy (using locationTypeKey/Value): GET
/sites?programId=1&locationTypeKey=District&locationTypeValue=Kampala

C. Get specific hierarchy level: GET
/sites?programId=1&locationTypeKey=SubCounty&locationTypeValue=Rubaga

Response: { "sites": [ { "siteId": 100, "programId": 1, "locationTypeId": 1,
"name": "Kampala", "isActive": true, "hasData": false, "District": "Kampala" },
{ "siteId": 101, "programId": 1, "locationTypeId": 2, "parentId": 100, "name":
"Rubaga", "isActive": true, "hasData": false, "District": "Kampala",
"SubCounty": "Rubaga" } ], "total": 2, "limit": 20, "offset": 0, "hasMore":
false }

# 5B. FETCH LOCATIONS LIST (OLD FLAT SCHEMA)

A. All locations for a program: GET /sites?programId=2&limit=20&offset=0

B. Filter by old schema fields: GET
/sites?programId=2&district=Kampala&subCounty=Rubaga

Response: { "sites": [ { "siteId": 200, "programId": 2, "district": "Kampala",
"subCounty": "Rubaga", "parish": "Namirembe", "villageName": "Kasubi",
"houseNumber": "001", "healthCenter": "Rubaga HC", "isActive": true, "hasData":
false } ], "total": 1, "limit": 20, "offset": 0, "hasMore": false }

6. # UGANDA PROGRAM (USES NEW HIERARCHY)

Setup:

1. Create program: POST /programs { "name": "Uganda Malaria", "country":
   "Uganda" }
2. Create location types (see section 1)
3. Create hierarchical locations (see section 3)

Query by hierarchy: GET
/sites?programId=1&locationTypeKey=District&locationTypeValue=Kampala

All locations inherit parent hierarchy in response.

7. # NON-UGANDA PROGRAM (CAN USE OLD SCHEMA)

Setup:

1. Create program: POST /programs { "name": "Kenya Study", "country": "Kenya" }
2. Use flat schema for sites (see section 4)

Query by old fields: GET /sites?programId=2&district=Nairobi&healthCenter=Kibera
HC

8. # GET SINGLE LOCATION DETAILS (NEW HIERARCHY)

GET /sites/105

Response: { "siteId": 105, "programId": 1, "locationTypeId": 5, "parentId": 104,
"name": "House-001", "isActive": true, "hasData": false, "District": "Kampala",
"SubCounty": "Rubaga", "Parish": "Namirembe", "Village": "Kasubi", "Household":
"House-001" }

# 8B. GET SINGLE LOCATION DETAILS (OLD SCHEMA)

GET /sites/200

Response: { "siteId": 200, "programId": 2, "district": "Kampala", "subCounty":
"Rubaga", "parish": "Namirembe", "villageName": "Kasubi", "houseNumber": "001",
"healthCenter": "Rubaga HC", "isActive": true }

9. # UPDATE LOCATION (NEW HIERARCHY)

PUT /sites/105 { "name": "House-001-Updated", "isActive": false }

Updates rebuild location_hierarchy cache automatically.

# 9B. UPDATE LOCATION (OLD SCHEMA)

PUT /sites/200 { "district": "Kampala Central", "healthCenter": "New HC" }

10. # KEY DIFFERENCES

OLD SCHEMA:

- Fixed fields: district, subCounty, parish, villageName, houseNumber,
  healthCenter
- Flat structure
- Uganda-specific naming

NEW SCHEMA:

- Dynamic location types per program
- Parent-child relationships (parentId, locationTypeId)
- location_hierarchy JSON cache (auto-built)
- Response includes dynamic keys like { "District": "Kampala", "SubCounty":
  "Rubaga" }
- Flexible for any country/hierarchy

BOTH schemas work simultaneously. Old sites stay flat, new sites use hierarchy.
