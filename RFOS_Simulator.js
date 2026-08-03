/**
 * ==========================================================
 * RFOS SIMULATOR
 * Rising Fiber Operations System (RFOS)
 * Version 2.0
 * ==========================================================
 * Generates Daily_Operations_Log from 08_Sites + 15_Workflow_Master.
 *
 * For every Site, walks the workflow graph starting at the
 * lowest-numbered Active stage, following each stage's Success
 * Route or Failure Route (as rolled against its Completion
 * Probability) until a stage's route is blank/"-" (terminal) or
 * no matching stage is found. Revision stages (e.g. "Survey
 * Revision") are ordinary stages in this graph, so a failure can
 * legitimately loop a Site back through a stage it already
 * visited - that is the workflow as defined in 15_Workflow_Master,
 * not a bug.
 *
 * ----------------------------------------------------------
 * CHANGE LOG (v1.0 -> v2.0)
 * ----------------------------------------------------------
 * • FIXED: the old simulateSite() just iterated every Active,
 *   Generate-Activity stage once, in Stage No order, for every
 *   Site - it never actually looked at Success Route / Failure
 *   Route at all, so "QA Review" failing back to "LLD Revision",
 *   or any revision loop, was never represented; every Site
 *   mechanically got exactly one row per stage regardless of
 *   outcome. generateSite() (below) now genuinely traverses the
 *   graph via getNextStage()'s routing.
 * • REMOVED: this file no longer redeclares loadWorkflow(),
 *   determineOutcome(), or generateRemarks() - RFOS_WorkflowEngine.gs
 *   already defines all of those (plus generateActivityStatus(),
 *   generateDuration(), generateDelay(), getNextStage(), and the
 *   processWorkflowStage() orchestrator), and this file was
 *   silently shadowing them with a different outcome vocabulary
 *   ("Completed"/"Failed" here vs "SUCCESS"/"FAILED" there),
 *   depending on Apps Script's file load order. This file now
 *   calls RFOS_WorkflowEngine.gs's functions directly instead of
 *   keeping its own competing copies.
 * • FIXED: Daily_Operations_Log's Activity Date column was set to
 *   today() - the real-world date the script happened to run on -
 *   for every single row, regardless of where that activity fell
 *   in the simulated Feb-Jul 2026 project timeline. It's now the
 *   simulated Actual Date for that activity.
 * • CHANGED: every Site used to start its first stage on the exact
 *   same RFOS_CONFIG.START_DATE, which would put the Survey stage
 *   of every Site (1,000+ in a full run) on one calendar day - not
 *   realistic for an operations log. Site start dates are now
 *   spread across the RFOS_CONFIG.START_DATE..END_DATE window.
 * • CHANGED: a stage's Actual Date (duration + delay applied) now
 *   becomes the next stage's Planned Date, so delays compound
 *   forward through a Site's timeline instead of every stage
 *   restarting from a fixed baseline.
 * • ADDED: a per-Site visit cap (MAX_STAGE_VISITS_PER_SITE) as a
 *   safety valve - revision loops are graph cycles, and while the
 *   Completion Probability values make a runaway loop astronomically
 *   unlikely, nothing in the data structure prevents one outright.
 * • CHANGED: SpreadsheetApp.getUi().alert() is now wrapped, so
 *   running this from a time-driven trigger (no UI context) logs
 *   instead of throwing.
 * • NOTE: this task's inputs are scoped to 08_Sites and
 *   15_Workflow_Master only (12_Activity_Types is not one of them),
 *   so Activity Type is populated from the workflow Stage Name, same
 *   as Workflow Stage. Wiring in 12_Activity_Types for a distinct
 *   Activity Type classification would need that sheet added as an
 *   input.
 * ==========================================================
 */


/* ==========================================================
 * SAFETY LIMITS
 * ==========================================================
 */

const MAX_STAGE_VISITS_PER_SITE = 60;


/* ==========================================================
 * MAIN SIMULATION
 * ==========================================================
 */
function runSimulation() {

  validateSimulation();

  const sites = loadSites();

  const allStages = loadWorkflow();

  if (sites.length === 0) {

    safeAlert("No Sites found in 08_Sites - nothing to simulate.");

    return;

  }

  if (allStages.length === 0) {

    safeAlert("No Active stages found in 15_Workflow_Master - nothing to simulate.");

    return;

  }

  clearSheet(CONFIG.SHEETS.DAILY_LOG);

  const stageMap = buildStageMap(allStages);

  const entryStage = allStages[0];

  const startDate = new Date(RFOS_CONFIG.START_DATE);

  const endDate = new Date(RFOS_CONFIG.END_DATE);

  const windowDays = Math.max(
    1,
    daysBetween(startDate, endDate)
  );

  const counterRef = { value: 1 };

  const rows = [];

  sites.forEach((site, index) => {

    const offsetDays = Math.floor(
      (index / sites.length) * windowDays
    );

    const entryPlannedDate = addDays(startDate, offsetDays);

    rows.push(

      ...simulateSite(

        site,

        stageMap,

        entryStage,

        entryPlannedDate,

        counterRef

      )

    );

  });

  writeRows(CONFIG.SHEETS.DAILY_LOG, rows);

  safeAlert(rows.length + " Daily Activities generated.");

}


/* ==========================================================
 * VALIDATION
 * ==========================================================
 */
