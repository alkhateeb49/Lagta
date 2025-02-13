const express = require('express');
const app=express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('./public')); // Public file
app.set('view engine', 'ejs');

require('dotenv').config()
const bp = require('body-parser')
const PORT=process.env.PORT || 8000;

// DATABASE
let pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);

// Routes
app.get('/', home)
app.get('/infoForm', infoForm)
app.post('/record', record)
app.get('/admin', admin)
app.get('/adminDashboard', adminDashboard)
app.post('/accept', accept)



app.use((req, res) => {
  res.status(404).send('Page Not Found!');
});





function home(req, res) {  
  res.render('pages/index')
}
function infoForm(req, res) {  
  res.render('pages/infoForm')
}
function record(req, res) {
  let sqlQuery = 'insert into orders (fullName,phoneNumber,email,city,area,count,accepted) values ($1,$2,$3,$4,$5,$6,$7)';
  let cityName;
  switch (parseInt(req.body.city)) {
    case 1: cityName = 'Amman'; break;
    case 2: cityName = 'Irbid'; break;
    case 3: cityName = 'Zarqa'; break;
    case 4: cityName = 'Ajloun'; break;
    case 5: cityName = 'Aqaba'; break;
    case 6: cityName = 'Balqa'; break;
    case 7: cityName = 'Jerash'; break;
    case 8: cityName = 'Karak'; break;
    case 9: cityName = 'Maan'; break;
    case 10: cityName = 'Madaba'; break;
    case 11: cityName = 'Mafraq'; break;
    case 12: cityName = 'Tafilah'; break;
    default: cityName = 'Unknown';
}
  let value = [req.body.fullName,req.body.phoneNumber,req.body.email,cityName,req.body.area,req.body.count,0];
  client.query(sqlQuery, value).then(data => {
  });
  status= "done"
  res.redirect('../');
}
function admin(req, res) {  
  res.render('pages/adminLogin')
}
function adminDashboard(req, res) {
  if(req.query.user=="admin" && req.query.password=="admin"){
    client.query('SELECT * FROM orders WHERE accepted = ($1)',[0]).then(data => {
      res.render('pages/adminDashboard',{
        data: data.rows
      });
    });
      
  }else{
    res.redirect('../admin');
  }
}
function accept(req, res) {
  client.query('SELECT * FROM orders WHERE id = ($1)',[req.body.itemId]).then(data => {
    if(data.rows.length == 1){
      client.query('UPDATE orders SET accepted = ($1) WHERE id = ($2)',[true,req.body.itemId]).then(data => {
        res.redirect('../adminDashboard?user=admin&password=admin');
      });
    }
  });
}







// Start the Server
client.connect().then((data) => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch(error => {
  console.log('error in connect to database ' + error);
});
