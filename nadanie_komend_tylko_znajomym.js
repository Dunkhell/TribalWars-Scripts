if (typeof config !== 'undefined') {
    var zabierzKomendyPozostalym = config.zabierzKomendyPozostalym;
    var trusted = config.trusted.map(item => item.trim().toLowerCase());;
} else {
    var zabierzKomendyPozostalym = typeof zabierzKomendyPozostalym !== 'undefined' ? zabierzKomendyPozostalym : true;
    var trusted = typeof trusted !== 'undefined' ? trusted.map(item => item.trim().toLowerCase()) : [];
}

const tableRows = document.querySelectorAll('form table.vis tr');

let index = 0;
function processRow() {
    const row = tableRows[index];
    
    if (row) {
        index++;
        if (index === 1 || index === tableRows.length - 1) {
            setTimeout(processRow, 10);
        }
        const playerName = row.querySelector('td a').innerText.trim().toLowerCase();
        const shareCheckbox = row.querySelector('td input[name="share[]"]');
        const viewCheckbox = row.querySelector('td input[name="view[]"]');
        if (trusted.includes(playerName)) {
            if (shareCheckbox && viewCheckbox) {
                shareCheckbox.checked = true;
                viewCheckbox.checked = true;
            }
            setTimeout(processRow, 100); 
        }  else {
            if (zabierzKomendyPozostalym) {
                shareCheckbox.checked = false;
            }                
        }
        setTimeout(processRow, 10); 
    } else {
        setTimeout(clickSaveButton, 50); 
    }
}
processRow();
function clickSaveButton() {
    const buttons = document.querySelectorAll('input.btn');

    var button;
    if (buttons.length >= 2) {
        button = buttons[1];
    } else if (buttons.length == 1) {
        button = buttons[0];
    } else {
        // error
        console.log(' no button found to save ');
    }

    button.click();
}
