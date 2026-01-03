/**
 * Sends a standardized success response.
 * @param {object} res - The Express response object.
 * @param {object} data - The payload to send in the response.
 * @param {string} [message='Success'] - The response message.
 * @param {number} [statusCode=200] - The HTTP status code.
 */
export const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data
  });
};

/**
 * Sends a standardized error response.
 * @param {object} res - The Express response object.
 * @param {string} [message='An error occurred'] - The error message.
 * @param {number} [statusCode=500] - The HTTP status code.
 * @param {Array} [errors=[]] - An array of specific error details.
 */
export const sendError = (res, message = 'An error occurred', statusCode = 500, errors = []) => {
  res.status(statusCode).json({
    status: 'error',
    message,
    errors
  });
};
