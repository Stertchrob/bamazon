var mysql = require("mysql");
var inquirer = require("inquirer");
var consoleTable = require("console.table");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    user: "root",

    password: "R133484rs",
    database: "bamazon_db"
});

connection.connect(function(err){
    if (err) throw err;
});

var run = function() {
    connection.query("SELECT * FROM products", function(err, results) {
        if (err) throw err;
        inquirer.prompt([
            {
                name: "select",
                type: "list",
                choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
                message: "What would you like to do?"
            }
        ]).then(function(answer) {

        switch (answer.select) {
            case "Products for Sale":
                connection.query("SELECT * FROM products", function(err, results) {
                    if (err) throw err;
                    console.table(results);
                    run();
                });
            break;
            case "Low Inventory":
                connection.query("SELECT * FROM products WHERE stock_quantity < 100", function(err, results) {
                    if (err) throw err;
                    console.table(results);
                    run();
                });
            break;
            case "Add to Inventory":
                inquirer.prompt([
                {
                    name: "productID",
                    type: "list",
                    choices: function() {
                        var choicesArray = [];
                        for (var i = 0; i < results.length; i++) {
                            choicesArray.push(results[i].product_name);
                        }
                        return choicesArray;
                    },
                    message: "Choose the product that you would like to stock:"
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "How many would you like to add?"
                }
                ]).then(function(answerTwo){
                    var chosenProduct;
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].product_name === answerTwo.product) {
                            chosenProduct = results[i];
                        }
                    }

                    connection.query("UPDATE products SET ? WHERE ?", [
                    {
                        stock_quantity: chosenProduct.stock_quantity + parseInt(answerTwo.quantity)
                    },
                    {
                        id: chosenProduct.id
                    }], function(error) {
                        if (error) throw err;
                        console.log("Stock added!");
                    })
                })
            }
        });
    });
};

run();