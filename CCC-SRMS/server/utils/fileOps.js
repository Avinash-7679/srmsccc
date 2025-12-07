const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Read all records from a JSONL file
 * @param {string} filename - Name of the file (e.g., 'students.txt')
 * @returns {Array} Array of parsed JSON objects
 */
function readFile(filename) {
    const filePath = path.join(DATA_DIR, filename);

    if (!fs.existsSync(filePath)) {
        return [];
    }

    const content = fs.readFileSync(filePath, 'utf-8').trim();
    if (!content) return [];

    return content.split('\n').map(line => {
        try {
            return JSON.parse(line);
        } catch (e) {
            console.error(`Error parsing line in ${filename}:`, line);
            return null;
        }
    }).filter(item => item !== null);
}

/**
 * Write all records to a JSONL file (overwrites existing)
 * @param {string} filename - Name of the file
 * @param {Array} data - Array of objects to write
 */
function writeFile(filename, data) {
    const filePath = path.join(DATA_DIR, filename);
    const content = data.map(item => JSON.stringify(item)).join('\n');
    fs.writeFileSync(filePath, content + '\n', 'utf-8');
}

/**
 * Append a single record to a JSONL file
 * @param {string} filename - Name of the file
 * @param {Object} record - Object to append
 */
function appendFile(filename, record) {
    const filePath = path.join(DATA_DIR, filename);
    const line = JSON.stringify(record) + '\n';
    fs.appendFileSync(filePath, line, 'utf-8');
}

/**
 * Update a record in a file based on a condition
 * @param {string} filename - Name of the file
 * @param {Function} findFn - Function to find the record (returns true for match)
 * @param {Object} updates - Object with fields to update
 * @returns {boolean} True if record was found and updated
 */
function updateRecord(filename, findFn, updates) {
    const records = readFile(filename);
    let found = false;

    const updated = records.map(record => {
        if (findFn(record)) {
            found = true;
            return { ...record, ...updates };
        }
        return record;
    });

    if (found) {
        writeFile(filename, updated);
    }

    return found;
}

/**
 * Delete a record from a file based on a condition
 * @param {string} filename - Name of the file
 * @param {Function} findFn - Function to find the record (returns true for match)
 * @returns {boolean} True if record was found and deleted
 */
function deleteRecord(filename, findFn) {
    const records = readFile(filename);
    const filtered = records.filter(record => !findFn(record));

    if (filtered.length < records.length) {
        writeFile(filename, filtered);
        return true;
    }

    return false;
}

/**
 * Find a single record
 * @param {string} filename - Name of the file
 * @param {Function} findFn - Function to find the record
 * @returns {Object|null} Found record or null
 */
function findRecord(filename, findFn) {
    const records = readFile(filename);
    return records.find(findFn) || null;
}

/**
 * Find all records matching a condition
 * @param {string} filename - Name of the file
 * @param {Function} filterFn - Function to filter records
 * @returns {Array} Array of matching records
 */
function findRecords(filename, filterFn) {
    const records = readFile(filename);
    return filterFn ? records.filter(filterFn) : records;
}

module.exports = {
    readFile,
    writeFile,
    appendFile,
    updateRecord,
    deleteRecord,
    findRecord,
    findRecords
};
