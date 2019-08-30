let dataObject;
$(function() {
    $("#modal").modal();
    if (!localStorage.getItem("data")) {
        $.getJSON("./data.json", function(data) {
            dataObject = data;
            localStorage.setItem("data", JSON.stringify(data));
            getReady();
        })
    } else {
        dataObject = JSON.parse(localStorage.getItem("data"))
        getReady();
    }
    // let body = document.getElementById("menu-body");

    // body.addEventListener("touchstart", drag, false);
    // body.addEventListener("touchmove", function() {}, false);
    // body.addEventListener("touchend", drop, false);
    // body.addEventListener("touchcancel", function() {}, false);

})

function resetData() {
    localStorage.clear();
    location.reload();
}

function getReady() {
    getMenuReady();
    getTablesReady();
}

function allowDrop(e) {
    e.preventDefault();
}

function drag(e) {
    //console.log(e)
    console.log(e)
        //e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("id", e.target.id);
    //e.dataTransfer.setDragImage(e.target, 0, 0);

}

function drop(e) {
    e.preventDefault();
    let itemId = e.dataTransfer.getData("id");
    let index = e.path.findIndex(obj => obj.dataset.type && obj.dataset.type == "table")
    let tableId = e.path[index].id;
    let itemObj = dataObject.items.find(obj => obj.id == itemId);
    let tableObj = dataObject.tables.find(obj => obj.id == tableId);
    //console.log(itemId, index, e.path)
    if (!tableObj.items[itemId])
        tableObj.total_items += 1;
    tableObj.items[itemId] = tableObj.items[itemId] ? tableObj.items[itemId] + 1 : 1;
    tableObj.total_amount += itemObj.cost;
    changeATable(tableObj);
    localStorage.setItem("data", JSON.stringify(dataObject));
}

function onMenuSearchChange() {
    let searchKey = $(this).val();
    if (searchKey != "") {
        $("#menu-search-close").show();
    } else {
        $("#menu-search-close").hide();
    }
    $("#menu-body").html(getMenuBody(searchKey));
}

function onTableSearchChange() {
    let searchKey = $(this).val();
    if (searchKey != "") {
        $("#tables-search-close").show();
    } else {
        $("#tables-search-close").hide();
    }
    $("#tables-body").html(getTablesBody(searchKey));
}

function onModalInputChange(event, tableObj) {
    console.log(event.target.value, tableObj)
    let itemId = parseInt(event.target.id.slice(2));
    let newCount = event.target.value;
    let oldCount = tableObj.items[itemId];
    let itemCost = getItem(itemId).cost;
    tableObj.items[itemId] = newCount;
    tableObj.total_amount += (newCount - oldCount) * itemCost;
    changeATable(tableObj);
    updateModalBody(tableObj);
    localStorage.setItem("data", JSON.stringify(dataObject));
}

function changeATable(tableObj) {
    $("#" + tableObj.id).html(`
    <div class="card-panel">
        <h5>${tableObj.name}</h5>
        <span>Rs.${tableObj.total_amount} | Total items: ${tableObj.total_items}</span>
    </div>`);
}

function clearMenuSearch() {
    $("#menu-search").val("");
    $("#menu-search").trigger("input");
}

function clearTablesSearch() {
    $("#tables-search").val("");
    $("#tables-search").trigger("input");
}

function getItem(id) {
    return dataObject.items.find(obj => obj.id == id);
}

function getTable(id) {
    return dataObject.tables.find(obj => obj.id == id);
}

function deleteItemFromTable(tableId, itemId) {
    let tableObj = getTable(tableId);
    tableObj.total_items -= 1;
    let count = tableObj.items[itemId];
    tableObj.items[itemId] = undefined;
    tableObj.total_amount -= getItem(itemId).cost * count;
    localStorage.setItem("data", JSON.stringify(dataObject));
    changeATable(tableObj);
    updateModalBody(tableObj);
}

function closeSession(tableId) {
    //console.log(event);
    dataObject.tables.forEach(obj => {
        if (obj.id == tableId) {
            obj.total_items = 0;
            obj.total_amount = 0;
            obj.items = {};
            changeATable(obj);
        }
    })
    localStorage.setItem("data", JSON.stringify(dataObject));
}

