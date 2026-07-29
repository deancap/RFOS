/**
 * ==========================================================
 * DEBUG PROJECT REGIONS
 * ==========================================================
 */

function debugProjectRegions() {

  const regions = loadProjectRegions();

  Logger.log("Project Regions = " + regions.length);

  regions.forEach(function(row, index) {

    Logger.log(
      index +
      " | PROJECT = " +
      row[PROJECT_REGION_COLUMNS.PROJECT_ID] +
      " | REGION = " +
      row[PROJECT_REGION_COLUMNS.REGION]
    );

  });

}