export class ValidationErrorGenerator {
  /**
   * Generates a validation error message for a given issue.
   * @param {object} issue - The validation issue.
   * @returns {string} The generated error message.
   */
  static generateValidationError(issue: any) {
    switch (issue.code) {
      case "invalid_type":
        return this.generateInvalidTypeError(issue);
      case "unrecognized_keys":
        return this.generateUnrecognizedKeysError(issue);
      case "invalid_enum_value":
        return this.generateInvalidEnumValueError(issue);
      default:
        return issue.message;
    }
  }

  /**
   * Generates an error message for an invalid type issue.
   * @param {object} issue - The validation issue.
   * @returns {string} The generated error message.
   */
  static generateInvalidTypeError(issue: any) {
    return `Invalid type for field "${issue.path.join(".")}". Expected ${
      issue.expected
    }, but received ${issue.received}.`;
  }

  /**
   * Generates an error message for unrecognized keys issue.
   * @param {object} issue - The validation issue.
   * @returns {string} The generated error message.
   */
  static generateUnrecognizedKeysError(issue: any) {
    return `Unrecognized field(s): ${issue.keys.join(", ")}.`;
  }

  /**
   * Generates an error message for an invalid enum value issue.
   * @param {object} issue - The validation issue.
   * @returns {string} The generated error message.
   */
  static generateInvalidEnumValueError(issue: any) {
    return `Invalid value for field "${issue.path.join(
      ".",
    )}". Expected one of ${Object.values(issue.options)}, but received ${
      issue.received
    }.`;
  }

  /**
   * Generates an error response for a given error object.
   * @param {object} error - The error object.
   * @returns {string} The generated error response.
   */
  static generateErrorResponse(error: any) {
    return error.issues
      .map((issue: any) => this.generateValidationError(issue))
      .join(" ");
  }
}
