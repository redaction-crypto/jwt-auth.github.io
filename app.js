const express = require('express')
const authRoutes = require('./routes/authRoutes')
const cookieParser = require('cookie-parser')
const { authRequire, checkCurrentUser } = require('./middleware/authmiddleware')
require('dotenv').config()

const app = express()

// middleware
app.use(express.static('public'))

// view engine
app.set('views', 'views')
app.set('view engine', 'ejs')

app.use(express.json())
app.use(cookieParser())

// routes
app.get('*', checkCurrentUser)
app.get('/', (req, res) => res.render('home'))
app.get('/smoothies', authRequire, (req, res) => res.render('smoothies'))
app.use(authRoutes)

const port = process.env.PORT
app.listen(port, () => {
    console.log(`Server started on port ${port} => http://localhost:3000/`)
})