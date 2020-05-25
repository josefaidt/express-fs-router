module.exports = function post(req, res) {
  if (req.body && req.body.name) {
    res.status(200).json({ message: `Hello, ${req.body.name}` })
  } else {
    res.status(400).json({ message: 'Who am I saying hello to?' })
  }
}
