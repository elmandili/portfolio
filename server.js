const express = require('express');
const path = require('path');


const app = express();
const PORT = process.env.PORT || 3000;
let active = 'home';
let products = require('./projects.json').data;
let studies = require('./studyExperience.json').data;



// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Set the views directory

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  active = 'home';
  res.render('index', {studies}); // Render index.ejs
});

app.get('/details', (req, res) => {
  active = 'details';
  res.render('details'); // Render about.ejs
});

app.get('/browse', (req, res) => {
  active = 'browse';
  res.render('browse', {products}); // Render about.ejs
});

app.get('/profile', (req, res) => {
  active = 'profiel';
  res.render('profile'); // Render about.ejs
});


app.get('/active', (req,res) =>{
    
  res.send(JSON.stringify({"active": active}));
})

app.get('/studies', (req, res)=>{
  res.send(JSON.stringify(studyExperience));
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});