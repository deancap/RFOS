/**
 * ==========================================================
 * RFOS CONFIGURATION
 * Rising Fiber Operations System (RFOS)
 * Version 1.0
 * ==========================================================
 * Central configuration and constants.
 * No business logic should exist here.
 * ==========================================================
 */


/* ==========================================================
 * SYSTEM CONFIGURATION
 * ==========================================================
 */

const RFOS_CONFIG = {

  COMPANY_NAME: "Rising Fiber Inc.",

  SYSTEM_VERSION: "1.0",

  START_DATE: "2026-02-05",

  END_DATE: "2026-07-22",

  DEFAULT_OLT_PORT_CAPACITY: 1024,

  DEFAULT_FIBER_CAPACITY: 144,

  DEFAULT_SITES_PER_CLUSTER: 10,

  DEFAULT_POLE_COUNT: 12,

  DEFAULT_FIBER_LENGTH: 350,

  DEFAULT_DISTRIBUTION_TYPE: "Aerial",

  DEFAULT_SITE_STATUS: "Planning",

  DEFAULT_CLUSTER_STATUS: "Planning",

  DEFAULT_OLT_STATUS: "Active",

  DEFAULT_PRIORITY: "Medium",

  RANDOM_COORDINATE_OFFSET: 0.003

};


/* ==========================================================
 * SHEET CONFIGURATION
 * ==========================================================
 */

const CONFIG = {

  SHEETS: {

    PROJECTS: "03_Projects",

    EMPLOYEES: "05_Employees",

    OLTS: "06_OLT_POI",

    CLUSTERS: "07_Clusters",

    SITES: "08_Sites",

    BARANGAYS: "11_Barangays",

    ACTIVITY_TYPES: "12_Activity_Types",

    DAILY_LOG: "Daily_Operations_Log",

    WORKFLOW: "15_Workflow_Master"

  }

};


/* ==========================================================
 * REGION CODES
 * ==========================================================
 */

const REGION_CODES = {

  "Central Luzon": "CL",

  "Ilocos": "IL",

  "Cagayan Valley": "CV"

};


/* ==========================================================
 * LOOKUP LISTS
 * ==========================================================
 */

const DISTRIBUTION_TYPES = [

  "Aerial",

  "Underground",

  "Mixed"

];

const FIBER_CAPACITIES = [

  48,

  96,

  144,

  288,

  432

];

const SITE_PRIORITIES = [

  "Low",

  "Medium",

  "High"

];

const SITE_STATUS = [

  "Planning",

  "Survey",

  "HLD",

  "LLD",

  "RTA",

  "QA",

  "Documentation",

  "Completed"

];

const PROJECT_STATUS = [

  "Planning",

  "Active",

  "On Hold",

  "Completed",

  "Cancelled"

];

const EMPLOYEE_STATUS = [

  "Active",

  "Inactive",

  "Leave"

];


/* ==========================================================
 * ORGANIZATION
 * ==========================================================
 */

const TEAM = {

  SURVEY: "Survey",

  HLD: "HLD",

  LLD: "LLD",

  QA: "QA",

  DOCUMENTATION: "Documentation",

  RTA: "RTA"

};

const EMPLOYEE_LEVELS = [

  "Manager",

  "Team Lead",

  "Senior Design Engineer",

  "Design Engineer"

];


/* ==========================================================
 * 05_EMPLOYEES
 * ==========================================================
 */

const EMPLOYEE_COLUMNS = {

  EMPLOYEE_ID: 0,
  FIRST_NAME: 1,
  MIDDLE_INITIAL: 2,
  LAST_NAME: 3,
  EMPLOYEE_CODE: 4,
  FULL_NAME: 5,
  EMAIL: 6,
  TEAM: 7,
  POSITION: 8,
  LEVEL: 9,
  REPORTS_TO: 10,
  STATUS: 11,
  HIRE_DATE: 12,
  PRIMARY_REGION: 13,
  SECONDARY_REGION: 14,
  PHONE: 15,
  EMPLOYEE_TYPE: 16

};


/* ==========================================================
 * 03_PROJECTS
 * ==========================================================
 */

const PROJECT_COLUMNS = {

  PROJECT_ID: 0,
  PROJECT_NAME: 1,
  CLIENT: 2,
  REGION: 3,
  PROVINCE: 4,
  START_DATE: 5,
  END_DATE: 6,
  STATUS: 7,
  REMARKS: 8

};


