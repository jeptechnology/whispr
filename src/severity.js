// This is a simple helper module to provide a mapping between the syslog severity levels and their corresponding numeric values. 
// It is used by the syslog module to determine the severity of a log message. 

// The module exports several functions to help with this mapping:
//   getSeverityName(severity) - Returns the name of the severity level for the given numeric value.
//   getSeverityValue(name) - Returns the numeric value of the severity level for the given name.
//   getSeverityValueOrDefault(name) - Returns the numeric value of the severity level for the given name, or the default value if the name is not found.

const severityLevels = {
   100: 'None', // This is a special case for use in filters to exclude all messages
   8: 'Emergency',
   7: 'Alert',
   6: 'Critical',
   5: 'Error',
   4: 'Warning',
   3: 'Notice',
   2: 'Info',
   1: 'Debug'
};

const severityNames = Object.keys(severityLevels).reduce((acc, key) => {
   // In order to make everything case insensitive, we convert the key to lowercase
   // and store the value as an integer
   acc[severityLevels[key].toLowerCase()] = parseInt(key);
   return acc;
}, {});

const highestSeverity = Math.max(...Object.keys(severityLevels));

function getSeverityName(severity) {
   return severityLevels[severity] || null;
}

function getSeverityValue(name) {
   // We need to convert the name to lowercase to make it case insensitive
   return severityNames[name.toLowerCase()] || null;
}

function getSeverityDefaultValue() {
   return 2; // Default to Notice
}

function getSeverityValueOrDefault(name) {
   return  severityNames[name.toLowerCase()] || getSeverityDefaultValue();
}

function getHighestSeverity() {
   return M
}

module.exports = {
   getSeverityDefaultValue,
   getSeverityName,
   getSeverityValue,
   getSeverityValueOrDefault,
   highestSeverity
};
