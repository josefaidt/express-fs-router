import { Request, Response } from 'express'

/**
 * Say hello
 *
 * @name Hello
 * @path {GET} /hello
 * @query {String} name - Name of user
 */
export default function get(req: Request, res: Response) {
  const message: string = `Hello, ${req.query.name || 'World'}!`
  res.json({ message })
}
