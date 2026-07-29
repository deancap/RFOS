/**
 * ==========================================================
 * RFOS MASTER LOADER
 * Rising Fiber Operations System (RFOS)
 * Version 2.0
 * ==========================================================
 *
 * Centralized Data Access Layer
 *
 * Every module should retrieve spreadsheet data only through
 * this file.
 *
 * This keeps all sheet references in one place and makes
 * future maintenance much easier.
 * ==========================================================
 */


/* ==========================================================
 * EMPLOYEES
 * ==========================================================
 */

function loadEmployees() {

  return getData(CONFIG.SHEETS.EMPLOYEES);

}


/* ==========================================================
 * PROJECTS
 * ==========================================================
 */

function loadProjects() {

  return getData(CONFIG.SHEETS.PROJECTS);

}


/* ==========================================================
 * OLT / POI
 * ==========================================================
 */

function loadOLTs() {

  return getData(CONFIG.SHEETS.OLT);

}


/* ==========================================================
 * CLUSTERS
 * ==========================================================
 */

function loadClusters() {

  return getData(CONFIG.SHEETS.CLUSTERS);

}


/* ==========================================================
 * SITES
 * ==========================================================
 */

function loadSites() {

  return getData(CONFIG.SHEETS.SITES);

}


/* ==========================================================
 * BARANGAYS
 * ==========================================================
 */

function loadBarangays() {

  return getData(CONFIG.SHEETS.BARANGAYS);

}


/* ==========================================================
 * ACTIVITY TYPES
 * ==========================================================
 */

function loadActivityTypes() {

  return getData(CONFIG.SHEETS.ACTIVITY_TYPES);

}


/* ==========================================================
 * WORKFLOW MASTER
 * ==========================================================
 */

function loadWorkflow() {

  return getData(CONFIG.SHEETS.WORKFLOW);

}


/* ==========================================================
 * DAILY OPERATIONS LOG
 * ==========================================================
 */

function loadDailyOperationsLog() {

  return getData(CONFIG.SHEETS.DAILY_LOG);

}


/* ==========================================================
 * OPTIONAL MASTER TABLES
 * ==========================================================
 * Keep these if the sheets exist.
 * Otherwise they simply return [].
 * ==========================================================
 */

function loadSiteStatus() {

  return CONFIG.SHEETS.SITE_STATUS
    ? getData(CONFIG.SHEETS.SITE_STATUS)
    : [];

}


function loadSitePriority() {

  return CONFIG.SHEETS.SITE_PRIORITY
    ? getData(CONFIG.SHEETS.SITE_PRIORITY)
    : [];

}


function loadDelayReasons() {

  return CONFIG.SHEETS.DELAY_REASONS
    ? getData(CONFIG.SHEETS.DELAY_REASONS)
    : [];

}


function loadSupportTypes() {

  return CONFIG.SHEETS.SUPPORT_TYPES
    ? getData(CONFIG.SHEETS.SUPPORT_TYPES)
    : [];

}


function loadActivityProbability() {

  return CONFIG.SHEETS.ACTIVITY_PROBABILITY
    ? getData(CONFIG.SHEETS.ACTIVITY_PROBABILITY)
    : [];

}


/* ==========================================================
 * LOAD ALL MASTER TABLES
 * ==========================================================
 */

function loadMasterData() {

  return {

    employees: loadEmployees(),

    projects: loadProjects(),

    olts: loadOLTs(),

    clusters: loadClusters(),

    sites: loadSites(),

    barangays: loadBarangays(),

    activityTypes: loadActivityTypes(),

    workflow: loadWorkflow(),

    dailyLog: loadDailyOperationsLog(),

    siteStatus: loadSiteStatus(),

    sitePriority: loadSitePriority(),

    delayReasons: loadDelayReasons(),

    supportTypes: loadSupportTypes(),

    activityProbability: loadActivityProbability()

  };

}