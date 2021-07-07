const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const date = require(__dirname + '/date.js');
const mongoose = require('mongoose');
const _ = require('lodash');


mongoose.connect('mongodb+srv://AdiMall:11235813@cluster0.weuvs.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));



const taskSchema = mongoose.Schema({
    task: {
        type: String
    }
});

const listSchema = mongoose.Schema({
    listName : {
        type: String
        // required: true
    },
    listItems : [taskSchema]
})

const listModel = mongoose.model('List', listSchema);
const TaskModel = mongoose.model('Task', taskSchema);

const mainListName = _.capitalize("main");
const defaultTasks = ['Welcome to your To Do List', 'Hit the + button to add a new item', '<--Hit this to delete an item'];

listModel.findOne({listName: mainListName}, function(err, list){
    if(err)console.log(err);
    else{
        if(!list){
            let mainList = new listModel({
                listName: mainListName,
                listItems: []
            })
            mainList.save();
        }
    }
})

const mainListTitle = "Today";

app.get("/", function(req, res){
    listModel.findOne({listName: mainListName}, function(err, list){
        if(err)console.log(err);
        else{
            let tasks = list.listItems;
            res.render('list', {title : mainListTitle, tasks: tasks});
        }
        
    })
})

app.get("/:listName", function(req, res){    
    let listName = _.capitalize(req.params.listName);
    if(listName === mainListTitle || listName === mainListName)res.redirect("/");
    listModel.findOne({listName : listName}, (err, list)=>{
        if(err){
            console.log(err);     
        }
        else{
            if(list){
                console.log("Found : ", list);
            }
            else{
                list = new listModel({listName : listName, listItems : []});
                list.save();
                console.log("Not found, but creating : ", list);
            }   
        }
        res.render('list', {title: listName, tasks: list.listItems});
    })
})

app.post("/:listName", function(req, res){
    let listName = _.capitalize(req.params.listName);
    if(listName === mainListTitle)listName = mainListName;
    const item = new TaskModel({
        task : req.body.newItem
    })
    item.save(function(err){
        if(err)console.log(err);
        listModel.findOne({listName: listName}, function(err, list){
            if(err)console.log(err);
            else{
                list.listItems.push(item);
                list.save(function(err){
                    if(err)console.log(err);
                    if(listName === mainListName)res.redirect("/");
                    else res.redirect("/" + listName);
                });
            }
        })  
    });
    
})

// app.post("/", function(req, res){
//     let newItem = new TaskModel({
//         task: req.body.newItem
//     })
//     newItem.save();
//     listModel.findOne({listName : mainListName}, function(err, list){
//         if(err)console.log(err);
//         else{
//             list.listItems.push(newItem);
//             list.save();
//             res.redirect("/");
//         }
//     })
// })


// app.post("/delete", function(req, res){
//     // console.log(req.body);
//     let itemId = req.body.checkbox;
//     TaskModel.deleteOne({_id: itemId}, function(err){
//         if(err)console.log(err);
//         else{
//             console.log("Item deleted");
//             res.redirect("/");
//         }

//     })
// })

app.post("/delete/:listName", function(req, res){
    let listName = _.capitalize(req.params.listName);
    if(listName === mainListTitle)listName = mainListName;
    const deleteItemId = req.body.checkbox;

    listModel.findOneAndUpdate({listName: listName}, {$pull: {listItems : {_id: deleteItemId}}}, function(err, foundList){
        if(err)console.log(err);
        else{
            console.log("Item deleted from list items successfully");
            TaskModel.deleteOne({_id: deleteItemId}, function(err){
                if(!err){
                    console.log("Item deleted from database successfully");
                    if(listName === mainListName)res.redirect("/");
                    else res.redirect("/" + listName);
                }
            })
        }
    })
})
app.listen(8000, function(){
    console.log(`Server has started listening on port 8000`);
})