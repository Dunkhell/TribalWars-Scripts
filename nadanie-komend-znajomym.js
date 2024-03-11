javascript:
var trusted = `
Małpa Yea Banana z Briką
Czarna Szmata
pioterek1194
Bska
KopieKartofleNaProximie
Pan Owca
Tissan
theFCMarlon
MajorKondor
Wawrzynek x Rudinek
Nezus
Chillin in a Supra
wnbvisa
Dybixx
Kecaj i Old
rojan
Baciarka
SaElion
Puffek321
Kuszel01 x SkyForce2
Dunkhell
Soraka
Trolol X Meusz
KopieKartofleNaProximie
Sir Arturwd
ZłyGandalf
WUJASZEK x Mr-Pikuś
M4tis
kruku112
Sidewipe x Dybixx
Luxery
V3nnti x Dodupuzaur
Edwardszybki x Bmw93
`.split('\n');


const tableRows = document.querySelectorAll('form table.vis tbody tr');
let index = 0;
function processRow() {
    const row = tableRows[index];
    console.log(row);
    
    if (row) {
        index++;
        if (index === 1 || index === tableRows.length - 1) {
            setTimeout(processRow, 10);
        }
        const playerName = row.querySelector('td a').innerText.trim();
        console.log(playerName);

        if (trusted.includes(playerName)) {
        console.log("pressing for " + playerName); 
        const shareCheckbox = row.querySelector('td input[name="share[]"]');
            const viewCheckbox = row.querySelector('td input[name="view[]"]');
            
            if (shareCheckbox && viewCheckbox) {
                shareCheckbox.checked = true;
                viewCheckbox.checked = true;
            }
            setTimeout(processRow, 100); 
        }
        setTimeout(processRow, 10); 
    } else {
        setTimeout(clickSaveButton, 50); 
    }
}
processRow();
function clickSaveButton() {
    const saveButton = document.querySelector('input[type="submit"].btn');
    if (saveButton) {
        saveButton.click();
    }
}
