const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const axios = require('axios');
const { exec } = require('child_process');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));

// Dummy users database
const users = [{ id: 1, username: 'user1', password: 'pass1' }, { id: 2, username: 'user2', password: 'pass2' }];

passport.use(new LocalStrategy(
  (username, password, done) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      return done(null, user);
    } else {
      return done(null, false, { message: 'Incorrect credentials.' });
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user);
});

// Login route
app.post('/login', passport.authenticate('local'), (req, res) => {
  res.send('Logged in');
});

// Submit prompt and generate image
app.post('/submit-prompt', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).send('You need to log in.');
    }

    const prompt = req.body.prompt;

    exec(`python3 generate_image.py "${prompt}"`, (error, stdout, stderr) => {
        console.log('stdout:', stdout);
        console.log('stderr:', stderr);

        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send({ error: `Error generating image: ${error.message}` });
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).send({ error: `Error generating image: ${stderr}` });
        }
        const match = stdout.match(/http[^ ]+\.png/);
        if (match) {
            const imageURL = match[0]; // match[0] contains the first match which should be our URL
            res.send({ imageURL });
        } else {
            res.status(500).send({ error: 'No image URL found' });
        }

    });
});

// Endpoint to blend images
app.post('/blend-images', async (req, res) => {
    const { image1, image2 } = req.body;
    const response = await axios.post('https://api.replicate.com/v1/predictions', {
      model: 'lambdal/image-mixer:23d37d119ed3149e1135564d1cb5551c16dac1026e9deb972df42810a0f68c2f',
      input: { image1, image2 }
    }, {
      headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}` }
    });

    const imageURL = response.data.urls.get;
    res.send({ imageURL });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
