const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const signup = require('./controllers/signup');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const dB = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'postgres',
    password: '',
    database: 'person-of-interest'
  }
});

dB.select('*').from('users');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send(dB.users);
});

app.post('/signin', (req, res) => {
  signin.handleSignIn(req, res, dB, bcrypt);
});

app.post('/signup', (req, res) => {
  signup.handleSignUp(req, res, dB, bcrypt);
});

app.get('/profile/:id', (req, res) => {
  profile.getProfile(req, res, dB);
});

app.put('/image', (req, res) => {
  image.setImageEntries(req, res, dB);
});

app.listen(3000, () => {
  console.log('running on 3000...');
});
