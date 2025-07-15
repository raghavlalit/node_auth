import joi from "joi";

/**
 * Enhanced API Input Validator
 * Provides comprehensive validation with detailed error messages
 */

const apiInputSchema = rule_obj => joi.object(rule_obj);

/**
 * Enhanced API Input Validator Function
 * @param {Object} body_data - Request body data
 * @param {Object} rule_obj - Joi validation rules
 * @param {Object} options - Validation options
 * @returns {Promise<void>}
 */
const apiInputValidator = async (body_data, rule_obj, options = {}) => {
  const validationOptions = {
    abortEarly: false, // Return all validation errors
    allowUnknown: options.allowUnknown || false, // Don't allow unknown fields
    stripUnknown: options.stripUnknown || false, // Remove unknown fields
    ...options
  };

  try {
    const { error, value } = apiInputSchema(rule_obj).validate(body_data, validationOptions);
    
    if (error) {
      // Create detailed error object
      const validationError = {
        statusCode: 400,
        message: 'Validation Error',
        errorCode: 'VALIDATION_ERROR',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type,
          value: detail.context?.value
        }))
      };
      
      throw validationError;
    }
    
    // Return validated data if needed
    return value;
  } catch (error) {
    // Re-throw validation errors
    if (error.statusCode) {
      throw error;
    }
    
    // Handle unexpected errors
    throw {
      statusCode: 500,
      message: 'Validation processing error',
      errorCode: 'VALIDATION_PROCESSING_ERROR',
      details: error.message
    };
  }
};

/**
 * Sanitize input data
 * @param {Object} data - Input data
 * @returns {Object} - Sanitized data
 */
const sanitizeInput = (data) => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Trim strings and remove extra whitespace
      sanitized[key] = value.trim().replace(/\s+/g, ' ');
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Validate and sanitize input
 * @param {Object} body_data - Request body data
 * @param {Object} rule_obj - Joi validation rules
 * @param {Object} options - Validation options
 * @returns {Promise<Object>} - Validated and sanitized data
 */
const validateAndSanitize = async (body_data, rule_obj, options = {}) => {
  // First sanitize the input
  const sanitizedData = sanitizeInput(body_data);
  
  // Then validate
  const validatedData = await apiInputValidator(sanitizedData, rule_obj, options);
  
  return validatedData;
};

export default apiInputValidator;
export { sanitizeInput, validateAndSanitize };