export default function createMockServer() {
    const fakeData = [
        {
            id: 1,
            name: 'Cursed Blade',
            type: 'Sword',
            rarity: 4,
            attack_power: 1200,
            element: 'Fire',
            crit_rate: 0.25,
            crit_damage: 1.8,
            effect_description: 'Deals increased damage to cursed enemies',
            level: 20,
            upgrade_cost: 15000,
            creation_date: '2022-03-15'
        },
        {
            id: 2,
            name: 'Haunted Greataxe',
            type: 'Axe',
            rarity: 5,
            attack_power: 1800,
            element: 'Dark',
            crit_rate: 0.18,
            crit_damage: 2.1,
            effect_description: 'Has a chance to curse enemies on hit',
            level: 25,
            upgrade_cost: 25000,
            creation_date: '2021-11-28'
        },
        {
            id: 3,
            name: 'Otherworldly Dagger',
            type: 'Dagger',
            rarity: 3,
            attack_power: 900,
            element: 'Arcane',
            crit_rate: 0.3,
            crit_damage: 1.5,
            effect_description: 'Teleports the user behind the target on critical hits',
            level: 15,
            upgrade_cost: 10000,
            creation_date: '2022-08-02'
        },
        {
            id: 4,
            name: 'Unholy Greatsword',
            type: 'Sword',
            rarity: 4,
            attack_power: 1600,
            element: 'Dark',
            crit_rate: 0.22,
            crit_damage: 1.9,
            effect_description: 'Drains life from enemies on hit',
            level: 22,
            upgrade_cost: 20000,
            creation_date: '2021-06-14'
        },
        {
            id: 5,
            name: 'Spectral Bow',
            type: 'Bow',
            rarity: 5,
            attack_power: 1700,
            element: 'Arcane',
            crit_rate: 0.2,
            crit_damage: 2.3,
            effect_description: 'Arrows pass through multiple enemies',
            level: 26,
            upgrade_cost: 28000,
            creation_date: '2022-01-05'
        },
        {
            id: 6,
            name: 'Abyssal Mace',
            type: 'Mace',
            rarity: 3,
            attack_power: 1100,
            element: 'Dark',
            crit_rate: 0.28,
            crit_damage: 1.6,
            effect_description: 'Chance to stun enemies on hit',
            level: 18,
            upgrade_cost: 12000,
            creation_date: '2021-09-22'
        },
        {
            id: 7,
            name: 'Cursed Scythe',
            type: 'Scythe',
            rarity: 4,
            attack_power: 1400,
            element: 'Dark',
            crit_rate: 0.24,
            crit_damage: 2.0,
            effect_description: 'Deals increased damage to cursed enemies',
            level: 21,
            upgrade_cost: 18000,
            creation_date: '2022-04-30'
        },
        {
            id: 8,
            name: 'Infernal Scepter',
            type: 'Staff',
            rarity: 5,
            attack_power: 1900,
            element: 'Fire',
            crit_rate: 0.19,
            crit_damage: 2.2,
            effect_description: 'Periodically inflicts the target with a cursed burn effect',
            level: 27,
            upgrade_cost: 30000,
            creation_date: '2021-12-10'
        },
        {
            id: 9,
            name: 'Haunted Crossbow',
            type: 'Crossbow',
            rarity: 3,
            attack_power: 1000,
            element: 'Dark',
            crit_rate: 0.32,
            crit_damage: 1.4,
            effect_description: 'Arrows have a chance to ricochet and hit additional targets',
            level: 16,
            upgrade_cost: 11000,
            creation_date: '2022-07-18'
        },
        {
            id: 10,
            name: 'Cursed Cannon',
            type: 'Cannon',
            rarity: 4,
            attack_power: 1500,
            element: 'Dark',
            crit_rate: 0.21,
            crit_damage: 2.1,
            effect_description: 'Deals increased damage to heavily armored enemies',
            level: 23,
            upgrade_cost: 22000,
            creation_date: '2021-08-03'
        }
    ];

    class MockServer {
        constructor() {
            this.connections = {};
            this.nextConnectionId = 0;
            this.init(fakeData);
            setInterval(this.periodicallyUpdateData.bind(this), 100);
        }

        periodicallyUpdateData() {
            // keep a record of all the items that changed
            var changes = [];

            // make some mock changes to the data
            this.makeSomePriceChanges(changes);
            this.makeSomeVolumeChanges(changes);

            // inform the connections of the changes where appropriate
            this.informConnectionsOfChanges(changes);
        }

        informConnectionsOfChanges(changes) {
            var that = this;
            // go through each connection
            Object.keys(this.connections).forEach(function (connectionId) {
                var connection = that.connections[connectionId];
                // create a list of changes that are applicable to this connection only
                var changesThisConnection = [];
                changes.forEach(function (change) {
                    // see if the index of this change is within the connections viewport
                    var changeInRange = change.rowIndex >= connection.firstRow && change.rowIndex <= connection.lastRow;
                    if (changeInRange) {
                        changesThisConnection.push(change);
                    }
                });
                // send msg to this connection if one or more changes
                if (changesThisConnection.length > 0) {
                    that.sendEventAsync(connectionId, {
                        eventType: 'dataUpdated',
                        changes: changesThisConnection,
                    });
                }
            });
        }

        makeSomeVolumeChanges(changes) {
            // not applicable to the fake data, so we don't need to implement this
        }

        makeSomePriceChanges(changes) {
            // not applicable to the fake data, so we don't need to implement this
        }

        init(allData) {
            this.allData = allData;
        }

        connect(listener) {
            var connectionId = this.nextConnectionId;
            this.nextConnectionId++;
            // keep a record of the connection
            this.connections[connectionId] = {
                // the client callback that receives the events
                listener: listener,
                // we keep track of the rows in the client, so when the viewport changes,
                // we only send rows that are new, eg if viewport is length 10, and moves 2
                // positions, we only send the 2 new rows, as the client already has 8 of them
                rowsInClient: {},
                // keep track of range, so when data items change, we know what to send
                firstRow: 0,
                lastRow: -1, // first row after last row, range doesn't exist
            };

            this.sendEventAsync(connectionId, {
                eventType: 'rowCountChanged',
                rowCount: this.allData.length,
            });

            return connectionId;
        }

        // pretend we are on a network, send message to client after 20ms
        sendEventAsync(connectionId, event) {
            var listener = this.connections[connectionId].listener;
            setTimeout(function () {
                listener(event);
            }, 20);
        }

        disconnect(connectionId) {
            delete this.connections[connectionId];
        }

        setViewportRange(connectionId, firstRow, lastRow) {
            var connection = this.connections[connectionId];
            connection.firstRow = firstRow;
            connection.lastRow = lastRow;

            // because the client has moved its viewport, it will have disregarded rows outside the range
            this.purgeFromClientRows(connection.rowsInClient, firstRow, lastRow);
            // send rows newly in the range
            this.sendResultsToClient(connectionId, firstRow, lastRow);
        }

        // removes any entries outside the viewport (firstRow to lastRow)
        purgeFromClientRows(rowsInClient, firstRow, lastRow) {
            Object.keys(rowsInClient).forEach(function (rowIndexStr) {
                var rowIndex = parseInt(rowIndexStr);
                if (rowIndex < firstRow || rowIndex > lastRow) {
                    delete rowsInClient[rowIndex];
                }
            });
        }

        sendResultsToClient(connectionId, firstRow, lastRow) {
            if (firstRow < 0 || lastRow < firstRow) {
                console.warn('start or end is not valid');
                return;
            }

            // we want to keep track of what rows the client has
            var rowsInClient = this.connections[connectionId].rowsInClient;

            // the map contains row indexes mapped to rows
            var rowDataMap = {};
            for (var i = firstRow; i <= lastRow; i++) {
                // if client already has this row, don't send it again
                if (rowsInClient[i]) {
                    continue;
                }
                // otherwise send the row. we send a copy of the row to mimic
                // going over network, so any further changes to the row in
                // the mock server is not reflected in the grid's copy
                rowDataMap[i] = JSON.parse(JSON.stringify(this.allData[i]));
                // and record that the client has this row
                rowsInClient[i] = true;
            }

            this.sendEventAsync(connectionId, {
                eventType: 'rowData',
                rowDataMap: rowDataMap,
            });
        }

        getRowCount() {
            return this.allData.length;
        }
    }
    return new MockServer();
}