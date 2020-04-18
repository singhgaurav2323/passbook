


// BUDGET CONTROLLER
var budgetController = (function() {

    var Expense = function(id, description, amount) {
        this.id  = id;
        this.description = description;
        this.amount = amount;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.amount/ totalIncome)*100);
        } else {
            this.percentage = -1;
        }
    };   

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, amount) {
        this.id  = id;
        this.description = description;
        this.amount = amount;
    };

    var calcuateTotal = function(type) {
       var sum =0;
       data.all_Items[type].forEach(function(curr) {
           sum += curr.amount;
       }); 
       data.totals[type] = sum;

    };

    var data = {
        all_Items : {
            exp :[],
            inc :[]
        },

        totals :{
            exp :0,
            inc :0
        },

        budget : 0,
        percentage : -1
    }

    return {
        addItem : function(type, des, val) {
            var newItem, ID;
            
            // Create new ID
            if (data.all_Items[type].length > 0) {
                ID =data.all_Items[type][data.all_Items[type].length - 1].id +1;
            } else {
                ID =0;
            }
            

            // Create new Item
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push new item into data based on 'inc' or 'exp' type
            data.all_Items[type].push(newItem);

            // Return the new element
            return newItem;
        },

        deleteItem : function(type, id) {
            var index, ids;

            ids = data.all_Items[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.all_Items[type].splice(index, 1);
            }

        },

        calculateBudget : function() {

            //calculate total income and expense
            calcuateTotal('inc');
            calcuateTotal('exp');

            // calculate the Budget: income - expense
            data.budget = data.totals.inc - data.totals.exp;

            // calcuate the percentage of income we spent
            if (data.totals.inc>0){
                data.percentage = (data.totals.exp / data.totals.inc)*100;
            } else {
                data.percentage =-1;
            }
            
        },

        calcuatePercentages : function() {

            data.all_Items.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);                
            });
        },

        getPercentages  :function () {
            var allPer = data.all_Items.exp.map(function(cur){
                return cur.getPercentage();
            });

            return allPer;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing : function () {
            console.log(data);
        }
    };

}) ();


// UI CONTROLLER
var UIController = (function() {


    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;
        /*
            + or - before number
            exactly 2 decimal points
            comma separating the thousands

            2310.4567 -> + 2,310.46
            2000 -> + 2,000.00
            */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };


    return {
        getInput : function() {
            return {
                type : document.querySelector('.add__type').value,
                description : document.querySelector('.add__description').value,
                amount : parseFloat(document.querySelector('.add__value').value)
            };
        },

        addListItem : function(obj, type) {
            var html, newHtml, element;

            // create HTML string with placeholder
            if (type === 'inc'){
                element = '.income__list';
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %amount%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else {
                element = '.expenses__list';
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %amount%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the HTML place holder

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%amount%', formatNumber(obj.amount, type));

            // Insert the HTML into the DOM

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem : function(elementID) {

            var el = document.getElementById(elementID);
            el.parentNode.removeChild(el);
        },

        clearFields : function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll('.add__description'+','+'.add__value');
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value ="";
            });

            fieldsArr[0].focus();
        }, 

        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll('.item__percentage');
            
            var nodeListForEach = function(list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            }
            nodeListForEach(fields, function(current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },

        budgetdisplay : function(obj) {
            document.querySelector('.budget__value').textContent = obj.budget;
            document.querySelector('.budget__income--value').textContent = obj.totalInc;
            document.querySelector('.budget__expenses--value').textContent = obj.totalExp;
            document.querySelector('.budget__expenses--percentage').textContent = obj.percentage.toFixed(2)+'%';
        }
    }

}) ();


// GLOBAL APP CONTROLLER
// var controller = (function(budgetController, UIController) {

//     // Some code

// }) (budgetCtrl, uICtrl);


var updateBudget = function() {

    // 1. Calculate the Budget
    budgetController.calculateBudget();

    // 2. Return the Budget
    var budget = budgetController.getBudget();

    // 3. Display the Budget the UI
    UIController.budgetdisplay(budget);
    

};


var updatePercentages = function() {

    //1. Calculate Percentages
    budgetController.calcuatePercentages();

    //2. Read percentages from the budget controller
    var percentages = budgetController.getPercentages();

    //3. Display the updated one
    UIController.displayPercentages(percentages);
};


var ctrladdItem = function(){
    var newItem, items;

    // get the Field input Data
    items = UIController.getInput();

    if (items.description !== "" && items.amount>0 && !isNaN(items.amount)){

         //Add the item to the budget
        newItem = budgetController.addItem(items.type, items.description, items.amount);
    
         // Add the item to the UI
    
        UIController.addListItem(newItem, items.type);
    
        // Clear the fields
    
        UIController.clearFields();
            
        // Calculate and Update the Budget

        updateBudget();

        // Calculate and update the percentage
        updatePercentages();

    }
};

var ctrlDeleteItem = function (event) {
    var itemID, splitID, tpe, ID;

    itemID =  event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {

        splitID = itemID.split('-');
        type = splitID[0];
        ID = parseInt(splitID[1]);

        // 1. delete the item from the Data Structure
        budgetController.deleteItem(type, ID);

        // 2. Delete the item from the UI
        UIController.deleteListItem(itemID);
        
        // 3. Update and show the new UI
        updateBudget();

        // 4. Calculate and update the percentage
        updatePercentages();

    }

};

init =function() {
    console.log('Application successfully started');

    months = ['January', 'Feburary', 'March', 'April', 'May', 'June', 'July', 'August', 'September','November', 'December'];
    var d = new Date();
    document.querySelector('.budget__title--month').textContent = months[d.getMonth()] +' '+ d.getFullYear();

    UIController.budgetdisplay({
        budget :0,
        totalInc :0,
        totalExp :0,
        percentage :-1
    });
} ();

document.querySelector('.add__btn').addEventListener('click', ctrladdItem);

document.addEventListener('keypress', function(event) {
    if (event.keyCode === 13 || event.which === 13) {
        ctrladdItem();
    }
});

document.querySelector('.container').addEventListener('click', ctrlDeleteItem);