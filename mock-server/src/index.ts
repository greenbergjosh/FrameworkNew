import express, { Express } from "express"
import * as bodyParser from "body-parser"
const PORT = 8080

const startServer = () => {
  const app = express()

  setupApp(app)

  setupRoutes(app)

  // Start Express on the defined PORT
  app.listen(PORT, () => {
    console.log(`GetGot mock-server started on port ${PORT}`)
  })

  return app
}

const setupApp = (app: Express) => {
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
}

const setupRoutes = (app: Express) => {
  app.get("*", (req, res) => {
    res.status(405)
    res.set("Allow", "POST")
    res.send("Method Not Allowed")
  })

  app.post("*", (req, res) => {
    console.log("Request", req.body)

    if (req.body && typeof req.body.p === "object") {
      const token = req.body.i && req.body.i.t
      const functions = Object.keys(req.body.p)

      dispatchFunctions(token, req.body.p)
    } else {
      res.send({ r: 100, __nodeMessage: "Request Body requies a `p` property with named methods." })
    }
  })
}

const app = startServer()
