
var trusted = config.trusted.map(item => item.trim().toLowerCase());
var zabierzKomendyPozostalym = config.zabierzKomendyPozostalym;

if (typeof zabierzKomendyPozostalym === 'undefined') {
    alert('Skrypt zostal zaktualizowany, uzywasz starej wersji. sprawdz najnowsza na forum plemiona w skryptotece!')
    
} else {
    const tableRows = document.querySelectorAll('form table.vis tbody tr');
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
        const saveButton = document.querySelector('input[type="submit"].btn');
        if (saveButton) {
            saveButton.click();
        }
    }
}
