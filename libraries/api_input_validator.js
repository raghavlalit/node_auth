import joi from "joi";

const apiInputSchema = rule_obj => joi.object(rule_obj);

/**This Function Must Be used with try-catch */
const apiInputValidator = async (body_data, rule_obj) => {
    const { error } = apiInputSchema(rule_obj).validate(body_data);
    if (error) throw ({ statusCode: 200, messageCode: error.message });
};

export default apiInputValidator;