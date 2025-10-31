const express = require('express')
const {open} = require('sqlite')
const dbSqlite = require('sqlite3')
const cors = require('cors')
const app = express()
const path = require('path')
require('dotenv').config()
// Use the project's backend root DB file (one level up) so the DB created
// by scripts in backend/ is used instead of a different file under src/.
const dbPath = path.join(__dirname, '..', 'todoApplication.db')

// Enable CORS for frontend requests with proper configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))
app.use(express.json())

// Health check endpoint
app.get('/', async (req, res) => {
  try {
    // Check if database is connected
    if (db) {
      res.json({ 
        status: 'healthy',
        message: 'Todo API is running',
        dbStatus: 'connected'
      })
    } else {
      res.status(503).json({ 
        status: 'unhealthy',
        message: 'Database not connected',
        dbStatus: 'disconnected'
      })
    }
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: 'Internal server error',
      error: error.message
    })
  }
})

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'healthy', message: 'Todo API is running' })
})

// Use the main date-fns export so functions work correctly under CommonJS
const { format, isMatch } = require('date-fns')

let db = null

// Test endpoint to verify database operations
app.get('/api/test', async (req, res) => {
  try {
    const result = await db.get('SELECT 1 as test')
    res.json({ success: true, result })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

const installingDataBaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: dbSqlite.Database,
    })
    const PORT = process.env.PORT || 4000
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}/`)
    })
  } catch (e) {
    console.log(`DB error:${e.message}`)
    process.exit(1)
  }
}

installingDataBaseAndServer()

const hasPriorityAndStatus = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}

const hasCategoryAndStatus = requestQuery => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  )
}

const hasCategoryAndPriority = requestQuery => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  )
}

const hasSearchProperty = requestQuery => {
  return requestQuery.search_q !== undefined
}

const hasCategoryProperty = requestQuery => {
  return requestQuery.category !== undefined
}

const outResult = dbObject => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    category: dbObject.category,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  }
}

app.get('/todos/', async (req, res) => {
  let data = null

  let getTodoQuery = ''

  const {search_q = '', priority, status, category} = req.query

  switch (true) {
    case hasPriorityAndStatus(req.query):
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        if (
          status === 'TO DO' ||
          status === 'IN PROGRESS' ||
          status === 'DONE'
        ) {
          getTodoQuery = `
            SELECT 
              * 
            FROM 
              todo 
            WHERE 
             status ='${status}' 
             AND 
            priority ='${priority}';
             `
          data = await db.all(getTodoQuery)
          res.send(data.map(eachItem => outResult(eachItem)))
        } else {
          res.status(400)
          res.send('Invalid Todo Status')
        }
      } else {
        res.status(400)
        res.send('Invalid Todo Priority')
      }
      break

    case hasCategoryAndStatus(req.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (
          status === 'TO DO' ||
          status === 'IN PROGRESS' ||
          status === 'DONE'
        ) {
          getTodoQuery = `
            SELECT 
              * 
            FROM 
              todo 
            WHERE 
              category = '${category}' AND 
              status = '${status}';`
          data = await db.all(getTodoQuery)
          res.send(data.map(eachItem => outResult(eachItem)))
        } else {
          res.status(400)
          res.send('Invalid Todo Status')
        }
      } else {
        res.status(400)
        res.send('Invalid Todo Category')
      }

      break

    case hasCategoryAndPriority(req.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (
          priority === 'HIGH' ||
          priority === 'MEDIUM' ||
          priority === 'LOW'
        ) {
          getTodoQuery = `
            SELECT 
              * 
            FROM 
              todo 
            WHERE 
              priority ='${priority}' AND 
              category = '${category}';`
          data = await db.all(getTodoQuery)
          res.send(data.map(eachItem => outResult(eachItem)))
        } else {
          res.status(400)
          res.send('Invalid Todo Priority')
        }
      } else {
        res.status(400)
        res.send('Invalid Todo Category')
      }
      break

    case hasPriorityProperty(req.query):
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        getTodoQuery = `
            SELECT * FROM todo WHERE priority ='${priority}';`
        data = await db.all(getTodoQuery)
        res.send(data.map(eachItem => outResult(eachItem)))
      } else {
        res.status(400)
        res.send('Invalid Todo Priority')
      }
      break
    case hasStatusProperty(req.query):
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        getTodoQuery = `
            SELECT * FROM todo WHERE status ='${status}'`
        data = await db.all(getTodoQuery)
        res.send(data.map(eachItem => outResult(eachItem)))
      } else {
        res.status(400)
        res.send('Invalid Todo Status')
      }
      break

    case hasSearchProperty(req.query):
      getTodoQuery = `
      SELECT
       * 
      FROM
       todo 
      WHERE 
      todo LIKE '%${search_q}%';`
      data = await db.all(getTodoQuery)
      res.send(data.map(eachItem => outResult(eachItem)))
      break

    case hasCategoryProperty(req.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        getTodoQuery = `
        SELECT * FROM todo WHERE  category = '${category}';`
        data = await db.all(getTodoQuery)
        res.send(data.map(eachItem => outResult(eachItem)))
      } else {
        res.status(400)
        res.send('Invalid Todo Category')
      }
      break
    default:
      getTodoQuery = `SELECT * FROM todo;`
      data = await db.all(getTodoQuery)
      res.send(data.map(eachItem => outResult(eachItem)))
  }
})

app.get('/todos/:todoId/', async (req, res) => {
  const {todoId} = req.params
  const getTodoQuery = `
    SELECT * FROM WHERE id=${todoId};`
  const data = await db.get(getTodoQuery)
  res.send(outResult(data))
})

app.get('/agenda/', async (req, res) => {
  const {date} = req.query

  console.log(isMatch(date, 'yyyy-MM-dd'))

  if (isMatch(date, 'yyyy-MM-dd')) {
    const newDate = format(new Date(date), 'yyyy-MM-dd')
    console.log(newDate)
    const getTodoQuery = `SELECT * FROM todo WHERE due_date='${newDate}'`
    const result = await db.all(getTodoQuery)
    res.send(result.map(eachItem => outResult(eachItem)))
  } else {
    res.status(400)
    res.send('Invalid Due Date')
  }
})

app.post('/todos/', async (req, res) => {
  const {id, todo, priority, status, category, dueDate} = req.body
  if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
    if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
  if (isMatch(dueDate, 'yyyy-MM-dd')) {
          const postNewDate = format(new Date(dueDate), 'yyyy-MM-dd')
          const postquery = `INSERT INTO
                todo (
                    id, todo ,category ,priority ,status ,due_date
                )
                VALUES(${id},"${todo}","${category}","${priority}","${status}","${postNewDate}" );`
          await db.run(postquery)
          res.send('Todo Successfully Added')
        } else {
          res.status(400)
          res.send('Invalid Due Date')
        }
      } else {
        res.status(400)
        res.send('Invalid Todo Category')
      }
    } else {
      res.status(400)
      res.send('Invalid Todo Status')
    }
  } else {
    res.status(400)
    res.send('Invalid Todo Priority')
  }
})

app.put('/todos/:todoId/', async (req, res) => {
  const {todoId} = req.params
  const reqBody = req.body

  const previousTodoQuery = `SELECT * FROM todo WHERE id=${todoId}`
  const previousTodo = await db.get(previousTodoQuery)

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    category = previousTodo.category,
    status = previousTodo.status,
    dueDate = previousTodo.due_date,
  } = req.body

  let update
  switch (true) {
    case reqBody.status !== undefined:
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        update = `UPDATE todo SET todo="${todo}", priority='${priority}',status="${status}",category="${category}",
            due_date="${dueDate}" WHERE id=${todoId}`
        await db.run(update)
        res.send('Status Updated')
      } else {
        res.status(400)
        res.send('Invalid Todo Status')
      }
      break

    case reqBody.priority !== undefined:
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        update = `UPDATE todo SET todo="${todo}", priority='${priority}',status="${status}",category="${category}",
            due_date="${dueDate}" WHERE id=${todoId}`
        await db.run(update)
        res.send('Priority Updated')
      } else {
        res.status(400)
        res.send('Invalid Todo Priority')
      }
      break

    case reqBody.todo !== undefined:
      update = `UPDATE todo SET todo="${todo}", priority='${priority}',status="${status}",category="${category}",
            due_date="${dueDate}" WHERE id=${todoId}
        `
      await db.run(update)
      res.send('Todo Updated')

      break

    case reqBody.category !== undefined:
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        update = `UPDATE todo SET todo="${todo}", priority='${priority}',status="${status}",category="${category}",
                due_date="${dueDate}" WHERE id=${todoId}`
        await db.run(update)
        res.send('Category Updated')
      } else {
        res.status(400)
        res.send('Invalid Todo Category')
      }
      break

    case reqBody.dueDate !== undefined:
      if (isMatch(dueDate, 'yyyy-MM-dd')) {
        const postNewDate = format(new Date(dueDate), 'yyyy-MM-dd')
        update = `
        UPDATE 
          todo 
        SET 
         todo="${todo}", 
         priority='${priority}',
         status="${status}",
         category="${category}",      
         due_date="${postNewDate}" 
        WHERE 
          id=${todoId}`
        await db.run(update)
        res.send('Due Date Updated')
      } else {
        res.status(400)
        res.send('Invalid Due Date')
      }

      break
  }
})

app.delete('/todos/:todoId/', async (req, res) => {
  const {todoId} = req.params
  const deleteQuery = `
    DELETE 
      FROM
    todo
      WHERE 
    id=${todoId}`
  await db.run(deleteQuery)
  res.send('Todo Deleted')
})

// Health-check route: reports server and database status
app.get('/health', async (req, res) => {
  const result = { server: 'up', db: 'unknown' }
  if (!db) {
    result.db = 'down'
    return res.json(result)
  }

  try {
    // quick lightweight check to ensure DB responds
    await db.get('SELECT 1 as ping')
    result.db = 'up'
  } catch (e) {
    result.db = 'down'
  }

  res.json(result)
})

module.exports = app
