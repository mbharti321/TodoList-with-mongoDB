//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const date = require(__dirname + "/date.js");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));



mongoose.connect("mongodb://localhost:27017/todolistDb");

const itemsSchema = mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to my ToDo List"
});
const item2 = new Item({
  name: "Hit + to add new item"
});
const item3 = new Item({
  name: "others"
});

const defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {
  // const day = date.getDate();
  Item.find({}, function (err, foundItems) {
    if (err) {
      console.log(err);
    } else {
      // if the list is empty
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Default data inserted succefully");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: foundItems });
      }

    }
  });
});

app.post("/", function (req, res) {

  const newItem = req.body.newItem;
  const item = new Item({
    name: newItem
  });
  item.save();
  res.redirect("/");
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.post("/delete", function (req, res) {
  // console.log(res.body.checkBox)
  const checkedItem = req.body.checkBox;
  Item.deleteOne({ _id: checkedItem }, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Item deleted successfully...");
      res.redirect("/");
    };
  });
});

app.listen(3000, function () {
  console.log("Server Started!!\nListening to port: http://localhost:3000/")
});