let table = document.getElementById("withdraw_selected_units_village_info").getElementsByTagName("table")[0]


let allRows = table.getElementsByTagName("tr");

let allSums = {
    spear: 0,
    sword: 0,
    axe: 0,
    spy: 0,
    light: 0,
    heavy: 0,
    ram: 0,
    catapult: 0,
    knight: 0,
    snob: 0

}

for (let i = 1; i < allRows.length; i++) {
    let villageRow = allRows.item(i);
    let village = villageRow.getElementsByTagName("td");


    for (let j = 1; j < village.length - 1; j++) {
        if (j === 1) {
            allSums.spear += Number(village[j].innerHTML);
        }
        if (j === 2) {
            allSums.sword += Number(village[2].innerHTML);

        }
        if (j === 3) {
            allSums.axe += Number(village[3].innerHTML);

        }
        if (j === 4) {
            allSums.spy += Number(village[4].innerHTML);

        }
        if (j === 5) {
            allSums.light += Number(village[5].innerHTML);

        }
        if (j === 6) {
            allSums.heavy += Number(village[6].innerHTML);

        }
        if (j === 7) {
            allSums.ram += Number(village[7].innerHTML);

        }
        if (j === 8) {
            allSums.catapult += Number(village[8].innerHTML);

        }
        if (j === 9) {
            allSums.knight += Number(village[9].innerHTML);

        }
        if (j === 10) {
            allSums.snob += Number(village[10].innerHTML);
        }
    }
}

console.log(allSums)


let result = document.createElement("table")

result.classList.add('vis', 'vis_item');
result.style.margin = '5px';
result.style.width = '100%';

let unitNames = ['spear', 'sword', 'axe', 'spy', 'light', 'heavy', 'ram', 'catapult', 'knight', 'snob']
let th_0 = document.createElement("th");
let sum = document.createElement("a");
let text = document.createTextNode("Suma wsparcia");
sum.appendChild(text);
th_0.appendChild(sum);
result.appendChild(th_0);
for (let i = 0; i < 10; i++) {
    let th = document.createElement("th");
    let info = document.createElement("a");
    info.classList.add('unit_link');
    let image = document.createElement("img");
    image.src = "https://dspl.innogamescdn.com/asset/444b680f/graphic/unit/unit_" + unitNames[i] + ".png";
    info.appendChild(image);
    th.appendChild(info);
    result.appendChild(th);
}

let tr_units = document.createElement("tr");
let td = document.createElement("td");
td.append(document.createTextNode("Suma: "))
tr_units.appendChild(td);
for (let allSumsKey in allSums) {
    console.log(allSumsKey + " = " + allSums[allSumsKey]);
    let td = document.createElement("td");
    td.innerHTML = allSums[allSumsKey];
    tr_units.appendChild(td);
}
result.appendChild(tr_units);

document.querySelector('#contentContainer').prepend(result);
