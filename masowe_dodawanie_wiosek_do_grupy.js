var currentUrl = window.location.href;
var world = currentUrl.toString().substring(currentUrl.toString().indexOf("/") + 2, currentUrl.toString().indexOf("."));
var VILLAGE_URL = "https://" + world + ".plemiona.pl/map/village.txt";
var groups = [];
var userProvidedCoords = "";
var selectedGroup = "";


function httpPost(theUrl, dataObj) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", theUrl, false);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    const formBody = [];

    for (const key in dataObj) {
        const value = dataObj[key];
        if (Array.isArray(value)) {
            for (const v of value) {
                formBody.push(encodeURIComponent(key + "[]") + "=" + encodeURIComponent(v));
            }
        } else {
            formBody.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
        }
    }

    console.log(theUrl)
    console.log(formBody.join("&"));

    xhr.send(formBody.join("&"));
}

async function gatherUserInfo() {
    try {
        const url = "/game.php?&village=" + game_data.village.id +
            "&type=own_home&mode=units&group=0&page=-1&screen=overview_villages";

        const resp = await fetch(url, {credentials: 'same-origin'});
        if (!resp.ok) {
            console.warn('Failed to fetch groups page:', resp.status, resp.statusText);
            return [];
        }
        const html = await resp.text();

        const doc = new DOMParser().parseFromString(html, 'text/html');

        const visItem = doc.querySelector('.vis_item');
        if (!visItem) {
            console.warn('No .vis_item found in fetched HTML.');
            return [];
        }

        const grupy = visItem.getElementsByTagName('a');
        const list = [];

        for (let i = 0; i < grupy.length; i++) {
            const element = grupy[i];

            const rawText = element.textContent ? element.textContent.trim() : '';
            if (!rawText || rawText.toLowerCase() === "wszystkie") continue;

            const href = element.getAttribute('href');
            if (!href) continue;

            const match = href.match(/group=(\d+)/);
            if (!match) continue;

            const value = match[1];

            let name = rawText;
            if (name.length >= 2) {
                name = name.slice(1, name.length - 1).trim();
            }

            list.push({name, value});
        }

        groups = list;
        buildGroupUI(list);

    } catch (err) {
    }

}

function buildGroupUI(groups) {
    const container = document.createElement('div');
    container.style.padding = "12px";
    container.style.margin = "12px 0";
    container.style.border = "1px solid #888";
    container.style.background = "#f8f8f8";
    container.style.width = "400px";
    container.style.borderRadius = "6px";

    const title = document.createElement('h3');
    title.textContent = "Masowe dodawanie wiosek do grupy";
    title.style.marginTop = "0";
    container.appendChild(title);

    const input = document.createElement('textarea');
    input.placeholder = "Koordyanty wiosek, jedna pod druga bez dodatkowych znakow, na przyklad: \n123|123\n321|321\n456|678";
    input.style.width = "100%";
    input.style.height = "80px";
    input.style.boxSizing = "border-box";
    input.style.marginBottom = "10px";
    container.appendChild(input);

    const select = document.createElement('select');
    select.style.width = "100%";
    select.style.padding = "5px";
    select.style.marginBottom = "10px";

    groups.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.value;     // the group ID
        opt.textContent = g.name;
        select.appendChild(opt);
    });

    container.appendChild(select);

    const btn = document.createElement('button');
    btn.textContent = "Dodaj";
    btn.style.width = "100%";
    btn.style.padding = "8px";
    btn.style.cursor = "pointer";

    btn.onclick = () => {
        userProvidedCoords = input.value.trim();
        selectedGroup = select.value;

        console.log("userProvidedCoords =", userProvidedCoords);
        console.log("selectedGroup =", selectedGroup);

        alert("Dodam wioski do grupy, zamknij to okno i nie odswiezaj strony");

        addVillagesToGroup();
    };


    container.appendChild(btn);
    const contentTable = document.getElementById('contentContainer');
    contentTable.before(container);
}

async function addVillagesToGroup() {
    try {
        let coordinateList = userProvidedCoords
            .trim()
            .split(/\r?\n/)
            .map(l => l.trim())
            .filter(l => l);

        const response = await fetch(VILLAGE_URL);
        if (!response.ok) throw new Error("Failed to download village data");
        const text = await response.text();

        const villages = text.trim().split("\n").map(line => {
            ``
            const [id, name, x, y, puid, points, alive] = line.split(",");
            return {
                id: parseInt(id, 10),
                x: parseInt(x, 10),
                y: parseInt(y, 10),
            };
        });

        const coordMap = {};
        for (const v of villages) {
            coordMap[`${v.x}|${v.y}`] = v.id;
        }

        const villageIDs = coordinateList
            .map(c => coordMap[c.trim()])
            .filter(id => id !== undefined);

        let groupsUrl = TribalWars.buildURL('POST', 'overview_villages', {action: 'bulk_edit_villages',mode: 'groups',type: 'static'});
        const hIndex = groupsUrl.indexOf("h=");
        const h = hIndex !== -1 ? groupsUrl.substring(hIndex + 2) : "";
        groupsUrl = groupsUrl.substring(0, hIndex - 1);

        const body = {
            village_ids: villageIDs,
            selected_group: selectedGroup,
            add_to_group: "Dodaj",
            h: h
        };

        httpPost(groupsUrl, body);
        alert("Wioski dodane, mozesz opuscic te strone");
    } catch (err) {
        console.error("Error:", err);
    }
}

(async function () {

    await gatherUserInfo();
})();
