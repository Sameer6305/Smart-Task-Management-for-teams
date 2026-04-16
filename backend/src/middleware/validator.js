const { check, validationResult } = require('express-validator')

const registerValidation = [
  check('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  check('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/)
    .withMessage('Password must contain at least one letter and one number'),
  check('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
]

const loginValidation = [
  check('email').isEmail().withMessage('Valid email is required'),
  check('password').notEmpty().withMessage('Password is required'),
]

const taskValidation = [
  check('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Task title must be between 3 and 200 characters'),
]

const validate = (req, res, next) => {
  try {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      console.log("VALIDATION ERROR:", req.body, errors.array());
      return res.status(400).json({
        errors: errors.array().map((error) => ({
          field: error.path,
          message: error.msg,
        })),
        error: "Validation failed - " + errors.array().map(e => e.msg).join(', ')
      })
    }

    return next()
  } catch (error) {
    console.error("VALIDATOR CATCH ERROR:", error);
    return res.status(400).json({
      error: 'Validation failed',
      errors: [{ field: 'request', message: 'Validation failed' }],
    })
  }
}

module.exports = {
  registerValidation,
  loginValidation,
  taskValidation,
  validate,
}
