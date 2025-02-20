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


// Configure storage
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: './public/Items_Img', // Folder to store images
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});

const upload = multer({ storage });

// Serve static files (so users can access uploaded images)
app.use('/uploads', express.static('uploads'));




// Routes
app.get('/', home)
app.get('/infoForm', infoForm)
app.post('/record', record)
app.get('/admin', admin)
app.get('/adminDashboard', adminDashboard)
app.post('/accept', accept)
// app.post('/itemChange', itemChange)
app.post('/itemChange', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const imagePath = `/Items_Img/${req.file.filename}`;
    let sqlQuery = 'insert into items (img,title,description,maxCount,minCount,count) values ($1,$2,$3,$4,$5,$6)';
    let values = [imagePath,req.body.title,req.body.description,req.body.maxCount,req.body.minCount,req.body.count];
    client.query(sqlQuery, values).then(data => {});
    res.redirect('../adminDashboard?user=admin&password=admin');
});




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
    const query1 = client.query('SELECT * FROM orders WHERE accepted = $1', [0]);
    const query2 = client.query('SELECT * FROM items ORDER BY id DESC LIMIT 1');

    Promise.all([query1, query2]).then(([orders, items]) => {
      res.render('pages/adminDashboard', {
        orders: orders.rows,
        items: items.rows
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
function itemChange(req, res) {
  let sqlQuery = 'insert into items (img,title,description,maxCount,minCount,count) values ($1,$2,$3,$4,$5,$6)';
  let values = [req.body.img,req.body.title,req.body.description,req.body.maxCount,req.body.minCount,req.body.count];
  client.query(sqlQuery, values).then(data => {});
  res.redirect('../adminDashboard?user=admin&password=admin');
}





// Start the Server
client.connect().then((data) => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch(error => {
  console.log('error in connect to database ' + error);
});
