const config = require('config');
const startupDebugger = require('debug')('app:startup');
const dbDebugger = require('debug')('app:db');

const helmet = require('helmet');
const morgan = require('morgan');
const Joi = require('joi');
const express = require('express');
const app = express();

app.use(express.json());
app.use(helmet());

// config
console.log('Application Name: ' + config.get('name'));
console.log('Mail Server: ' + config.get('mail.host'));
console.log(`env ${app.get('env')}`);
console.log(`${process.env.DEBUG}`)

if (app.get('env') === 'development') {
  app.use(morgan('tiny'));
  startupDebugger('Morgan enabled...');
}

const courses = [
  { id: 1, name: 'course1' },
  { id: 2, name: 'course2' },
  { id: 3, name: 'course3' },
];

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/api/courses', (req, res) => {
  res.send(courses);
});

app.get('/api/courses/:id', (req, res) => {
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  if (!course) return res.status(404).send('The course with the given ID was not found');
  res.send(course);
});

app.post('/api/courses', (req, res) => {
  const {error} = validateCourse(req.body);

  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  };

  // if (!req.body.name || req.body.name.length < 3) {
  //   res.status(400).send('Name is required and should be minimum 3 characters');
  //   return;
  // };

  const course = {
    id: courses.length + 1,
    name: req.body.name,
  };
  courses.push(course);
  res.send(course);
});

app.put('/api/courses/:id', (req, res) => {
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  if (!course) return res.status(404).send('The course with the given ID was not found');

  // const schema = Joi.object({
  const {error} = validateCourse(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // update the course
  course.name = req.body.name;
  // return the updated course
  res.send(course);

});

app.delete('/api/courses/:id', (req, res) => {
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  if (!course) return res.status(404).send('The course with the given ID was not found');

  const index = courses.indexOf(course);
  courses.splice(index, 1);

  res.send(course);
});

function validateCourse(course) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
  });

  return schema.validate(course);
};

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));



