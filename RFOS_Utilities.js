/**
 * ==========================================================
 * RFOS UTILITIES
 * Rising Fiber Operations System (RFOS)
 * Version 2.0
 * ==========================================================
 *
 * Common Utility Functions
 *
 * This file contains reusable helper functions only.
 * No business logic belongs here.
 * ==========================================================
 */


/* ==========================================================
 * SHEETS
 * ==========================================================
 */

function getSheet(sheetName) {

  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(sheetName);

  if (!sheet) {

    throw new Error("Sheet not found: " + sheetName);

  }

  return sheet;

}


function sheetExists(sheetName) {

  return SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(sheetName) !== null;

}


/* ==========================================================
 * DATA
 * ==========================================================
 */

function getAllData(sheetName) {

  return getSheet(sheetName)
    .getDataRange()
    .getValues();

}


function getData(sheetName) {

  const sheet = getSheet(sheetName);

  if (sheet.getLastRow() < 2) {

    return [];

  }

  return sheet
    .getRange(
      2,
      1,
      sheet.getLastRow() - 1,
      sheet.getLastColumn()
    )
    .getValues();

}


function clearSheet(sheetName) {

  const sheet = getSheet(sheetName);

  if (sheet.getLastRow() > 1) {

    sheet
      .getRange(
        2,
        1,
        sheet.getLastRow() - 1,
        sheet.getLastColumn()
      )
      .clearContent();

  }

}


function writeRows(sheetName, rows) {

  if (!rows || rows.length === 0) return;

  getSheet(sheetName)
    .getRange(
      2,
      1,
      rows.length,
      rows[0].length
    )
    .setValues(rows);

}


function replaceRows(sheetName, rows) {

  clearSheet(sheetName);

  writeRows(sheetName, rows);

}


/* ==========================================================
 * SHEET INFO
 * ==========================================================
 */

function lastDataRow(sheetName) {

  return getSheet(sheetName).getLastRow();

}


function lastDataColumn(sheetName) {

  return getSheet(sheetName).getLastColumn();

}


/* ==========================================================
 * RANDOM
 * ==========================================================
 */

function randomInt(min, max) {

  return Math.floor(

    Math.random() * (max - min + 1)

  ) + min;

}


function randomItem(array) {

  if (!array || array.length === 0) {

    return null;

  }

  return array[

    randomInt(0, array.length - 1)

  ];

}


function chance(percent) {

  return Math.random() * 100 < percent;

}


/* ==========================================================
 * DATE
 * ==========================================================
 */

function today() {

  return new Date();

}


function now() {

  return new Date();

}


function addDays(date, days) {

  const d = new Date(date);

  d.setDate(d.getDate() + days);

  return d;

}


function daysBetween(start, end) {

  return Math.floor(

    (end - start) / 86400000

  );

}


function formatDate(date) {

  return Utilities.formatDate(

    date,

    Session.getScriptTimeZone(),

    "yyyyMMdd"

  );

}


/* ==========================================================
 * IDS
 * ==========================================================
 */

function createID(prefix, counter, digits) {

  return prefix +

    String(counter).padStart(digits, "0");

}


function generateActivityID(date, counter) {

  return "ACT-" +

    formatDate(date) +

    "-" +

    Utilities.formatString("%06d", counter);

}


function generateUUID() {

  return Utilities.getUuid();

}


/* ==========================================================
 * COORDINATES
 * ==========================================================
 */

function randomCoordinateOffset() {

  return (

    Math.random()

    * RFOS_CONFIG.RANDOM_COORDINATE_OFFSET

    * 2

  ) - RFOS_CONFIG.RANDOM_COORDINATE_OFFSET;

}


/* ==========================================================
 * OBJECTS
 * ==========================================================
 */

function clone(object) {

  return JSON.parse(

    JSON.stringify(object)

  );

}


/* ==========================================================
 * VALIDATION
 * ==========================================================
 */

function isBlank(value) {

  return value === null ||

         value === "" ||

         value === undefined;

}


function isEmptyRow(row) {

  return row.every(isBlank);

}


/* ==========================================================
 * LOGGING
 * ==========================================================
 */

function log(message) {

  Logger.log(message);

}