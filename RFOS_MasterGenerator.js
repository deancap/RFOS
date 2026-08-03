/**
 * ==========================================================
 * RFOS MASTER GENERATOR
 * Rising Fiber Operations System (RFOS)
 * ==========================================================
 * Generates:
 * • OLT / POI Master (06_OLT_POI)
 * • Cluster Master (07_Clusters)
 *
 * Site generation is handled by RFOS_SiteGenerator.gs.
 * Simulation is handled by RFOS_Simulator.gs.
 *
 * Depends on RFOS_Config.gs for:
 *   CONFIG.SHEETS, PROJECT_COLUMNS, PROJECT_REGION_COLUMNS,
 *   OLT_COLUMNS, CLUSTER_COLUMNS, BARANGAY_COLUMNS,
 *   RFOS_CONFIG, REGION_CODES
 *
 * Depends on RFOS_Utilities.gs for:
 *   createID(), getSheet(), clearSheet(), writeRows(),
 *   loadProjects(), loadProjectRegions(), loadBarangays(),
 *   loadOLTs()
 *
 * None of the above are redefined in this file.
 * ==========================================================
 */


/* ==========================================================
 * MAIN
 * ==========================================================
 * Loads Barangays exactly once for the whole run and hands the
 * same array to both generators, so 11_Barangays is read a
 * single time no matter how many Projects, Regions, OLTs, or
 * Clusters this produces.
 */

function generateMasterData() {

  validateMasterData();

  const barangays = loadBarangays();

  generateOLTs(barangays);

  generateClusters(barangays);

  notify(
    "RFOS Master Data generated successfully."
  );

}


/* ==========================================================
 * NOTIFY
 * ==========================================================
 * Context-safe replacement for SpreadsheetApp.getUi().alert().
 * getUi() throws when there is no UI context (custom menu vs.
 * Apps Script Editor, CLASP, a time-driven trigger, or any
 * future automation) - this falls back to the script log
 * instead of crashing the run.
 * RFOS_Utilities.gs has no existing notification helper, so
 * this is defined here rather than duplicating one.
 */

function notify(message) {

  try {

    SpreadsheetApp.getUi().alert(message);

  } catch (e) {

    Logger.log(message);

  }

}


/* ==========================================================
 * VALIDATE REQUIRED SHEETS
 * ==========================================================
 */

function validateMasterData() {

  const requiredSheets = [

    CONFIG.SHEETS.PROJECTS,
    CONFIG.SHEETS.PROJECT_REGIONS,
    CONFIG.SHEETS.OLT,
    CONFIG.SHEETS.CLUSTERS,
    CONFIG.SHEETS.SITES,
    CONFIG.SHEETS.BARANGAYS

  ];

  requiredSheets.forEach(function(name){

    getSheet(name);

  });

}


/* ==========================================================
 * OLT ID
 * ==========================================================
 */

function createOLTID(counter) {

  return createID("OLT", counter, 3);

}


/* ==========================================================
 * CLUSTER ID
 * ==========================================================
 */

function createClusterID(counter) {

  return createID("CLU", counter, 4);

}


/* ==========================================================
 * OLT CODE
 * ==========================================================
 * `sequence` disambiguates multiple OLTs that legitimately land
 * in the same Region+Municipality - e.g. two different Projects
 * both building out the same town each get their own OLT there.
 * Callers must track and pass a per-(region,municipality)
 * counter - see generateOLTs().
 */

function createOLTCode(region, municipality, sequence) {

  const regionCode = REGION_CODES[region] || "UNK";

  const muniCode = municipality
    .replace(/[^A-Za-z]/g, "")
    .substring(0,3)
    .toUpperCase();

  return regionCode +
    "-" +
    muniCode +
    "-OLT-" +
    String(sequence).padStart(2, "0");

}


/* ==========================================================
 * CLUSTER CODE
 * ==========================================================
 */

function createClusterCode(oltCode, number){

  return oltCode +
    "-CL" +
    String(number).padStart(2,"0");

}


/* ==========================================================
 * PROJECT LOOKUP
 * ==========================================================
 * Keyed by Project ID so generateOLTs() can join
 * 04_Project_Regions -> 03_Projects without re-scanning the
 * Projects array for every join-table row.
 */

function buildProjectIndex(projects) {

  const index = {};

  projects.forEach(function(project){

    index[project[PROJECT_COLUMNS.PROJECT_ID]] = project;

  });

  return index;

}


/* ==========================================================
 * UNIQUE MUNICIPALITIES (cache-aware)
 * ==========================================================
 * Derives the distinct municipalities for a Region from an
 * already-loaded Barangays array, so callers looping over many
 * regions don't re-read 11_Barangays each time.
 */

function deriveMunicipalities(barangays, region){

  const municipalities = {};

  barangays.forEach(row=>{

    if(row[BARANGAY_COLUMNS.REGION]!==region) return;

    const municipality=row[BARANGAY_COLUMNS.MUNICIPALITY];

    if(!municipalities[municipality]){

      municipalities[municipality]={

        name: municipality,

        province: row[BARANGAY_COLUMNS.PROVINCE]

      };

    }

  });

  return Object.values(municipalities);

}


/* ==========================================================
 * UNIQUE MUNICIPALITIES (public)
 * ==========================================================
 * Convenience wrapper that loads 11_Barangays itself, for
 * standalone/manual calls. Prefer deriveMunicipalities() when a
 * Barangays array is already loaded, to avoid a redundant read.
 */

