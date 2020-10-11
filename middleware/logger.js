// Desc  Logs req to console
const logger = (req, res, next) => {
   console.log(`${req.method} ${req.protocol}`);
   next();
}

module.exports = logger;