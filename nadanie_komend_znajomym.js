if (typeof zabierzKomendyPozostalym === 'undefined') {
    alert('Skrypt został zaktualizowany, używasz starej wersji. Sprawdź najnowszą na forum plemiona w skryptotece!')
    
} else {
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

