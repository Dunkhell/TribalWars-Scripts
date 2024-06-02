async function TabelaBurzena() {
    class DaneWioski {
        constructor(id, x_coords, y_coords, points) {
          this.id = id;
          this.x_coords = x_coords;
          this.y_coords = y_coords;
          this.points = points;
        }
    }

    class ZburzonaWioska {
        constructor(x_coords, y_coords, points_before, points_after) {
            this.x_coords = x_coords;
            this.y_coords = y_coords;
            this.points_before = points_before;
            this.points_after = points_after;
          }
    }

    const POINTS_BEFORE_KEY = "statystyki_przed";
    const VILLAGES_COORDS = "wioski_burzone";
    
    var currentUrl = window.location.href;
    var world = currentUrl.toString().substring(currentUrl.toString().indexOf("/")+2, currentUrl.toString().indexOf("."));
    var villagesUrl = "https://" + world + ".plemiona.pl/map/village.txt"
    let villages_coords = [];
    const csvText = await fetchCSV(villagesUrl);
    const records = parseCSV(csvText);

    function handleButtonEvent() {
        villages_coords = document.getElementById('ScriptAlly').value.split(',');
        Dialog.close();

        saveBurzenieData();
    }

    if (localStorage.getItem(POINTS_BEFORE_KEY) == null) {
        console.log('Zaciągamy dane przed burzeniem');
        window.alert("Pierwsze odpalenie skryptu, zapisuje punkty przed burzeniem");

        var startDialog = Dialog.show(
            'Script', '<div id="dudialog" style="width: 600px; height: 300px;">Lista koordynatow burzonych wiosek<br><textarea id="ScriptAlly" placeholder="Lista koordynatow burzonych wiosek, oddzielona przecinkiem"  style="width: 96%; margin: 0px auto 0px auto; border: 1px solid rgb(129, 66, 2); height: 80%" required></textarea><button type="button" id="startButton" style="border-radius: 5px; border: 1px solid #000; color: #fff; background: linear-gradient(to bottom, #947a62 0%,#7b5c3d 22%,#6c4824 30%,#6c4824 100%)">Start</button></div>'
        );

        startDialog;
        document.getElementById('startButton').addEventListener('click', handleButtonEvent);

        function saveBurzenieData() {
    
            let burzoneWioski = [];
            records.forEach(record => {
                var villageCoords = record.x_coords + "|" + record.y_coords;
                if (villages_coords.includes(villageCoords)) {
                    burzoneWioski.push(record);
                }
            });
    
            localStorage.setItem(VILLAGES_COORDS, JSON.stringify(villages_coords));
            localStorage.setItem(POINTS_BEFORE_KEY, JSON.stringify(burzoneWioski));
            window.alert("Dane zapisane! Nastepne odpalenie skryptu wygeneruje table burzenia!");
        }

        
    } else {
        window.alert("Druge odpalene skryptu, oblczam statstyk burzenia!");
        console.log('Obliczam dane po burzeniu');
        let daneBurzenia = [];
        let przedBurzeniem = JSON.parse(localStorage.getItem(POINTS_BEFORE_KEY));
        
        przedBurzeniem.forEach(wioska => {
            let poBurzeniu = getElementById(records, wioska.id);

            daneBurzenia.push(new ZburzonaWioska(wioska.x_coords, wioska.y_coords, wioska.points, poBurzeniu.points));
        })
        
        var tabela_burzenia_bbcode = "[table]\n";
        tabela_burzenia_bbcode += "[**]WIOSKA[||]PKT PRZED[||]PKT PO[||]RÓŻNICA[/**]\n"

        daneBurzenia.forEach(zburzonaWioska => {
            var roznica = zburzonaWioska.points_before - zburzonaWioska.points_after;
            var coords = zburzonaWioska.x_coords + "|" + zburzonaWioska.y_coords;
            var color;
            if (roznica >= 500) {
                color = '#ff0000';
            } else {
                color = '#0eae0e';
            }

            tabela_burzenia_bbcode += "[*][coord]"+coords+"[/coord][|][b]"+zburzonaWioska.points_before+"[/b][|][b]"+zburzonaWioska.points_after+"[/b][|][b][color="+color+"]"+roznica+"[/color][/b]\n"

        })
         
        console.log(tabela_burzenia_bbcode);

        var startDialog = Dialog.show(
            'Script', '<div id="dudialog" style="width: 600px; height: 300px;">Tabelka burzenia BB-Code<br><textarea id="ScriptAlly" style="width: 100%; height: 80%; margin: 0px auto; border: 1px solid rgb(129, 66, 2);" readonly required>' + tabela_burzenia_bbcode + '</textarea></div>'
        );

        localStorage.removeItem(POINTS_BEFORE_KEY)
    }


    async function fetchCSV(url) {
        const response = await fetch(url);
        const csvText = await response.text();
        return csvText;
    }

    function parseCSV(csvText) {
        const lines = csvText.split('\n');
        const records = [];
      
        for (let i = 0; i < lines.length; i++) { 
          const values = lines[i].split(',');
      
          if (values.length > 5) { 
            const id = parseInt(values[0], 10);
            const x_coords = parseFloat(values[2]);
            const y_coords = parseFloat(values[3]);
            const points = parseFloat(values[5]);
      
            const record = new DaneWioski(id, x_coords, y_coords, points);
            records.push(record);
          }
        }
      
        return records;
    }

    function getElementById(array, id) {
        return array.find(element => element.id === id);
    }
}

TabelaBurzena()
