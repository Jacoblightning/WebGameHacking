// noinspection JSUnresolvedReference

// Config

// Length.                    Normal values: level 1 : 10   level 2 : 12   level 3 : 15
let LENGTH   = null;
// Probability of mutation.   Normal values: level 1 : 20%, level 2 : 30%, level 3 : 40%
let MUTATION = null;
// Maximum possible deletion. Normal values: level 1 : 2,   level 2 : 3,   level 3 : 4
let DELETION = null;


// Prompt user for LENGTH if needed
while (LENGTH === null) {
    let tmp1 = prompt("You did not specify a length in the config. What would you like the length of the sequence to be?", "50");
    let tmp2 = Number.parseInt(tmp1);
    if (!Number.isNaN(tmp2)) {
        LENGTH = tmp2;
        break;
    }
}
// Prompt user for MUTATION if needed
while (MUTATION === null) {
    let tmp1 = prompt("You did not specify a mutation probability in the config. What would you like the mutation probability to be?", "50%");
    let tmp2 = Number.parseInt(tmp1);
    if (!Number.isNaN(tmp2)) {
        MUTATION = tmp2;
        break;
    }
}
// Prompt user for DELETION if needed
while (DELETION === null) {
    let tmp1 = prompt("You did not specify a maximum deletion length in the config. What would you like the maximum deletion length to be?", "5");
    let tmp2 = Number.parseInt(tmp1);
    if (!Number.isNaN(tmp2)) {
        DELETION = tmp2;
        break;
    }
}


//----------------------------------------------------------
// Part 1: Setup

let level_three = document.getElementById("level_three");

let level_custom = level_three.cloneNode(false);

level_custom.id = "level_custom";
level_custom.innerHTML = "Custom Level";


level_three.after(level_custom);
level_three.after(" ");


// Part 2: The hack. Getting access to a closure variable

let old_level_change = level_change;

let table;

level_change = function(){
    table = arguments[1];
}

level_three.click();

level_change = old_level_change;

// Part 3: The takeover

level_custom.addEventListener("click", function(){
    level_change($(this), table, LENGTH, MUTATION, DELETION);
})