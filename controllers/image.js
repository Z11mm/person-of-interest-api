const Clarifai = require('clarifai');

const app = new Clarifai.App({
  apiKey: '88005c5ed5844cbeadf1dcd9c209611b'
});

const handleApiCall = () => (req, res) => {
  app.models
    .predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
    .then(data => {
      res.json(data);
    })
    .catch(err => res.status(400).json('unable to handle api call'));
};

const setImageEntries = dB => (req, res) => {
  const { id } = req.body;

  dB('users')
    .where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0]);
    })
    .catch(err => res.status(400).json('unable to get entries'));
};

module.exports = {
  setImageEntries: setImageEntries,
  handleApiCall: handleApiCall
};
