/**
 * ==========================================================
 * RFOS SITE GENERATOR
 * Rising Fiber Operations System (RFOS)
 * Version 2.0
 * ==========================================================
 * Generates the Site Master (08_Sites)
 *
 * Input:  06_OLT_POI, 07_Clusters, 11_Barangays, 05_Employees
 * Output: 08_Sites
 *
 * Rules:
 * • One Site = One Barangay.
 * • Every Site is assigned to exactly one Cluster.
 * • Survey / HLD / LLD / QA / Documentation / RTA engineers are
 *   assigned via RFOS_AssignmentEngine.gs.
 *
 * ----------------------------------------------------------
 * CHANGE LOG (v1.0 -> v2.0)
 * ----------------------------------------------------------
 * • FIXED: when a municipality needs more than one Cluster
 *   (RFOS_CONFIG.DEFAULT_SITES_PER_CLUSTER exceeded), the old
 *   generateSites() called getBarangays(region, province,
 *   municipality) once per Cluster and gave EVERY Cluster in
 *   that municipality the full barangay list. That duplicated
 *   the same Barangay into a Site under more than one Cluster,
 *   which breaks both "One Site = One Barangay" and "every
 *   Site belongs to exactly one Cluster". Sites are now built
 *   by partitioning each municipality's barangays across its
 *   Clusters in RFOS_CONFIG.DEFAULT_SITES_PER_CLUSTER-sized
 *   chunks - the same chunking RFOS_MasterGenerator.gs already
 *   uses to compute each Cluster's Planned Sites count - so
 *   generation stays consistent with what MasterGenerator
 *   promised and every barangay produces exactly one Site.
 * • CHANGED: 11_Barangays and 05_Employees are now each loaded
 *   once per generateSites() run and reused, instead of
 *   05_Employees being re-read on every single Site (via
 *   assignSiteTeam(region), which always called
 *   loadEmployees() internally) and 11_Barangays being re-read
 *   once per Cluster.
 * • CHANGED: engineer assignment now calls the six individual
 *   assign*Engineer(region, employees) functions from
 *   RFOS_AssignmentEngine.gs directly with the cached
 *   Employees array, instead of assignSiteTeam(region), which
 *   forces its own internal reload. RFOS_AssignmentEngine.gs
 *   itself is unchanged.
 * ==========================================================
 */


/* ==========================================================
 * Validate Required Sheets
 * ==========================================================
 * Matches the validation style used by RFOS_MasterGenerator.gs.
 */
function validateSiteGeneration() {

  [
    CONFIG.SHEETS.EMPLOYEES,
    CONFIG.SHEETS.CLUSTERS,
    CONFIG.SHEETS.BARANGAYS,
    CONFIG.SHEETS.SITES
  ].forEach(getSheet);

}


/* ==========================================================
 * Generate Site Master
 * ==========================================================
 */
function generateSites() {

  validateSiteGeneration();

  clearSheet(CONFIG.SHEETS.SITES);

  const clusters = loadClusters();

  const barangays = loadBarangays();

  const employees = loadEmployees();

  const clusterGroups = groupClustersByOLT(clusters);

  const rows = [];

  let siteCounter = 1;

  Object.keys(clusterGroups).forEach(key => {

    const group = clusterGroups[key];

    const region = group[0][CLUSTER_COLUMNS.REGION];
    const province = group[0][CLUSTER_COLUMNS.PROVINCE];
    const municipality = group[0][CLUSTER_COLUMNS.MUNICIPALITY];

    const municipalityBarangays = filterBarangays(

      barangays,
      region,
      province,
      municipality

    );

    group.forEach((cluster, clusterIndex) => {

      const start =
        clusterIndex * RFOS_CONFIG.DEFAULT_SITES_PER_CLUSTER;

      const end =
        start + RFOS_CONFIG.DEFAULT_SITES_PER_CLUSTER;

      const clusterBarangays =
        municipalityBarangays.slice(start, end);

      let siteNo = 1;

      clusterBarangays.forEach(barangay => {

        rows.push(

          createSiteRow(
            siteCounter++,
            siteNo++,
            cluster,
            barangay,
            employees
          )

        );

      });

    });

  });

  writeRows(CONFIG.SHEETS.SITES, rows);

}


/* ==========================================================
 * Group Clusters By OLT
 * ==========================================================
 * RFOS_MasterGenerator.gs's generateClusters() computes each
 * Cluster's barangay chunk per-OLT, independently, starting
 * from index 0 of that OLT's municipality every time - it has
 * no idea whether another OLT (e.g. a different project
 * building out the same municipality) exists. Grouping by
 * OLT_ID here mirrors that exactly, regardless of how many
 * different projects happen to touch the same municipality,
 * so two projects sharing a municipality each get their own
 * full barangay range instead of splitting one range between
 * them.
 * Preserves array order, which matches creation order
 * (1..clusterCount per OLT) since generateClusters() pushed
 * them in that order.
 */
function groupClustersByOLT(clusters) {

  const groups = {};

  clusters.forEach(cluster => {

    const key = [
      cluster[CLUSTER_COLUMNS.OLT_ID],
      cluster[CLUSTER_COLUMNS.REGION],
      cluster[CLUSTER_COLUMNS.PROVINCE],
      cluster[CLUSTER_COLUMNS.MUNICIPALITY]
    ].join("|");

    if (!groups[key]) {

      groups[key] = [];

    }

    groups[key].push(cluster);

  });

  return groups;

}


/* ==========================================================
 * Create Site Row
 * ==========================================================
 */
function createSiteRow(globalCounter, siteNo, cluster, barangay, employees) {

  const clusterID = cluster[CLUSTER_COLUMNS.CLUSTER_ID];
  const clusterCode = cluster[CLUSTER_COLUMNS.CLUSTER_CODE];
  const oltID = cluster[CLUSTER_COLUMNS.OLT_ID];
  const oltCode = cluster[CLUSTER_COLUMNS.OLT_CODE];
  const projectID = cluster[CLUSTER_COLUMNS.PROJECT_ID];
  const client = cluster[CLUSTER_COLUMNS.CLIENT];
  const region = cluster[CLUSTER_COLUMNS.REGION];
  const province = cluster[CLUSTER_COLUMNS.PROVINCE];
  const municipality = cluster[CLUSTER_COLUMNS.MUNICIPALITY];

  const assignments = buildSiteTeam(region, employees);

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
 * Build Site Team
 * ==========================================================
 * Same shape as RFOS_AssignmentEngine.gs's assignSiteTeam(),
 * but takes an already-loaded Employees array instead of
 * calling loadEmployees() itself - assignSiteTeam() reloads
 * 05_Employees on every call, which is fine called once, but
 * generateSites() calls this once per Site.
 */
function buildSiteTeam(region, employees) {

  return {

    surveyEngineer: assignSurveyEngineer(
      region,
      employees
    ),

    hldEngineer: assignHLDEngineer(
      region,
      employees
    ),

    lldEngineer: assignLLDEngineer(
      region,
      employees
    ),

    qaEngineer: assignQAEngineer(
      region,
      employees
    ),

    documentationEngineer: assignDocumentationEngineer(
      region,
      employees
    ),

    rtaEngineer: assignRTAEngineer(
      region,
      employees
    )

  };

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