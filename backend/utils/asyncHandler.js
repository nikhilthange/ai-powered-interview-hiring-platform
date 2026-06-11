/**
 * Wraps async express routes to eliminate repetitive try/catch blocks.
 * Catches rejected promises and forwards them to the global error middleware.
 */
module.exports = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
