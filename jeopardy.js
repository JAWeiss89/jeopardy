class Game {
    constructor(numOfCategories) {
        this.numOfCategories = numOfCategories;
        this.categories = [];
        this.giveButtonActions();
        this.getCategories();
    }

    async getRandomCategoryIDs() { // this function gets random verified IDs that exist in API
        let categoryIDs = [];
        let results = await axios.get(`https://jservice.io/api/random?count=${this.numOfCategories}`);
        let randomClues = results.data;
        for (let clue of randomClues) {
            categoryIDs.push(clue.category.id);
        }
        return categoryIDs;
    }

    async makeCategoryObj(catID) { // this function accepts the ID of a category and returns an object with its 5 of its questions and answers
        let results = await axios.get(`https://jservice.io/api/category?id=${catID}`)
        let category = results.data;
        let clueArr = [];
        for (let i=0; i < 5; i++) {
            let clueObj = {};
            clueObj.question = category.clues[i].question;
            clueObj.answer = category.clues[i].answer;
            clueObj.showing = null;
            clueArr.push(clueObj)
        }
        let categoryObj = {};
        categoryObj.title = category.title;
        categoryObj.clues = clueArr;
        return categoryObj;
    }

    async getCategories() { // this function pushes made category objects into the empty categories array
        let catIDs = await this.getRandomCategoryIDs();
        for (let ID of catIDs) {
            let category = await this.makeCategoryObj(ID)
            this.categories.push(category);
        }
    }

    async fillTable() { // Adds cells to the table row based on number of categories, adds a row for each question, adds divs with info from categories array
        let thead = document.querySelector('thead');
        let tbody = document.querySelector('tbody');
        let newTR = document.createElement('tr');
        for (let category of this.categories) {
            let title = category.title;
            let titleTD = document.createElement('td');
            titleTD.innerText = title;
            newTR.append(titleTD);
        }
        thead.append(newTR);
    
        for (let i= 0; i < 5; i++) {
            let newRow = document.createElement('tr');
            newRow.classList.add(`Q${i}`)
            tbody.append(newRow);
        }
    
        for (let c=0; c < this.categories.length; c++) { //for each cell, three divs are added within a larger one, each div containing info to be displayed
            for (let q= 0; q < 5; q++) {
                let newTD = document.createElement('td');
                let questionRow = document.querySelector(`.Q${q}`)
                newTD.innerHTML = `<div cat="${c}" q="${q}">
                                    <div class="hidden">?</div>
                                    <div class="question">${this.categories[c].clues[q].question}</div>
                                    <div class="answer">${this.categories[c].clues[q].answer}</div>
                                   </div> ` //outer div contains arguments cat and q that are used to identify clicked table cell.
                questionRow.append(newTD)
            }        
        }
    }

    handleClick() { //
        let $td = $('tbody td');
        let boundThis = this; // 'this' changes inside calllback function so its valued is captured in a variable later used inside callback
        $td.on('click', function(event){
            let catIndex = event.target.parentElement.attributes.cat.value; // used created attributed here to access index of what was clicked
            let questIndex = event.target.parentElement.attributes.q.value;
            let selectedBox = (boundThis.categories[catIndex].clues[questIndex]); // indeces used here to check on status of selected box
            if (!selectedBox.showing) {
                selectedBox.showing = "question";
                event.target.style.display = "none";
                event.target.nextElementSibling.style.display = 'flex';
            } else if (selectedBox.showing === "question") {
                selectedBox.showing = "answer";
                event.target.style.display = "none";
                event.target.nextElementSibling.style.display = 'flex';
            }
        })
    } 

    giveButtonActions() { // used button to call functions to begin game. Difficulty working with async functions and await. 
        let $startButton = $('.start-game');
        let $restartButton = $('.restart-game');
        let boundThis = this;
        $startButton.on('click', function(){
            boundThis.fillTable();
            boundThis.handleClick();
            $startButton.css('display', 'none');
            $restartButton.css('display', 'block');
        });
        $restartButton.on('click', function(){ // board and game is reset. Needs to wait for data to load to work properly.
            boundThis.categories=[];
            $('thead').empty();
            $('tbody').empty();
            boundThis.getCategories();
            $restartButton.css('display', 'none');
            $startButton.css('display', 'block');
        })
    }
}


$(document).ready(function() {
    let newGame = new Game(6);   
});