function validateSimulation() {

  [

    CONFIG.SHEETS.SITES,

    CONFIG.SHEETS.WORKFLOW,

    CONFIG.SHEETS.DAILY_LOG

  ].forEach(getSheet);

}


/* ==========================================================
 * BUILD STAGE LOOKUP
 * ==========================================================
 * Success Route / Failure Route in 15_Workflow_Master reference
 * stages by Stage Name (text), not Stage ID, so routing has to
 * join on that same text.
 */
function buildStageMap(stages) {

  const map = {};

  stages.forEach(stage => {

    map[stage[WORKFLOW_COLUMNS.STAGE_NAME]] = stage;

  });

  return map;

}


/* ==========================================================
 * ROUTE HELPERS
 * ==========================================================
 */
function isTerminalRoute(routeName) {

  return !routeName ||
    String(routeName).trim() === "" ||
    String(routeName).trim() === "-";

}


/* ==========================================================
 * SIMULATE ONE SITE
 * ==========================================================
 * Walks the workflow graph for a single Site, starting at
 * entryStage, following each stage's rolled outcome to the next
 * stage until a terminal route, an unresolved route, or the
 * visit cap is reached.
 */
function simulateSite(site, stageMap, entryStage, entryPlannedDate, counterRef) {

  const rows = [];

  let currentStage = entryStage;

  let plannedDate = entryPlannedDate;

  let visits = 0;

  while (currentStage && visits < MAX_STAGE_VISITS_PER_SITE) {

    visits++;

    const outcome = processWorkflowStage(currentStage);

    const actualDate = addDays(

      plannedDate,

      outcome.duration + outcome.delay

    );

    if (currentStage[WORKFLOW_COLUMNS.GENERATE_ACTIVITY] === "Yes") {

      rows.push(

        createActivityRow(

          counterRef.value++,

          site,

          currentStage,

          outcome,

          plannedDate,

          actualDate

        )

      );

    }

    plannedDate = actualDate;

    const nextStageName = outcome.nextStage;

    if (isTerminalRoute(nextStageName)) {

      currentStage = null;

      break;

    }

    const nextStage = stageMap[nextStageName];

    if (!nextStage) {

      log(

        "simulateSite: unresolved route '" +
        nextStageName +
        "' from stage '" +
        currentStage[WORKFLOW_COLUMNS.STAGE_NAME] +
        "' for Site " +
        site[SITE_COLUMNS.SITE_ID] +
        " - stopping this Site's workflow."

      );

      currentStage = null;

      break;

    }

    currentStage = nextStage;

  }

  if (visits >= MAX_STAGE_VISITS_PER_SITE) {

    log(

      "simulateSite: Site " +
      site[SITE_COLUMNS.SITE_ID] +
      " hit the " +
      MAX_STAGE_VISITS_PER_SITE +
      "-visit safety cap without reaching a terminal stage."

    );

  }

  return rows;

}


/* ==========================================================
 * CREATE ACTIVITY ROW
 * ==========================================================
 */
function createActivityRow(counter, site, stage, outcome, plannedDate, actualDate) {

  return [

    generateActivityID(actualDate, counter),

    actualDate,

    site[SITE_COLUMNS.SITE_ID],

    site[SITE_COLUMNS.SITE_CODE],

    site[SITE_COLUMNS.SITE_NAME],

    site[SITE_COLUMNS.CLUSTER_ID],

    site[SITE_COLUMNS.OLT_ID],

    site[SITE_COLUMNS.PROJECT_ID],

    site[SITE_COLUMNS.CLIENT],

    site[SITE_COLUMNS.REGION],

    site[SITE_COLUMNS.PROVINCE],

    site[SITE_COLUMNS.MUNICIPALITY],

    site[SITE_COLUMNS.BARANGAY],

    stage[WORKFLOW_COLUMNS.STAGE_NAME],

    stage[WORKFLOW_COLUMNS.STAGE_NAME],

    getAssignedEngineer(site, stage),

    outcome.status,

    plannedDate,

    actualDate,

    outcome.duration,

    outcome.delay,

    outcome.remarks,

    now()

  ];

}


/* ==========================================================
 * GET ASSIGNED ENGINEER
 * ==========================================================
 */
function getAssignedEngineer(site, stage) {

  switch (stage[WORKFLOW_COLUMNS.TEAM]) {

    case TEAM.SURVEY:

      return site[SITE_COLUMNS.SURVEY_ENGINEER];

    case TEAM.HLD:

      return site[SITE_COLUMNS.HLD_ENGINEER];

    case TEAM.LLD:

      return site[SITE_COLUMNS.LLD_ENGINEER];

    case TEAM.QA:

      return site[SITE_COLUMNS.QA_ENGINEER];

    case TEAM.DOCUMENTATION:

      return site[SITE_COLUMNS.DOCUMENTATION_ENGINEER];

    case TEAM.RTA:

      return site[SITE_COLUMNS.RTA_ENGINEER];

    default:

      return "";

  }

}


/* ==========================================================
 * SAFE ALERT
 * ==========================================================
 * SpreadsheetApp.getUi() throws when there is no UI context
 * (time-driven trigger, clasp run, etc). Falls back to the
 * script log so an automated run doesn't crash on the alert.
 */
function safeAlert(message) {

  try {

    SpreadsheetApp.getUi().alert(message);

  } catch (e) {

    log(message);

  }

}