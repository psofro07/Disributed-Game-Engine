//validation
const Joi = require('joi');

const loginValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string()
            .min(4).
            required(),
        password: Joi.string()
            .min(4)
            .required()
    })
    return schema.validate(data);
};

module.exports.loginValidation = loginValidation; 