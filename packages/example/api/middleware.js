function myMiddleware(req, res, next) {
  console.log('LOGGED FROM MYMIDDLEWARE')
  next()
}

function get(req, res) {
  res.json({ message: 'yay middleware!' })
}

module.exports = [myMiddleware, get]