function updateModalBody(tableObj) {
    let out = "";
    let tableId = tableObj.id;
    if (tableObj.total_items == 0) {
        out = `<div class="empty-table">Empty Order</div>`;
    } else {
        out = `<table class="highlight">
            <thead class="table-head">
                <tr>
                    <th>S.No</th>
                    <th>Item</th>
                    <th>Price</th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>`;
        //console.log(tableObj)
        let index = 1;
        for (let itemId in tableObj.items) {
            let item = getItem(itemId);
            let count = tableObj.items[itemId];
            if (!count) continue;
            //console.log(item.cost, count)
            out += `<tr>
                <td>${index++}</td>
                <td>${item.name}</td>
                <td>${item.cost * count}</td>
                <td>
                    <div class="input-field" >
                        <input class="modal-input" type="number" value="${count}" id="in${itemId}" min=1 required>
                        <label class="active" for="in${itemId}">Number of Serving</label>
                    </div>
                </td>
                <td><i class="material-icons right cursor-pointer delete" onclick="deleteItemFromTable(${tableId}, ${itemId})">delete</i></td>
            </tr>`;
        }
        out += `<tr id="total">
                <td></td>
                <td></td>
                <td>Total: ${tableObj.total_amount}</td>
            </tr>
        </tbody>
        </table>`;
    }
    $("#modal-body").html(out);
    $("#close-session").attr("onclick", `closeSession(${tableId})`);
    $(".modal-input").on("change", (event) => onModalInputChange(event, tableObj));
}

function openModal(e) {
    let index = e.path.findIndex(obj => obj.dataset.type && obj.dataset.type == "table")
    let tableId = e.path[index].id;
    let tableObj = dataObject.tables.find(obj => obj.id == tableId)
        //console.log(tableId);
    $("#modal-head-name").html(tableObj.name);
    updateModalBody(tableObj);
    $("#modal").modal("open");
}

function getTablesBody(searchKey) {
    let out = ""
    searchKey = searchKey.toLowerCase();
    dataObject.tables.forEach(obj => {
        if (obj.name.toLowerCase().includes(searchKey))
            out += `<div class="col s6 m12" data-type="table" id="${obj.id}" onclick="openModal(event)" ondrop="drop(event)" ondragover="allowDrop(event)">
                <div class="card-panel">
                    <h5>${obj.name}</h5>
                    <span>Rs.${obj.total_amount} | Total items: ${obj.total_items}</span>
                </div>
            </div>`;
    });
    return out;
}

function getMenuBody(searchKey) {
    let out = "";
    searchKey = searchKey.toLowerCase();
    dataObject.items.forEach(obj => {
        if (obj.type.toLowerCase().includes(searchKey) || obj.name.toLowerCase().includes(searchKey))
            out += `<div class="col s6 m4">
                <div id="${obj.id}" class="card-panel" draggable="true" ondragstart="drag(event)">
                    <span class="food-type">${obj.type}</span>
                    <h5>${obj.name}</h5>
                    <span>Rs.${obj.cost}</span>
                </div>
            </div>`;
    });
    return out;
}
async function getMenuReady() {
    const menu = $("#menu");
    let out = `<div class="col s12">
        <h6 class="center-align" onclick="resetData()">Menu</h6>
        <div class="card-panel search">
            <input id="menu-search" type="text" placeholder="search" style="display: inline">
            <i id="menu-search-close" onclick="clearMenuSearch()" class="tiny material-icons close">close</i>
        </div>
    </div><div id="menu-body">`;

    out += getMenuBody("") + "</div>";

    menu.html(out);
    $('#menu-search').on('input', onMenuSearchChange);
}

async function getTablesReady() {
    const tables = $("#tables");
    let out = `<div class="col s12 center-align">
        <h6>Tables</h6>
        <div class="card-panel search">
            <input id="tables-search" type="text" placeholder="search">
            <i id="tables-search-close" onclick="clearTablesSearch()" class="tiny material-icons close">close</i>
        </div>
    </div><div id="tables-body">`;

    out += getTablesBody("") + "</div>";

    tables.html(out);
    $('#tables-search').on('input', onTableSearchChange);
}