function getMunicipalities(region){

  return deriveMunicipalities(loadBarangays(), region);

}


/* ==========================================================
 * BARANGAYS (cache-aware)
 * ==========================================================
 * Filters an already-loaded Barangays array. RFOS_SiteGenerator.gs
 * calls this directly with its own loaded Barangays array, so this
 * signature and behavior must not change.
 */

function filterBarangays(barangays, region, province, municipality){

  return barangays.filter(row=>

    row[BARANGAY_COLUMNS.REGION]===region &&

    row[BARANGAY_COLUMNS.PROVINCE]===province &&

    row[BARANGAY_COLUMNS.MUNICIPALITY]===municipality

  );

}


/* ==========================================================
 * BARANGAYS (public)
 * ==========================================================
 * Convenience wrapper that loads 11_Barangays itself, for
 * standalone/manual calls. Prefer filterBarangays() when a
 * Barangays array is already loaded, to avoid a redundant read.
 */

function getBarangays(region,province,municipality){

  return filterBarangays(loadBarangays(), region, province, municipality);

}


/* ==========================================================
 * GENERATE OLT MASTER
 * ==========================================================
 * Iterates 04_Project_Regions (never 03_Projects, which carries
 * no Region column) so every (Project x Region x Municipality)
 * combination gets its own OLT. `barangays`, if supplied, is
 * reused instead of triggering another 11_Barangays read.
 */

function generateOLTs(barangays){

  clearSheet(CONFIG.SHEETS.OLT);

  const projects = loadProjects();

  const projectRegions = loadProjectRegions();

  barangays = barangays || loadBarangays();

  const projectIndex = buildProjectIndex(projects);

  const rows = [];

  let oltCounter = 1;

  const sequenceByKey = {};

  projectRegions.forEach(function(projectRegion){

    const projectID = projectRegion[PROJECT_REGION_COLUMNS.PROJECT_ID];

    const region = projectRegion[PROJECT_REGION_COLUMNS.REGION];

    const project = projectIndex[projectID];

    if(!project){

      log(
        "generateOLTs: skipping orphaned 04_Project_Regions row - " +
        "Project ID '" + projectID + "' not found in 03_Projects."
      );

      return;

    }

    const municipalities = deriveMunicipalities(barangays, region);

    municipalities.forEach(municipality=>{

      const key = region + "|" + municipality.name;

      sequenceByKey[key] = (sequenceByKey[key] || 0) + 1;

      rows.push([

        createOLTID(oltCounter),

        createOLTCode(
          region,
          municipality.name,
          sequenceByKey[key]
        ),

        municipality.name + " OLT",

        project[PROJECT_COLUMNS.PROJECT_ID],

        project[PROJECT_COLUMNS.PROJECT_NAME],

        project[PROJECT_COLUMNS.CLIENT],

        region,

        municipality.province,

        municipality.name,

        RFOS_CONFIG.DEFAULT_OLT_PORT_CAPACITY,

        RFOS_CONFIG.DEFAULT_FIBER_CAPACITY,

        RFOS_CONFIG.DEFAULT_OLT_STATUS,

        "",

        "",

        new Date(RFOS_CONFIG.START_DATE),

        ""

      ]);

      oltCounter++;

    });

  });

  writeRows(CONFIG.SHEETS.OLT,rows);

}


/* ==========================================================
 * GENERATE CLUSTER MASTER
 * ==========================================================
 * `barangays`, if supplied, is reused instead of triggering
 * another 11_Barangays read.
 */

function generateClusters(barangays){

  clearSheet(CONFIG.SHEETS.CLUSTERS);

  const olts=loadOLTs();

  barangays = barangays || loadBarangays();

  const rows=[];

  let clusterCounter=1;

  olts.forEach(olt=>{

    const clusterBarangays=filterBarangays(

      barangays,

      olt[OLT_COLUMNS.REGION],

      olt[OLT_COLUMNS.PROVINCE],

      olt[OLT_COLUMNS.MUNICIPALITY]

    );

    const clusterCount=Math.ceil(

      clusterBarangays.length/

      RFOS_CONFIG.DEFAULT_SITES_PER_CLUSTER

    );

    for(let i=1;i<=clusterCount;i++){

      const start=(i-1)*RFOS_CONFIG.DEFAULT_SITES_PER_CLUSTER;

      const end=start+

      RFOS_CONFIG.DEFAULT_SITES_PER_CLUSTER;

      const plannedSites=

      clusterBarangays.slice(start,end).length;

      rows.push([

        createClusterID(clusterCounter),

        createClusterCode(

          olt[OLT_COLUMNS.OLT_CODE],

          i

        ),

        olt[OLT_COLUMNS.MUNICIPALITY] +

        " Cluster " +

        i,

        olt[OLT_COLUMNS.OLT_ID],

        olt[OLT_COLUMNS.OLT_CODE],

        olt[OLT_COLUMNS.PROJECT_ID],

        olt[OLT_COLUMNS.PROJECT_NAME],

        olt[OLT_COLUMNS.CLIENT],

        olt[OLT_COLUMNS.REGION],

        olt[OLT_COLUMNS.PROVINCE],

        olt[OLT_COLUMNS.MUNICIPALITY],

        plannedSites,

        RFOS_CONFIG.DEFAULT_CLUSTER_STATUS,

        ""

      ]);

      clusterCounter++;

    }

  });

  writeRows(CONFIG.SHEETS.CLUSTERS,rows);

}