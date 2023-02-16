const mongoose = require('mongoose'); //to handle Mongoose connection
const Task = require('../models/task'); //Import Task Schema for MongoDB Documents
const User = require('../models/user'); // import User schema to use it and make sure that User exists in your Task

exports.get_all_user_tasks = (req, res, next) => {
  Task.find({ user: req.userData.userId }) // looking for Documents with this Schema and userId which was taken from encoded token | userId should be hidden |
    .select('_id name created isDone end') //taken properties
    .populate('user', 'email') // Populate in Mongoose is used to enhance one-to-many or many-to-one data relationships in MongoDB.
    .exec() // returns Promise to Use then(), catch() methods
    .then((docs) => {
      res.status(200).json({
        tasks: docs.map((doc) => {
          return {
            //set document construction thanks map()
            _id: doc.id,
            name: doc.name,
            created: doc.created,
            isDone: doc.isDone,
            end: doc.end,
            user: doc.user.email,
            request: {
              type: 'GET',
            },
          };
        }),
      }); //send JSON Response for Requests
    })
    .catch((err) => {
      console.log(err);
      //Send ERROR in JSON response
      res.status(500).json({
        error: err,
      });
    });
};

exports.task_create = (req, res, next) => {
  User.findById(req.userData.userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          //HTTP Status means Not Found
          message: 'We cannot save this task because User not found',
        });
      }

      const task = new Task({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        created: req.body.created,
        end: req.body.end,
        isDone: req.body.isDone,
        user: req.userData.userId,
      }); //we expected to receive those information
      return task.save();
    })
    .then((result) => {
      console.log(result);
      res.status(201).json({
        //HTTP Status means "Created"
        message: 'Task Saved',
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: 'User Not Found',
        error: err,
      });
    });
};

exports.get_user_task = (req, res, next) => {
  
  const id = req.params.taskId; //extract Id from params
  Task.find({_id: req.params.taskId, user: req.userData.userId})
    .select('_id name created isDone end') //show only these Properties
    .exec() // return Promise Object
    .then((task_doc) => {
      if (!task_doc) {
        return res.status(404).json({
          //HTTP Status means "Not Found"
          message: 'Task not found',
        });
      }

      console.log('from MongoDB' + task_doc);
      res.status(200).json({
        //Send Response
        task: task_doc,
        request: {
          type: 'GET',
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.task_update = (req, res, next) => {
  const id = req.params.taskId;
  const updateOps = {}; // here we create an object which be filled with properties to change

  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value; //add a property with value
  }

  Task.updateOne({ _id: id, user: req.userData.userId }, { $set: updateOps })
    .exec() //return Promise
    .then((result) => {
      console.log(result);
      res.status(200).json({
        //HTTP Status means "OK"
        message: 'Task Updated',
        request: {
          type: 'PATCH',
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        //HTTP Status means "Internal Server Error"
        error: err,
      });
    });
};

exports.task_delete = (req, res, next) => {
  const id = req.params.taskId;
  Task.deleteOne({ _id: id, user: req.userData.userId })
    .exec() //return Promise and use then(), catch()
    .then((result) => {
      if (result.deletedCount === 0) {
        res.status(200).json({
          //HTTP Status means "OK"
          message: 'There is no Task to delete. Task does not exist',
          request: {
            type: 'DELETE',
          },
        });
      } else {
        res.status(200).json({
          //HTTP Status means "OK"
          message: 'Task has been deleted',
          request: {
            type: 'DELETE',
          },
        });
      }
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        //HTTP Status means "Internal Server Error"
        error: err,
      });
    });
};