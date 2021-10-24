//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));



// mongoose.connect("mongodb://localhost:27017/todolistDb");
const dataBaseUrl = "mongodb+srv://admin-manish:<password>@cluster0.uzggf.mongodb.net";
mongoose.connect(dataBaseUrl + "/todolistDB");

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

// different list schema
const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);





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
  const listName = req.body.list;

  const item = new Item({
    name: newItem
  });

  if (listName === "Today") {
    // "add" request came from default list "Today",list
    item.save();
    res.redirect("/");
  }else{
    // "add" request came from custom list
    List.findOne({name:listName}, function(err, foundList){
      if(!err){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+ listName);
      }
    })
  }



});


// custom url
app.get("/:customListName", function (req, res) {
  // console.log(req.params.customListName);
  let customListName = req.params.customListName;
  customListName = _.capitalize(customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (err) {
      console.log(err);
    } else {
      // list doesn't exist
      if (!foundList) {
        // console.log("doesnt exist");
        // create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // list already exist
        // print all list item
        // console.log(foundList.name);
        res.render("list", {
          listTitle: customListName,
          newListItems: foundList.items
        });
      }
    }
  });



});

app.post("/delete", function (req, res) {
  // console.log(res.body.checkBox)
  const checkedItem = req.body.checkBox;  
  const listName = req.body.listName;

  if (listName === "Today") {
    // "delete" request came from default list "Today",list
    Item.deleteOne({ _id: checkedItem }, function (err) {
      if (err) {
        console.log(err);
      } else {
        // console.log("Item deleted successfully...");
        res.redirect("/");
      };
    });
  }else{
    // "delete" request came from custom list
    // delete from an array present in any document
    List.findOneAndUpdate({name: listName}, {$pull:{items: {_id:checkedItem}}}, function(err, foundList){
      // console.log("Item deleted successfully...");
      res.redirect("/" + listName);
    });
  };
  
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log("Server Started successfully!!");
  // console.log("Server Started successfully!!\nListening to port: http://localhost:3000/")
});