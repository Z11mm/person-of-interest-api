const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

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
  // Load hash from your password DB.
  bcrypt.compare(
    'smoothies',
    '$2a$10$Gc1WHjKTu2wrahNAMXkbp.QzE7JgtaG5s7toIM2HjBcJMVQbR/Zc.',
    function (err, res) {
      // res == true
      console.log('first guesss', res);
    }
  );
  bcrypt.compare(
    'veggies',
    '$2a$10$fY0j.NPZz5ZY2nKfC/TwTOBSH3.4l0mV9jElyBCM2fV0CMfYQqMXi',
    function (err, res) {
      // res = false
      console.log('second guess', res);
    }
  );
  if (
    req.body.email === dB.users[0].email &&
    req.body.password === dB.users[0].password
  ) {
    res.json(database.users[0]);
  } else {
    res.status(400).json('error logging in');
  }
});

app.post('/signup', (req, res) => {
  const { email, password, name } = req.body;
  const hash = bcrypt.hashSync(password);

  dB.transaction(trx => {
    trx
      .insert({
        hash: hash,
        email: email
      })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
            name: name,
            email: loginEmail[0],
            joined: new Date()
          })
          .then(user => {
            res.json(user[0]);
          });
      })
      .catch(err => res.status(400).json('unable to sign up'));
  });
});

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
