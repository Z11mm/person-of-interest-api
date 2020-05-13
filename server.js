const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const signup = require('./controllers/signup');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');

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

app.get('/profile/:id', (req, res) => { profile.getProfile(req, res, dB) });

app.put('/image', (req, res) => {
  const { id } = req.body;

  dB('users')
    .where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0]);
    })
    .catch(err => res.status(400).json('unable to get entries'));
});

app.listen(3000, () => {
  console.log('running on 3000...');
});

/* 
/ --> res = this is working
/signin --> POST, res: success/fail
/signup --> POST, res: userObj/error
/profile/:userId --> GET, res: userObj
/image --> PUT, res: updated userObj
*/
