const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const signup = require('./controllers/signup')

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
  dB.select('email', 'hash')
    .from('login')
    .where('email', '=', req.body.email)
    .then(data => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        return dB
          .select('*')
          .from('users')
          .where('email', '=', req.body.email)
          .then(user => {
            res.json(user[0]);
          })
          .catch(err => res.status(400).json('unable to get user'));
      } else {
        res.status(400).json('wrong credentials');
      }
    })
    .catch(err => res.status(400).json('wrong credentials'));
});

app.post('/signup', (req, res) => { signup.handleSignUp(req, res, dB, bcrypt) });

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;

  dB.select('*')
    .from('users')
    .where({ id })
    .then(user => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json('Not found');
      }
    })
    .catch(err => res.status(400).json('Error getting user'));
});

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
