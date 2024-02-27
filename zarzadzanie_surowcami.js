;(function() {
 
            var snob_cost = [
                ['grubas', 40000, 50000, 50000],
                ['moneta', 28000, 30000, 25000]
            ];
 
 
            var v = game_data.village;
            var res = [v.wood_float,v.stone_float,v.iron_float];
            var inc = [v.wood_prod,v.stone_prod,v.iron_prod];
            add = (a,b) => a+b;
            hasEnough = (a,b) => a.every((v,i) => v >= b[i]);
            diff = (a,b) => a.map((v,i) => v - b[i]);
            sum = (a,b) => a.map((v,i) => v + b[i]);
            round = v => Math.round(v * 100) / 100;
 
            var table_content = [];
            for(var i =0;i<2;i++){
                var cost = [];
                for (var k =1;k<4;k++) 	cost.push(Number(snob_cost[i][k]));
                if (hasEnough(res,cost)) continue;
                var needs = [];
                for (var k =0;k<3;k++) needs.push(cost[k]-res[k]);
                var currTime = Math.max(...needs.map((v,i) => (v <= 0 ? 0 : v/inc[i])));
                var minTime = Math.max((cost.reduce(add) - res.reduce(add)) / (inc.reduce(add)),0);
 
                var optimal = diff(needs,inc.map(x => x*minTime));
                var waited = diff(needs,inc.map(x => x*currTime));
 
                var worstTime = new Date()
                worstTime.setSeconds(worstTime.getSeconds() + round(currTime))
 
                var bestTime = new Date()
                bestTime.setSeconds(bestTime.getSeconds() + round(minTime));
                d = Number(round(currTime-minTime));
                var h = Math.floor(d / 3600);
                var m = Math.floor(d % 3600 / 60);
                var s = Math.floor(d % 3600 % 60);
 
                var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
                var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
                var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
 
                table_content.push({
                    name: snob_cost[i][0],
                    level: "najszybciej",
                    optimal: optimal,
                    waited : waited,
                    currTime: currTime,
                    currTimeDate: worstTime.toLocaleString(),
                    minTimeDate:  bestTime.toLocaleString(),
                    minTime: minTime,
                    timeSaved: hDisplay +  mDisplay  + sDisplay
                });
            }
 
            var gui ='<table width="700" class="vis" id="grubasa_postaw"><thead><tr><th rowspan="2" width="300">Pałac</th><th colspan="3">Surowce</th><th colspan="3">Czasy</th></tr><tr><th width="300">Drewno</th><th width="300">Glina</th><th width="300">Żelazo</th><th>Obecny</th><th>Minimalny</th><th>Oszczędność</th></tr></thead><tbody></tbody></table>';
            Dialog.show('ht',gui);            
            woodInfo = v => `<td><span class="icon header wood "> </span>${round(v)}</td>`
            stoneInfo = v => `<td><span class="icon header stone"> </span>${round(v)}</td>`
            ironInfo = v => `<td><span class="icon header iron"> </span>${round(v)}</td>`
            var table = $('#grubasa_postaw')[0];
            addToTable = info => {
                var r1 = table.insertRow();
                r1.className = 'row_a';
                r1.innerHTML = `<td><strong>${info.name}<strong></td>${woodInfo(info.waited[0])}${stoneInfo(info.waited[1])}${ironInfo(info.waited[2])}<td>${info.currTimeDate}</td><td/><td rowspan="2">${info.timeSaved}<td/>`;
                var r2 = table.insertRow();
                r2.className = 'row_b';
                r2.innerHTML = `<td>${info.level}</td>${woodInfo(info.optimal[0])}${stoneInfo(info.optimal[1])}${ironInfo(info.optimal[2])}</td><td><td>${info.minTimeDate}</td>`;
 
            }
            table_content.forEach(e => addToTable(e));  
    })();
