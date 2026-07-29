/**
 * ==========================================================
 * RFOS MASTER LOADER
 * Rising Fiber Operations System (RFOS)
 * Version 2.0
 * ==========================================================
 * Centralized Data Access Layer
 * ==========================================================
 */


/* ==========================================================
 * PROJECTS
 * ==========================================================
 */

function loadProjects() {
  return getData(CONFIG.SHEETS.PROJECTS);
}

function loadProjectRegions() {
  return getData(CONFIG.SHEETS.PROJECT_REGIONS);
}


/* ==========================================================
 * EMPLOYEES
 * ==========================================================
 */

function loadEmployees() {
  return getData(CONFIG.SHEETS.EMPLOYEES);
}


/* ==========================================================
 * MASTER TABLES
 * ==========================================================
 */

function loadOLTs() {
  return getData(CONFIG.SHEETS.OLT);
}

function loadClusters() {
  return getData(CONFIG.SHEETS.CLUSTERS);
}

function loadSites() {
  return getData(CONFIG.SHEETS.SITES);
}

function loadBarangays() {
  return getData(CONFIG.SHEETS.BARANGAYS);
}


/* ==========================================================
 * LOOKUP TABLES
 * ==========================================================
 */

function loadActivityTypes() {
  return getData(CONFIG.SHEETS.ACTIVITY_TYPES);
}

function loadWorkflow() {
  return getData(CONFIG.SHEETS.WORKFLOW);
}


/* ==========================================================
 * LOAD EVERYTHING
 * ==========================================================
 */

function loadMasterData() {

  return {

    projects: loadProjects(),

    projectRegions: loadProjectRegions(),

    employees: loadEmployees(),

    olts: loadOLTs(),

    clusters: loadClusters(),

    sites: loadSites(),

    barangays: loadBarangays(),

    workflow: loadWorkflow(),

    activityTypes: loadActivityTypes()

  };

}