/**
 * Mock DELETE route
 *
 * @name Delete
 * @path {DELETE} /hello
 * @body {String} id - id of user
 */
module.exports = function del(req, res) {
  if (!req.query.id || isNaN(parseFloat(req.query.id))) {
    res.status(400).json({ message: 'Must supply a valid integer ID' })
  } else {
    res.json({ message: `User ${req.query.id} has been deleted successfully` })
  }
}
