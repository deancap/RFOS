/**
 * ==========================================================
 * RFOS ASSIGNMENT ENGINE
 * Rising Fiber Operations System (RFOS)
 * Version 1.0
 * ==========================================================
 *
 * Responsible for assigning engineers to projects,
 * sites, and workflow activities.
 *
 * Assignment Priority
 * -------------------
 * 1. Active + Team + Primary Region
 * 2. Active + Team + Secondary Region
 * 3. Active + Team
 *
 * Future Enhancements
 * -------------------
 * • Workload Balancing
 * • Engineer Availability
 * • Skill-Based Assignment
 * • Municipality Preference
 * • AI Assignment Recommendation
 * ==========================================================
 */


/**
 * ==========================================================
 * Filter Employees
 * ==========================================================
 */
function filterEmployees(employees, team, region, priority) {

  switch (priority) {

    case "PRIMARY":

      return employees.filter(emp =>

        emp[EMPLOYEE_COLUMNS.STATUS] === "Active" &&
        emp[EMPLOYEE_COLUMNS.TEAM] === team &&
        emp[EMPLOYEE_COLUMNS.PRIMARY_REGION] === region

      );

    case "SECONDARY":

      return employees.filter(emp =>

        emp[EMPLOYEE_COLUMNS.STATUS] === "Active" &&
        emp[EMPLOYEE_COLUMNS.TEAM] === team &&
        emp[EMPLOYEE_COLUMNS.SECONDARY_REGION] === region

      );

    case "TEAM":

      return employees.filter(emp =>

        emp[EMPLOYEE_COLUMNS.STATUS] === "Active" &&
        emp[EMPLOYEE_COLUMNS.TEAM] === team

      );

    default:

      return [];

  }

}


/**
 * ==========================================================
 * Assign Engineer
 * ==========================================================
 * Returns Employee ID
 */
function assignEngineer(team, region, employees) {

  employees = employees || loadEmployees();

  let eligible = filterEmployees(
    employees,
    team,
    region,
    "PRIMARY"
  );

  if (eligible.length === 0) {

    eligible = filterEmployees(
      employees,
      team,
      region,
      "SECONDARY"
    );

  }

  if (eligible.length === 0) {

    eligible = filterEmployees(
      employees,
      team,
      region,
      "TEAM"
    );

  }

  if (eligible.length === 0) {

    return "";

  }

  // Version 1.0
  // Future: Replace with workload balancing
  return randomItem(eligible)[EMPLOYEE_COLUMNS.EMPLOYEE_ID];

}


/**
 * ==========================================================
 * Assign Survey Engineer
 * ==========================================================
 */
function assignSurveyEngineer(region, employees) {

  return assignEngineer(
    TEAM.SURVEY,
    region,
    employees
  );

}


/**
 * ==========================================================
 * Assign HLD Engineer
 * ==========================================================
 */
function assignHLDEngineer(region, employees) {

  return assignEngineer(
    TEAM.HLD,
    region,
    employees
  );

}


/**
 * ==========================================================
 * Assign LLD Engineer
 * ==========================================================
 */
function assignLLDEngineer(region, employees) {

  return assignEngineer(
    TEAM.LLD,
    region,
    employees
  );

}


/**
 * ==========================================================
 * Assign QA Engineer
 * ==========================================================
 */
function assignQAEngineer(region, employees) {

  return assignEngineer(
    TEAM.QA,
    region,
    employees
  );

}


/**
 * ==========================================================
 * Assign Documentation Engineer
 * ==========================================================
 */
function assignDocumentationEngineer(region, employees) {

  return assignEngineer(
    TEAM.DOCUMENTATION,
    region,
    employees
  );

}


/**
 * ==========================================================
 * Assign RTA Engineer
 * ==========================================================
 */
function assignRTAEngineer(region, employees) {

  return assignEngineer(
    TEAM.RTA,
    region,
    employees
  );

}


/**
 * ==========================================================
 * Assign Complete Site Team
 * ==========================================================
 * Returns all assigned engineers
 */
function assignSiteTeam(region) {

  const employees = loadEmployees();

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