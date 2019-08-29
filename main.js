let dataObject;
$(function() {
    if (!localStorage.getItem("data") || !dataObject || !dataObject.tables || !dataObject.items) {
        $.getJSON("./data.json", function(data) {
            dataObject = data;

            localStorage.setItem("data", JSON.stringify(data));
            getReady();
        })
    } else {
        dataObject = JSON.parse(localStorage.getItem("data"))
        getReady();
    }
})

function getReady() {
    getMenuReady();
    getTablesReady();
}

async function getMenuReady() {
    const menu = $("#menu");
    let out = `<div class="col s12">
        <h6 class="center-align">Menu</h6>
        <div class="card-panel search">
            <input id="menu-search" type="text" placeholder="search" style="display: inline">
            <i id="menu-search-close" class="tiny material-icons close">close</i>
        </div>
    </div>`;

    dataObject.items.forEach(obj => {
        out += `<div class="col s6 m4">
            <div id="${obj.id}" class="card-panel" draggable="true" ondragstart="drag(event)">
                <span class="food-type">${obj.type}</span>
                <h5>${obj.name}</h5>
                <span>Rs.${obj.cost}</span>
            </div>
        </div>`;
    });

    menu.html(out);
}

async function getTablesReady() {
    const tables = $("#tables");
    let out = `<div class="col s12 center-align">
        <h6>Tables</h6>
        <div class="card-panel search">
            <input id="table-search" type="text" placeholder="search">
            <i id="menu-search-close" class="tiny material-icons close">close</i>
        </div>
    </div>`;

    dataObject.tables.forEach(obj => {
        out += `<div class="col s6 m12" id="${obj.id}" ondrop="drop(event)" ondragover="allowDrop(event)">
            <div class="card-panel">
                <h5>${obj.name}</h5>
                <span>Rs.${obj.total_amount} | Total items: ${obj.items.length}</span>
            </div>
        </div>`;
    });

    tables.html(out);
}

function allowDrop(e) {
    e.preventDefault();
}

function drag(e) {
    e.dataTransfer.setData("id", e.target.id);
}

function drop(e) {
    e.preventDefault();
    let data = e.dataTransfer.getData("id");
    console.log("data", data, e.path);
    //e.target.appendChild(document.getElementById(data));
}