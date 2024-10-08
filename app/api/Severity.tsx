export enum Severity {
   None = 100,
   Emergency = 8,
   Alert = 7,
   Critical = 6,
   Error = 5,
   Warning = 4,
   Notice = 3,
   Info = 2,
   Debug = 1
}

const severityNames: Map<string, Severity> = new Map([
   ['none', Severity.None],
   ['emergency', Severity.Emergency],
   ['alert', Severity.Alert],
   ['critical', Severity.Critical],
   ['error', Severity.Error],
   ['warning', Severity.Warning],
   ['notice', Severity.Notice],
   ['info', Severity.Info],
   ['debug', Severity.Debug]
]);

const highestSeverity = Severity.Emergency;

const severityLevels: { [key: number]: string } = {
   [Severity.None]: 'none',
   [Severity.Emergency]: 'emergency',
   [Severity.Alert]: 'alert',
   [Severity.Critical]: 'critical',
   [Severity.Error]: 'error',
   [Severity.Warning]: 'warning',
   [Severity.Notice]: 'notice',
   [Severity.Info]: 'info',
   [Severity.Debug]: 'debug'
};

function getSeverityName(severity: Severity) {
   return severityLevels[severity] || null;
}

function getSeverityValue(name: string) {
   // We need to convert the name to lowercase to make it case insensitive
   return severityNames.get(name.toLowerCase()) || null;
}

function getSeverityDefaultValue() {
   return Severity.Notice; // Default to Notice
}

function getSeverityValueOrDefault(name: string) {
   return severityNames.get(name.toLowerCase()) || getSeverityDefaultValue();
}

function getHighestSeverity() {
   return highestSeverity;
}

export {
   getSeverityDefaultValue,
   getSeverityName,
   getSeverityValue,
   getSeverityValueOrDefault,
   highestSeverity,
   getHighestSeverity
};
