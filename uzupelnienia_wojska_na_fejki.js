function fillIn() {
     
    $.ajax({
        url: 'https://media.innogamescdn.com/com_DS_PL/skrypty/HermitowskiePlikiMapy.js?_=' + ~~(Date.now() / 9e6),
        dataType: 'script',
        cache: true
    }).then(() => {
        ExecuteScript();
    });
    
    function ExecuteScript() {
        get_world_info({ configs: ['unit_info', 'config'] }).then(worldInfo => {
            if (worldInfo.error !== undefined) {
                console.log("error for world info " + worldInfo)
            }
            fillTroops(worldInfo);
        })
    }
    
    
    function fillTroops(worldInfo) {
        
        let troops = selectTroops(worldInfo);
        console.log(troops);
        _selectUnits(troops, worldInfo);
    }

    function _selectUnits(units, worldInfo) {
        for (const unitName in units) {
            if (units.hasOwnProperty(unitName))
                _selectUnit(unitName, units[unitName], worldInfo);
        }
    }

    function _selectUnit(unitName, unitCount, worldInfo) {
        if (worldInfo.unit_info.hasOwnProperty(unitName) === false) {
            throw i18n.UNKNOWN_UNIT.replace('__UNIT_NAME__', unitName);
        }
        let input = _getInput(unitName);
        let maxUnitCount = Number(input.attr('data-all-count'));
        let selectedUnitCount = Number(input.val());
        unitCount = Math.min(maxUnitCount, selectedUnitCount + unitCount);
        input.val(unitCount === 0 ? '' : unitCount);
    }

    function selectTroops(worldInfo) {
        clearPlace();
        let place = getAvailableUnits();
    
        for (let template of ustawienia.templates) {
            _validateTemplate(template, worldInfo);
            if (_isEnough(template, place, worldInfo)) {
                if (_fill(template, place, worldInfo)) {
                    return template;
                }
            }
        }
    }
    
    function clearPlace() {
        $('[id^=unit_input_]').val('');  
    }
    
    function _validateTemplate(template, worldInfo) {
        for (const unit in template) {
            if (template.hasOwnProperty(unit)) {
                let count = Number(template[unit]);
                if (!worldInfo.unit_info.hasOwnProperty(unit) || isNaN(count) || count < 0) {
                    throw i18n.INVALIDustawienia_TEMPLATES
                        .replace('__UNIT_NAME__', unit)
                        .replace('__VALUE__', template[unit]);
                }
            }
        }
    }

    function _isEnough(template, placeUnits, worldInfo) {
        for (let unit in template) {
            if (template.hasOwnProperty(unit)) {
                if (!worldInfo.unit_info.hasOwnProperty(unit) || template[unit] > placeUnits[unit])
                    return false;
            }
        }
        return true;
    }

    function _slowestUnit(units, worldInfo) {
        let speed = 0;
        for (const unitName in units) {
            if (units.hasOwnProperty(unitName) && units[unitName] !== 0) {
                speed = Math.max(Number(worldInfo.unit_info[unitName].speed), speed);
            }
        }
        if (speed === 0) {
            throw i18n.NO_TROOPS_SELECTED;
        }
        return speed;
    }


    function _selectCoordinates(poll) {
        let target = poll[Math.floor(Math.random() * poll.length)];
        // _save(target);
        return target;
    }
    
    function getAvailableUnits() {
        let units = game_data.units.filter(unit => unit !== 'militia');
        let available = {};
        for (let unit of units) {
            available[unit] = Number(_getInput(unit).attr('data-all-count'));
            if (ustawienia.safeguard.hasOwnProperty(unit)) {
                let threshold = Number(ustawienia.safeguard[unit]);
                if (isNaN(threshold) || threshold < 0) {
                    throw i18n.INVALIDustawienia_SAFEGUARD
                        .replace('__UNIT_NAME__', unit)
                        .replace('__VALUE__', ustawienia.safeguard[unit]);
                }
                available[unit] = Math.max(0, available[unit] - threshold);
            }
        }
        return available;
    }

    function _sanitizeCoordinates (coordinates) {
        let coordsRegex = new RegExp(/\d{1,3}\|\d{1,3}/g);
        let match = coordinates.match(coordsRegex);
        return match == null
            ? []
            : match;
    }

    function _targetUniquePlayers(poll) {
        if (!ustawienia.targetUniquePlayers) {
            return poll;
        }

        let recentVillages = localStorage.getItem(_localContextKey);

        if (recentVillages == null) {
            return poll;
        }

        recentVillages = JSON.parse(recentVillages);

        const coords2village = new Map(worldInfo.village.map(x => [x.coords, x]));
        const recentPlayerIds = new Set([
            ...recentVillages.map(v => coords2village.get(v[0]))
                .filter(x => x)
                .map(x => x.playerId)
        ]);

        poll = poll.map(x => coords2village.get(x))
            .filter(x => x)
            .filter(x => !recentPlayerIds.has(x.playerId))
            .map(x => x.coords);

        if (poll.length === 0) {
            throw i18n.NO_MORE_UNIQUE_PLAYERS;
        }
        return poll;
    }

    function _removeUnreachableVillages(poll, troops, slowest) {
        if (troops.hasOwnProperty('snob') && Number(troops.snob) > 0) {
            let max_dist = Number(worldInfo.config.snob.max_dist);
            poll = poll.filter(coords =>
                _calculateDistanceTo(coords) <= max_dist
            );
            if (poll.length === 0) {
                goToNextVillage(i18n.COORDS_EMPTY_SNOBS);
            }
        }

        poll = poll.filter(coordinates =>
            _checkConstraints(_calculateArrivalTime(coordinates, slowest))
        );
        if (poll.length === 0) {
            goToNextVillage(i18n.COORDS_EMPTY_TIME);
        }

        return poll;
    }


    function _fill(template, place, worldInfo) {
        let left = Math.floor(game_data.village.points * Number(worldInfo.config.game.fake_limit) * 0.01);
        left -= _countPopulations(template, worldInfo);
        if ((left <= 0 || !_shouldApplyFakeLimit(template)) && !_toBoolean(ustawienia.fillExact)) {
            return true;
        }
        let fillTable = _getFillTable();
        for (const entry of fillTable) {
            let name = entry[0];
            if (!worldInfo.unit_info.hasOwnProperty(name)) continue;
            let minimum = entry[1];
            let pop = Number(worldInfo.unit_info[name].pop);
            if (!_toBoolean(ustawienia.fillExact)) {
                if (name === 'spy' &&
                    game_data.units.filter(unit => unit !== 'spy').every(unit => Number(template[unit]) > 0)) {
                    let spies = (template['spy']) ? Number(template['spy']) : 0;
                    minimum = Math.min(minimum, Math.ceil(left / pop), 5 - spies);
                } else {
                    minimum = Math.min(minimum, Math.ceil(left / pop));
                }
            }
            let selected = 0;
            if (!!template[name]) {
                selected = template[name];
            }
            minimum = Math.min(place[name] - selected, minimum);
            if (!template[name]) {
                template[name] = minimum;
            }
            else {
                template[name] += minimum;
            }
            left -= minimum * pop;
            if ((left <= 0 || !_shouldApplyFakeLimit(template)) && !_toBoolean(ustawienia.fillExact)) {
                break;
            }
        }
        return left <= 0 || !_shouldApplyFakeLimit(template);
    }

    function _countPopulations (units, worldInfo) {
        let sum = 0;
        for (const unitName in units) {
            if (units.hasOwnProperty(unitName)) {
                let pop = Number(worldInfo.unit_info[unitName].pop);
                let quantity = units[unitName];
                sum += pop * quantity;
            }
        }
        return sum;
    }

    function _getFillTable() {
        let entries = ustawienia.fillWith.split(',');
        let fillTable = [];
        for (const entry of entries) {
            let name = entry;
            let quantity = 1e9;
            if (name.indexOf(':') !== -1) {
                let parts = entry.split(':');
                name = parts[0];
                quantity = Number(parts[1]);
            }
            name = name.trim();
            fillTable.push([name, quantity]);
        }
        return fillTable;
    }

    function _shouldApplyFakeLimit (units) {
        return game_data.units.filter(unit => unit !== 'spy').some(unit => Number(units[unit]) > 0) || units['spy'] < 5;
    }

    function _toBoolean(input) {
        if (typeof (input) === 'boolean') {
            return input;
        }
        if (typeof (input) === 'string') {
            return input.trim().toLowerCase() === 'true';
        }
        return false;
    }

    function _getInput(unitName) {
        let input = $(`#unit_input_${unitName}`);
        if (input.length === 0) {
            throw i18n.NONEXISTENT_UNIT.replace('__UNIT_NAME__', unitName);
        }
        return input;
    }

    return true;
}

fillIn();
