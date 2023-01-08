class HttpError extends Error {
  constructor(message, errorCode) {
    super(message); // Adds a "message" property to the Error object
    this.code = errorCode; // Adds a "code" property
  }
}

module.exports = HttpError;
