/**
 * ==========================================================
 * RFOS MASTER GENERATOR
 * Rising Fiber Operations System (RFOS)
 * Version 1.0
 * ==========================================================
 * Generates:
 * • OLT / POI Master
 * • Cluster Master
 *
 * Site generation is handled by RFOS_SiteGenerator.gs
 * ==========================================================
 */


/* ==========================================================
 * MAIN
 * ==========================================================
 */

function generateMasterData() {

  validateMasterData();

  generateOLTs();

  generateClusters();

  SpreadsheetApp.getUi().alert(
    "RFOS Master Data generated successfully."
  );

}


/* ==========================================================
 * VALIDATE REQUIRED SHEETS
 * ==========================================================
 */

function validateMasterData() {

  const requiredSheets = [

    CONFIG.SHEETS.PROJECTS,
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
 * GENERIC ID CREATOR
 * ==========================================================
 */

function createID(prefix, counter, digits) {

  return prefix + String(counter).padStart(digits, "0");

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
 */

function createOLTCode(region, municipality) {

  const regionCode = REGION_CODES[region] || "UNK";

  const muniCode = municipality
    .replace(/[^A-Za-z]/g, "")
    .substring(0,3)
    .toUpperCase();

  return regionCode +
    "-" +
    muniCode +
    "-OLT-01";

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
 * UNIQUE MUNICIPALITIES
 * ==========================================================
 */

function getMunicipalities(region){

  const barangays = loadBarangays();

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
 * BARANGAYS
 * ==========================================================
 */

function getBarangays(region,province,municipality){

  return loadBarangays().filter(row=>

    row[BARANGAY_COLUMNS.REGION]===region &&

    row[BARANGAY_COLUMNS.PROVINCE]===province &&

    row[BARANGAY_COLUMNS.MUNICIPALITY]===municipality

  );

}


/* ==========================================================
 * GENERATE OLT MASTER
 * ==========================================================
 */

function generateOLTs(){

  clearSheet(CONFIG.SHEETS.OLT);

  const projects=loadProjects();

  const rows=[];

  let oltCounter=1;

  projects.forEach(project=>{

    const municipalities=getMunicipalities(

      project[PROJECT_COLUMNS.REGION]

    );

    municipalities.forEach(municipality=>{

      rows.push([

        createOLTID(oltCounter),

        createOLTCode(

          project[PROJECT_COLUMNS.REGION],

          municipality.name

        ),

        municipality.name + " OLT",

        project[PROJECT_COLUMNS.PROJECT_ID],

        project[PROJECT_COLUMNS.PROJECT_NAME],

        project[PROJECT_COLUMNS.CLIENT],

        project[PROJECT_COLUMNS.REGION],

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
 */

function generateClusters(){

  clearSheet(CONFIG.SHEETS.CLUSTERS);

  const olts=loadOLTs();

  const rows=[];

  let clusterCounter=1;

  olts.forEach(olt=>{

    const barangays=getBarangays(

      olt[OLT_COLUMNS.REGION],

      olt[OLT_COLUMNS.PROVINCE],

      olt[OLT_COLUMNS.MUNICIPALITY]

    );

    const clusterCount=Math.ceil(

      barangays.length/

      RFOS_CONFIG.DEFAULT_SITES_PER_CLUSTER

    );

    for(let i=1;i<=clusterCount;i++){

      const start=(i-1)*RFOS_CONFIG.DEFAULT_SITES_PER_CLUSTER;

      const end=start+

      RFOS_CONFIG.DEFAULT_SITES_PER_CLUSTER;

      const plannedSites=

      barangays.slice(start,end).length;

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