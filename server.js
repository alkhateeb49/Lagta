const express = require('express');
const app=express();
require('dotenv').config()
const bp = require('body-parser')
const PORT=process.env.PORT || 8000;


app.use(express.static('./public')); // Public file
app.set('view engine', 'ejs');


// Middleware
app.use(express.json());



// Routes

app.get('/', home)
app.get('/infoForm', infoForm)


app.use((req, res) => {
  res.status(404).send('Page Not Found!');
});











function home(req, res) {  
  res.render('pages/index')
}
function infoForm(req, res) {  
  res.render('pages/infoForm')
}







// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
