//Budget Controller module
const budgetController = (() => {
    
    class Expense {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
        }
        calcPercentage = (totalIncome) => {
                totalIncome > 0
                    ? this.percentage = Math.round((this.value / totalIncome) * 100)
                    : this.percentage = -1;
            };
        getPercentage = () =>{
                return this.percentage;
            };
    };

    class Income{
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        }
    };

    const calculateTotal = type => {
        let total = data.allItems[type].reduce((sum, item) => sum + item.value, 0);
		data.totals[type] = total;
    }

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return{
        addItem: (type, des, val) => {
            let newItem, ID;
            //vcreate
            data.allItems[type].length > 0
                ? ID = data.allItems[type][data.allItems[type].length - 1].id + 1
                : ID = 0; //Id =last ID +1

            //create new item based on exp
            type ==='exp'
                ? (newItem = new Expense(ID, des, val))
                : (newItem = new Income(ID, des, val));
            
              // push to dsata structure  
            data.allItems[type].push(newItem);
            //return the new element
            return newItem;
        },

        deleteItem: (type, id) =>{
            let ids, index;
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1 ){
                data.allItems[type].splice(index, 1)
            }
        },

        calculateBudget: () =>{
            //calculate total income and espenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate % of income that we spent
            data.totals.inc > 0
                ? data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
                : data.percentage = -1;
        },

        calculatePercentages: () =>{
            data.allItems.exp.forEach(cur => {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: () =>{
            let allPerc = data.allItems.exp.map(cur => {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: () =>{
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: () =>{
            console.log(data);
        }
    };
})();



///////////////////////////////////UI Controller module
const UIController = (() => {

    const DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec, type, full;
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
        int = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        // if (int.length > 3) {
        //     int = `${int.substr(0, int.length - 3)},${int.substr(int.length - 3, 3)}`; //input 23510, output 23,510
        // }

        dec = numSplit[1];

        if(type === 'exp'){
            full = `- ${int}.${dec}`;
        }else if(type === 'inc'){
            full =  `+ ${int}.${dec}`
        }else{
            full =  `${int}.${dec}`
        }


        return full;

    };

    const nodeListForEach = (list, callback) =>{
        for(var i = 0; i < list.length; i++){
            callback(list[i], i)
        }
    };

    return{
        getInput: () => {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: (obj, type) => {
            var html, newHtml, element;
            // Create HTML string with placeholder text
            
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = `<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                
                html = `<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
            }
            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: (selectorID) => {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: () => {
            let fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
		    fieldsArr = Array.prototype.slice.call(fields);
			fieldsArr.forEach(input => {
                input.value = "";
            });
			// Set focus on first input element
			fieldsArr[0].focus();
        },
        
        displayBudget: (obj) => {
            let type;


            if(obj.budget > 0){
                type = 'inc'
            } else if(obj.budget < 0){
                type = 'exp'
                alert(`You're over budget‼️`);
            }else{
                type = ''
            }
            // obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            obj.percentage > 0
                ? document.querySelector(DOMstrings.percentageLabel).textContent = `${obj.percentage}%`
                : document.querySelector(DOMstrings.percentageLabel).textContent = '---';
        },

        displayPercentages: (percentages) => {

            let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, (current, index) => {
                percentages[index] > 0
                ?current.textContent = `${percentages[index]} %`
                :current.textContent = `---`;
            })

        },

        displayMonth: () =>{
            let now, year, month;
            now = new Date();
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = `${months[month]} ${year}`;
        },

        changedType: () =>{
            let fields = document.querySelectorAll(
                `${DOMstrings.inputType},${DOMstrings.inputDescription},${DOMstrings.inputValue}`
            );

            nodeListForEach(fields, cur =>{
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red')
        },
        
        getDOMstrings: () => {
            return DOMstrings ;
        }
    };

})();


//Global App Controller module
const controller = ((budgetCtrl, UICtrl) => {

    const setUpEventListners = () => {
        const DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };

    const updateBudget = () =>{
        //Calculate budget
        budgetCtrl.calculateBudget();

        //return budget
        let budget = budgetCtrl.getBudget();

        //display budget on UI
        UICtrl.displayBudget(budget);
    }

    const updatePercentages = () =>{
        //calculate percentage
        budgetCtrl.calculatePercentages();
        //Read percntages from the budget controller
        let percentages = budgetCtrl.getPercentages();
        //Update the UI witht the new percentages
        UICtrl.displayPercentages(percentages);
    }

    const ctrlAddItem = () =>{
        let input, newItem;

        //Get the field input data
        input = UICtrl.getInput();

        if(input.description !=='' && !isNaN(input.value) && input.value > 0){
        //Add the item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            //Clear the fields
            UICtrl.clearFields();
            
            //Calculate and Update BUdget
            updateBudget();

            //Calculate and Update Percentages
            updatePercentages();
        }else if(input.description ==='' && isNaN(input.value)){
            alert(`Error: You didn't enter any information!`);
        }else if(input.description ===''){
            alert(`Error: You didn't enter a description!`);
        }else if(isNaN(input.value)){
            alert(`Error: You didn't enter a number!`);
        }else if(input.value < 0){
            alert(`Error: You entered a negative number!`);
        }
   };

   const ctrlDeleteItem = event => {
        let itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //delete item from data structure
            budgetCtrl.deleteItem(type, ID);
            //delete item from user interface
            UICtrl.deleteListItem(itemID);
            //update & show new budget
            updateBudget();
            //Calculate and update percentages
            updatePercentages();
        }
    };


   return{
       init: () =>{
            console.log('Application has started.');
            UICtrl.displayMonth();
           UICtrl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: -1
        });
           setUpEventListners();
       }
   }

})(budgetController, UIController);

controller.init();