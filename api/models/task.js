//define how Task should looks like
const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {type: String, required: true},
  created: {type: String, required: true},
  end: {type: String, required: false},
  isDone: {type: Boolean, required: true},
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, //this Task required userId
  }
});

module.exports = mongoose.model('Task', taskSchema);// export Mongoose schema with name 'Task'