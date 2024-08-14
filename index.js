const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/todolist', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Could not connect to MongoDB", err));

// Define a schema
const taskSchema = new mongoose.Schema({
    title: String,
    details: String
});

// Define a model
const Task = mongoose.model('Task', taskSchema);

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Display the list of tasks
app.get('/', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.render("index", { files: tasks });
    } catch (err) {
        res.status(500).send(err);
    }
});

// Read a task
app.get('/file/:filename', async (req, res) => {
    try {
        const task = await Task.findOne({ title: req.params.filename });
        if (task) {
            res.render('show', { filename: task.title, filedata: task.details });
        } else {
            res.status(404).send("Task not found");
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

// Edit a task
app.get('/edit/:filename', (req, res) => {
    res.render('edit', { filename: req.params.filename });
});

app.post('/edit', async (req, res) => {
    try {
        await Task.updateOne({ title: req.body.previous }, { title: req.body.new });
        res.redirect("/");
    } catch (err) {
        res.status(500).send(err);
    }
});

// Create a new task
app.post('/create', async (req, res) => {
    try {
        const newTask = new Task({
            title: req.body.title.split(' ').join(''),
            details: req.body.details
        });
        await newTask.save();
        res.redirect("/");
    } catch (err) {
        res.status(500).send(err);
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
