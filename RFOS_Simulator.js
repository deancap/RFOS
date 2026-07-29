/**
 * ==========================================================
 * RFOS SIMULATOR
 * Rising Fiber Operations System (RFOS)
 * Version 2.0
 * ==========================================================
 * Generates Daily Operations Log
 * from Site Master + Workflow Master
 * ==========================================================
 */


/* ==========================================================
 * MAIN SIMULATION
 * ==========================================================
 */
function runSimulation() {

  validateSimulation();

  clearSheet(CONFIG.SHEETS.DAILY_LOG);

  const workflow = loadWorkflow();
  const sites = loadSites();

  let rows = [];
  let activityCounter = 1;

  sites.forEach(site => {

    rows.push(

      ...simulateSite(

        site,

        workflow,

        activityCounter

      )

    );

    activityCounter = rows.length + 1;

  });

  writeRows(CONFIG.SHEETS.DAILY_LOG, rows);

  SpreadsheetApp.getUi().alert(

    rows.length +

    " Daily Activities generated."

  );

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
 * SIMULATE ONE SITE
 * ==========================================================
 */
function simulateSite(site, workflow, startCounter) {

  let rows = [];

  let counter = startCounter;

  let plannedDate = new Date(RFOS_CONFIG.START_DATE);

  workflow.forEach(stage => {

    if (

      stage[WORKFLOW_COLUMNS.STATUS] !== "Active"

    ) return;

    if (

      stage[WORKFLOW_COLUMNS.GENERATE_ACTIVITY] !== "Yes"

    ) return;

    const activity = createActivity(

      counter++,

      site,

      stage,

      plannedDate

    );

    rows.push(activity);

    plannedDate = addDays(

      plannedDate,

      Number(stage[WORKFLOW_COLUMNS.AVG_DURATION])

    );

  });

  return rows;

}


/* ==========================================================
 * CREATE ACTIVITY
 * ==========================================================
 */
function createActivity(counter, site, stage, plannedDate) {

  const outcome = determineOutcome(stage);

  const duration = Number(

    stage[WORKFLOW_COLUMNS.AVG_DURATION]

  );

  const delay = outcome === "Failed"

    ? randomInt(1,5)

    : 0;

  const actualDate = addDays(

    plannedDate,

    delay

  );

  return [

    generateActivityID(today(), counter),

    today(),

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

    outcome,

    plannedDate,

    actualDate,

    duration,

    delay,

    generateRemarks(outcome),

    now()

  ];

}


/* ==========================================================
 * DETERMINE SUCCESS
 * ==========================================================
 */
function determineOutcome(stage) {

  if (

    stage[WORKFLOW_COLUMNS.CAN_FAIL] !== "Yes"

  ) {

    return "Completed";

  }

  const probability = Number(

    stage[WORKFLOW_COLUMNS.COMPLETION_PROBABILITY]

  );

  return chance(probability)

    ? "Completed"

    : "Failed";

}


/* ==========================================================
 * GET ASSIGNED ENGINEER
 * ==========================================================
 */
function getAssignedEngineer(site, stage) {

  switch(stage[WORKFLOW_COLUMNS.TEAM]) {

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
 * REMARKS
 * ==========================================================
 */
function generateRemarks(status) {

  switch(status){

    case "Completed":

      return "Activity completed successfully.";

    case "Failed":

      return "Activity requires rework.";

    default:

      return "";

  }

}