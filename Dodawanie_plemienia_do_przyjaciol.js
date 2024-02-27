var currentUrl = window.location.href;
var yourVillage = currentUrl.toString().substring(currentUrl.toString().indexOf("=")+1, currentUrl.toString().indexOf("&"));
var world = currentUrl.toString().substring(currentUrl.toString().indexOf("/")+2, currentUrl.toString().indexOf("."));
var baseUrl = "https://"+world+".plemiona.pl";
var tribesId = []
var playersId = []
var pressed = false;
 
function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}
 
 
function httpPost(theUrl, value, h) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", theUrl, false);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    var data = {
        'name': value[0],
        'h': h
    }
 
    var formBody = [];
    for (var property in data) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(data[property]);
    formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
 
 
    xhr.send(formBody);
}
 
function getByValue(map, searchValue) {
    for (let [key, value] of map.entries()) {
        if (value === searchValue)
        return key;
    }
    return null;
}
 
var startDialog = Dialog.show(
    'Script', '<div id="dudialog">Lista plemiona do dodania<br><textarea id="ScriptAlly" placeholder="Lista skrotow plemion, każdy w nowej linii bez dodatkowych znaków (w tym spacji)"  style="width: 96%; margin: 0px auto 0px auto; border: 1px solid rgb(129, 66, 2);" required></textarea><button type="button" onclick="handleButtonEvent()" style="border-radius: 5px; border: 1px solid #000; color: #fff; background: linear-gradient(to bottom, #947a62 0%,#7b5c3d 22%,#6c4824 30%,#6c4824 100%)">Wygeneruj zaproszenia!</button><br>Po zakcpetowaniu prosze poczekac na wygenerowanie listy graczy...<br><br><table id="buttons-script"></table></div>'
)
 
var handleButtonEvent = () => {
    if (!pressed) {
        ally = document.getElementById('ScriptAlly').value.split('\n');
        getTribesId(ally);
        getPlayersid();
        invitePlayers()
        console.log("Dodani!");
    }
    pressed = true;
}
 
var showHowManyPlayersToAdd = () => {
    let number = playersId.length;
    $(document).ready(function() {
        $('#dudialog')[0].append(`Znaleziono ${number} graczy do dodania. Wygeneruj zaproszenia!`);
    })
} 
 
var invitePlayers = () => { 
    displayPlayers();
 
    var table = $('#buttons-script')[0];
 
 
    playersId.forEach( (value, index) => {
        let url = TribalWars.buildURL('POST', 'buddies' , {action: 'add_buddy'}) 
        let h = url.substring(url.indexOf("h=")+2, url.toString().length);
        url = url.substring(0, url.indexOf("h=")-1);
 
        var row = table.insertRow();
        row.className = 'row_a';
        let button = document.createElement("button");
        let td = document.createElement("td");
        button.className = "btn_add"
        button.innerHTML = `Dodaj ${value.toString().split(",")[0]}`;
        button.onclick = () => {
            console.log(`adding ${value.toString().split(",")[0]}`);
            httpPost(url, value, h);
            td.remove(button);
        }
        td.append(button);
        row.append(td);
    });
}
 
function displayPlayers() {
    return showHowManyPlayersToAdd();
}
 
var getTribesId = (ally) => {
    var tribesUrl = baseUrl + "/map/ally.txt";
    var allTribes = httpGet(tribesUrl).split('\n');
    var allTribesMap = new Map();
    allTribes.forEach((tribe, index) => {
        let id = Number(tribe.split(",")[0]);
        let acronyme = decodeURIComponent(tribe.split(",")[2]);
        allTribesMap.set(id, acronyme)
    }) 
 
    ally.forEach((ally, index) => {
        var plemieId = getByValue(allTribesMap, ally);
        if (plemieId != null) 
            tribesId.push(plemieId);
    })
 
}
 
var getPlayersid = () => {
    var playersUrl = baseUrl + "/map/tribe.txt";
    var allPlayers = httpGet(playersUrl).split('\n');
    var allPlayersMap = new Map();
    allPlayers.forEach((player, index) => {
        let id = Number(player.split(",")[0]);
        let nickName = decodeURIComponent(player.split(",")[1]);
        nickName = nickName.replace(new RegExp("\\+","g"),' ');
        let tribeId = Number(player.split(",")[2]);
        allPlayersMap.set([nickName, id], tribeId);
    })
 
    allPlayersMap.forEach( (value, key) => {
        if (tribesId.includes(value)) {
            playersId.push(key);
        }
    })
} 
