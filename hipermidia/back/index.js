import express from "express"
import cors from "cors"

const app = express() // instanciando express
app.use(cors()) // Configuração do cors
app.use(express.json()) // aplicação aceita JSON


const database = {
  users: [
    {
      name: "João Víctor",
      idade: 23
    },
        {
      name: "Salles",
      idade: 67
    },
  ]
}

app.get("/users", (req, res) => {

  res.json({
    users: database.users
  })
})

app.post("/", (req, res) => {
  const user = {
    name: req.body.name,
    idade: req.body.idade
  }
  database.users.push(user)
  console.log(req.body)
  console.log("Rota post")
})

app.put("/", (req, res) => {
  res.send("Rota put")
})

app.delete("/", (req, res) => {
  res.send("Rota delete")
})