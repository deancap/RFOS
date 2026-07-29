/**
 * ==========================================================
 * RFOS SITE GENERATOR
 * Rising Fiber Operations System (RFOS)
 * Version 2.0
 * ==========================================================
 * Generates the Site Master (08_Sites)
 * ==========================================================
 */


/* ==========================================================
 * Generate Site Master
 * ==========================================================
 */
function generateSites() {

  clearSheet(CONFIG.SHEETS.SITES);

  const clusters = loadClusters();

  let rows = [];
  let siteCounter = 1;

  clusters.forEach(cluster => {

    const region = cluster[CLUSTER_COLUMNS.REGION];
    const province = cluster[CLUSTER_COLUMNS.PROVINCE];
    const municipality = cluster[CLUSTER_COLUMNS.MUNICIPALITY];

    const barangays = getBarangays(
      region,
      province,
      municipality
    );

    let siteNo = 1;

    barangays.forEach(barangay => {

      rows.push(

        createSiteRow(
          siteCounter++,
          siteNo++,
          cluster,
          barangay
        )

      );

    });

  });

  writeRows(CONFIG.SHEETS.SITES, rows);

}


/* ==========================================================
 * Create Site Row
 * ==========================================================
 */
function createSiteRow(globalCounter, siteNo, cluster, barangay) {

  const clusterID = cluster[CLUSTER_COLUMNS.CLUSTER_ID];
  const clusterCode = cluster[CLUSTER_COLUMNS.CLUSTER_CODE];
  const oltID = cluster[CLUSTER_COLUMNS.OLT_ID];
  const oltCode = cluster[CLUSTER_COLUMNS.OLT_CODE];
  const projectID = cluster[CLUSTER_COLUMNS.PROJECT_ID];
  const client = cluster[CLUSTER_COLUMNS.CLIENT];
  const region = cluster[CLUSTER_COLUMNS.REGION];
  const province = cluster[CLUSTER_COLUMNS.PROVINCE];
  const municipality = cluster[CLUSTER_COLUMNS.MUNICIPALITY];

  const assignments = assignSiteTeam(region);

  return [

    createSiteID(globalCounter),

    createSiteCode(clusterCode, siteNo),

    barangay[BARANGAY_COLUMNS.BARANGAY] + " Site",

    clusterID,

    clusterCode,

    oltID,

    oltCode,

    projectID,

    client,

    region,

    province,

    municipality,

    barangay[BARANGAY_COLUMNS.BARANGAY],

    Number(barangay[BARANGAY_COLUMNS.LATITUDE]) +
      randomCoordinateOffset(),

    Number(barangay[BARANGAY_COLUMNS.LONGITUDE]) +
      randomCoordinateOffset(),

    createPoleCount(),

    createFiberLength(),

    createFiberCable(),

    createDistributionType(),

    RFOS_CONFIG.DEFAULT_SITE_STATUS,

    createPriority(),

    assignments.surveyEngineer,

    assignments.hldEngineer,

    assignments.lldEngineer,

    assignments.qaEngineer,

    assignments.documentationEngineer,

    assignments.rtaEngineer,

    ""

  ];

}


/* ==========================================================
 * Site ID
 * ==========================================================
 */
function createSiteID(counter) {

  return createID("SIT", counter, 5);

}


/* ==========================================================
 * Site Code
 * ==========================================================
 */
function createSiteCode(clusterCode, siteNo) {

  return (
    clusterCode +
    "-S" +
    String(siteNo).padStart(3, "0")
  );

}


/* ==========================================================
 * Pole Count
 * ==========================================================
 */
function createPoleCount() {

  return randomInt(

    RFOS_CONFIG.DEFAULT_POLE_COUNT - 4,

    RFOS_CONFIG.DEFAULT_POLE_COUNT + 8

  );

}


/* ==========================================================
 * Fiber Length
 * ==========================================================
 */
function createFiberLength() {

  return randomInt(

    RFOS_CONFIG.DEFAULT_FIBER_LENGTH - 150,

    RFOS_CONFIG.DEFAULT_FIBER_LENGTH + 250

  );

}


/* ==========================================================
 * Fiber Cable
 * ==========================================================
 */
function createFiberCable() {

  return randomItem(FIBER_CAPACITIES);

}


/* ==========================================================
 * Distribution Type
 * ==========================================================
 */
function createDistributionType() {

  return randomItem(DISTRIBUTION_TYPES);

}


/* ==========================================================
 * Priority
 * ==========================================================
 */
function createPriority() {

  return randomItem(SITE_PRIORITIES);

}