/* ==========================================================
 * 06_OLT_POI
 * ==========================================================
 */

const OLT_COLUMNS = {

  OLT_ID: 0,
  OLT_CODE: 1,
  OLT_NAME: 2,
  PROJECT_ID: 3,
  PROJECT_NAME: 4,
  CLIENT: 5,
  REGION: 6,
  PROVINCE: 7,
  MUNICIPALITY: 8,
  PORT_CAPACITY: 9,
  FIBER_CAPACITY: 10,
  STATUS: 11,
  LATITUDE: 12,
  LONGITUDE: 13,
  ACTIVATION_DATE: 14,
  REMARKS: 15

};


/* ==========================================================
 * 07_CLUSTERS
 * ==========================================================
 */

const CLUSTER_COLUMNS = {

  CLUSTER_ID: 0,
  CLUSTER_CODE: 1,
  CLUSTER_NAME: 2,
  OLT_ID: 3,
  OLT_CODE: 4,
  PROJECT_ID: 5,
  PROJECT_NAME: 6,
  CLIENT: 7,
  REGION: 8,
  PROVINCE: 9,
  MUNICIPALITY: 10,
  PLANNED_SITES: 11,
  STATUS: 12,
  REMARKS: 13

};


/* ==========================================================
 * 08_SITES
 * ==========================================================
 */

const SITE_COLUMNS = {

  SITE_ID: 0,
  SITE_CODE: 1,
  SITE_NAME: 2,
  CLUSTER_ID: 3,
  CLUSTER_CODE: 4,
  OLT_ID: 5,
  OLT_CODE: 6,
  PROJECT_ID: 7,
  CLIENT: 8,
  REGION: 9,
  PROVINCE: 10,
  MUNICIPALITY: 11,
  BARANGAY: 12,
  LATITUDE: 13,
  LONGITUDE: 14,
  POLE_COUNT: 15,
  FIBER_LENGTH: 16,
  FIBER_CABLE: 17,
  DISTRIBUTION_TYPE: 18,
  SITE_STATUS: 19,
  PRIORITY: 20,
  SURVEY_ENGINEER: 21,
  HLD_ENGINEER: 22,
  LLD_ENGINEER: 23,
  QA_ENGINEER: 24,
  DOCUMENTATION_ENGINEER: 25,
  RTA_ENGINEER: 26,
  REMARKS: 27

};


/* ==========================================================
 * 11_BARANGAYS
 * ==========================================================
 */

const BARANGAY_COLUMNS = {

  REGION: 0,
  PROVINCE: 1,
  MUNICIPALITY: 2,
  BARANGAY: 3,
  LATITUDE: 4,
  LONGITUDE: 5

};


/* ==========================================================
 * DAILY_OPERATIONS_LOG
 * ==========================================================
 */

const DAILY_LOG_COLUMNS = {

  ACTIVITY_ID: 0,
  ACTIVITY_DATE: 1,
  SITE_ID: 2,
  SITE_CODE: 3,
  SITE_NAME: 4,
  CLUSTER_ID: 5,
  OLT_ID: 6,
  PROJECT_ID: 7,
  CLIENT: 8,
  REGION: 9,
  PROVINCE: 10,
  MUNICIPALITY: 11,
  BARANGAY: 12,
  ACTIVITY_TYPE: 13,
  WORKFLOW_STAGE: 14,
  ASSIGNED_ENGINEER: 15,
  STATUS: 16,
  PLANNED_DATE: 17,
  ACTUAL_DATE: 18,
  DURATION_DAYS: 19,
  DELAY_DAYS: 20,
  REMARKS: 21,
  LAST_UPDATED: 22

};


/* ==========================================================
 * 15_WORKFLOW_MASTER
 * ==========================================================
 */

const WORKFLOW_COLUMNS = {

  STAGE_NO: 0,
  STAGE_ID: 1,
  STAGE_NAME: 2,
  TEAM: 3,
  PREVIOUS_STAGE: 4,
  AVG_DURATION: 5,
  CAN_FAIL: 6,
  FAILURE_ROUTE: 7,
  SUCCESS_ROUTE: 8,
  COMPLETION_PROBABILITY: 9,
  STATUS: 10,
  GENERATE_ACTIVITY: 11

};