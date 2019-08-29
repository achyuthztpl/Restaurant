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
        // draggable="true" ondragstart="drag(event)"
        out += `<div class="col s6 m4">
            <div id="${obj.id}" class="card-panel item">
                <span class="food-type">${obj.type}</span>
                <h5>${obj.name}</h5>
                <span>Rs.${obj.cost}</span>
            </div>
        </div>`;
    });

    menu.html(out);

    dataObject.items.forEach(obj => {
        $("#" + obj.id).draggable({
            start: function(event, ui) {
                $(this).css("z-index", 12);
            },
            helper: "clone",
            cursor: "move",
            scroll: false
        });
    })
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
        // ondrop="drop(event)" ondragover="allowDrop(event)
        out += `<div class="col s6 m12">
            <div class="card-panel table" id="${obj.id}">
                <h5>${obj.name}</h5>
                <span>Rs.${obj.total_amount} | Total items: ${obj.items.length}</span>
            </div>
        </div>`;
    });
    tables.html(out);

    dataObject.tables.forEach(obj => {
        $("#" + obj.id).droppable({
            drop: function(event, ui) {
                console.log($(ui.draggable).attr("id"), $(this).attr("id"))
                $(this).css("background-color", "")
            },
            activeClass: "ui-state-default",
            hoverClass: "ui-state-hover",
            accept: ".item",
            tolerance: "pointer",
            over: function(event, ui) {
                $(this).css("background-color", "aliceblue")
            },
            out: function(event, ui) {
                $(this).css("background-color", "")
            }
        });
    })
}

function allowDrop(e) {
    e.preventDefault();
}

function drag(e) {
    console.log(e)
        //e.dataTransfer.setData("id", e.target.id);
}

function drop(e) {
    e.preventDefault();
    let data = e.dataTransfer.getData("id");
    console.log("data", data, e.path);
    //e.target.appendChild(document.getElementById(data));
}