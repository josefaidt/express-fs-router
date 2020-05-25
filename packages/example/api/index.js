/**
 * Retrieve generic message
 *
 * @name API Entrypoint
 * @path {GET} /
 */
module.exports = function get(req, res) {
  res.json({ message: 'Hello from the API!' })
}
