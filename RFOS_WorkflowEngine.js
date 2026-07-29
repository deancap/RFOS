/**
 * ==========================================================
 * RFOS WORKFLOW ENGINE
 * Rising Fiber Operations System (RFOS)
 * Version 2.0
 * ==========================================================
 *
 * Reads the workflow from 15_Workflow_Master.
 * This file contains NO hardcoded workflow.
 *
 * Responsibilities
 * ----------------
 * • Load workflow stages
 * • Determine stage outcome
 * • Calculate duration
 * • Calculate delay
 * • Determine next stage
 * • Generate remarks
 * ==========================================================
 */


/* ==========================================================
 * LOAD ACTIVE WORKFLOW
 * ==========================================================
 */

function loadWorkflow() {

  return getData(CONFIG.SHEETS.WORKFLOW)

    .filter(row =>

      row[WORKFLOW_COLUMNS.STATUS] === "Active"

    )

    .sort((a,b)=>

      a[WORKFLOW_COLUMNS.STAGE_NO] -

      b[WORKFLOW_COLUMNS.STAGE_NO]

    );

}


/* ==========================================================
 * GENERATE WORKFLOW
 * ==========================================================
 */

function getWorkflowStages(){

  return loadWorkflow()

    .filter(stage=>

      stage[WORKFLOW_COLUMNS.GENERATE_ACTIVITY] === "Yes"

    );

}


/* ==========================================================
 * DETERMINE OUTCOME
 * ==========================================================
 */

function determineOutcome(stage){

  const canFail =

    stage[WORKFLOW_COLUMNS.CAN_FAIL] === "Yes";

  if(!canFail){

    return "SUCCESS";

  }

  const probability = Number(

    stage[WORKFLOW_COLUMNS.COMPLETION_PROBABILITY]

  );

  return chance(probability)

    ? "SUCCESS"

    : "FAILED";

}


/* ==========================================================
 * NEXT STAGE
 * ==========================================================
 */

function getNextStage(stage,result){

  if(result==="SUCCESS"){

    return stage[WORKFLOW_COLUMNS.SUCCESS_ROUTE];

  }

  return stage[WORKFLOW_COLUMNS.FAILURE_ROUTE];

}


/* ==========================================================
 * STATUS
 * ==========================================================
 */

function generateActivityStatus(result){

  if(result==="FAILED"){

    return "Failed";

  }

  return "Completed";

}


/* ==========================================================
 * DURATION
 * ==========================================================
 */

function generateDuration(stage){

  const average = Number(

    stage[WORKFLOW_COLUMNS.AVG_DURATION]

  );

  const minimum = Math.max(1, average - 1);

  const maximum = average + 1;

  return randomInt(minimum, maximum);

}


/* ==========================================================
 * DELAY
 * ==========================================================
 */

function generateDelay(result){

  if(result==="FAILED"){

    return randomInt(2,7);

  }

  if(chance(80)){

    return 0;

  }

  return randomInt(1,3);

}


/* ==========================================================
 * REMARKS
 * ==========================================================
 */

function generateRemarks(result){

  switch(result){

    case "SUCCESS":

      return "Workflow completed successfully.";

    case "FAILED":

      return "Returned for rework.";

    default:

      return "";

  }

}


/* ==========================================================
 * CREATE WORKFLOW RESULT
 * ==========================================================
 */

function processWorkflowStage(stage){

  const result = determineOutcome(stage);

  return {

    result: result,

    status: generateActivityStatus(result),

    duration: generateDuration(stage),

    delay: generateDelay(result),

    nextStage: getNextStage(stage,result),

    remarks: generateRemarks(result)

  };

}