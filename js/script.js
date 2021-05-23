
//DOM elements
    let guestTables = document.querySelector("#guestTables");
    let guestName = document.querySelector("#guestname");
    let bookedtables = document.querySelector("#bookedtables"); // initially dispaly:none;
    let clear = document.querySelector("#clear");
    let itemsmenubar = document.querySelectorAll(".itemsmenubar");
    let itemsdropdownlist = document.querySelector("#itemsdropdownlist");
    let itemsList = document.querySelector(".items-list");  // items with images and desc and price to be displayed on selecting from dropdown
//DOM elements

//Variables
    let userSelectedItem = [];
    let selectedUserTable = {};
    let guests = [];
    let bookedGuests = [];
    let guestCount = 1;
    let selectedMenu = "drinks";
    let jsondata = localStorage.getItem("JSONdata") ? JSON.parse(localStorage.getItem("JSONdata")) : JSONdata;
    // let bookedTables = localStorage.getItem("bookedTables") ? JSON.parse(localStorage.getItem("bookedTables")) : [];
//Variables


// clear all localstorage data for testing purpose
    clear.addEventListener("click", () => {
        guests = [];
        bookedGuests = [];
        selectedMenu = "drinks";
        guestCount = 1;
        localStorage.removeItem("JSONdata");
        localStorage.removeItem("bookedTables");
        populateTable(JSONdata.tables);
        guestName.innerHTML = "";
        itemsList.innerHTML = "";
        itemsdropdownlist.style.display = "none";
        itemsmenubar.forEach( (v) => {
            v.style.display = "none";
        });
        bookedtables.style.display = "none";
        removeItemsMenuBarActiveClass();
        itemsmenubar[0].classList.add("items-menu-bar-active");
    });
// clear all localstorage data for testing purpose


//populate tables from json file
    function populateTable(tables) {
        guestTables.innerHTML = "<option value=''>--Book table--</option>";
        tables.forEach( (e) => {
            guestTables.innerHTML += `<option value='${e}'>${e}</option>`;
        });
    }
    populateTable(jsondata.tables);
    //if json data is stored in localStorage then it will fetch from there otherwise from json-items.js file
    //on first time loading it will fetch data from the json-items.js file

    function fetchGuestAndTable() {
        let booked = localStorage.getItem("JSONdata") ? JSON.parse(localStorage.getItem("JSONdata")) : null;
        if(booked){
            if(booked.guests.length > 0) {
                booked = booked['guests'];
                bookedGuests = [...booked];
                return bookedGuests;
            }
        } else {
            return false;
        }
    }
    
    function populateBookedTable() {
        //populate booked table with guests name
        let bookedGuests = fetchGuestAndTable();  // fetch user name and table which he booked
        if(bookedGuests) {
            bookedtables.style.display = "block"; // on clear change this
            bookedtables.innerHTML = "<option value=''>--Select table--</option>";
            bookedGuests.forEach( (val) => {
                bookedtables.innerHTML += `<option value='${val.name}'>${val.tableNo}</option>`;
            });
        }
        //populate booked table with guests name
    }
    populateBookedTable();
//populate tables from json file



//populate menu item
    function populateMenuItem(type) {
        itemsdropdownlist.innerHTML = "<option value=''>--Select type--</option>";
        Object.keys(type).forEach( (e) => {
            itemsdropdownlist.innerHTML += `<option value='${e}'>${e.toUpperCase()}</option>`;
        });
    }
    populateMenuItem(JSONdata.menuitems[selectedMenu]);  // on first page load drinks will populate
//populate menu item


function insertLabelName(e) {
    let selectedOption = e.options[e.selectedIndex];
    if(selectedOption.value.length > 0){
        selectedUserTable = {
            username: selectedOption.value,      // insert username no into global object
            tableno: selectedOption.text         // insert table no into global object
        };
        guestName.innerHTML = selectedOption.text + " - " + selectedOption.value;
        itemsmenubar.forEach( (v) => {
            v.style.display = "block";
        });
        itemsdropdownlist.style.display = "block";
    } else {
        itemsdropdownlist.style.display = "none";
        itemsmenubar.forEach( (v) => {
            v.style.display = "none";
        });
        guestName.innerHTML = "";
    }
}

bookedtables.addEventListener("click", function() {
    insertLabelName(this);
});


//on select table it will ask to enter the guest name who will get a particular table
    guestTables.addEventListener("click", function() {
        let selectedOption = this.options[this.selectedIndex];
        if(selectedOption.value.length) { //check whether any option is selected other than --select option--
            let name = prompt("Enter guest name please"); // if guest name is entered then ok otherwise unknown guest name
            if(name){
                name = name.trim();
                let tempGuest = {
                    name: name ? name : "Unknown guest" + guestCount++,
                    tableNo: this.options[this.selectedIndex].value
                };
                guests.push(tempGuest);
                let ls = localStorage.getItem("JSONdata") ? JSON.parse(localStorage.getItem("JSONdata")) : JSONdata;
                let remainingTables = ls.tables.filter( (val,index) => {
                    if(selectedOption.value == val)
                    return false;
                    else
                    return true;
                });  // can make this one also a module to get the remaining tables.... will work on it
                
                localStorage.setItem("JSONdata",JSON.stringify({"tables": remainingTables, "guests": guests}));
                populateTable(remainingTables);
                populateBookedTable();
            } else {
                guestTables.value = "";
            }
        }
    })
//on select table it will ask to enter the guest name who will get a particular table

function removeItemsMenuBarActiveClass() {
    itemsList.innerHTML = "";
    itemsmenubar.forEach( (v) => {
        v.classList.remove("items-menu-bar-active");
    });    
}


//menu bar click event

    itemsmenubar.forEach( (val) => {
        val.addEventListener("click", function(e){
            removeItemsMenuBarActiveClass();
            populateMenuItem(JSONdata.menuitems[val.innerHTML.toLowerCase()]);
            val.classList.add("items-menu-bar-active");
            selectedMenu = val.innerHTML.toLowerCase();
        });
    })

//menu bar click event


//show items
    function showItems(type){
        if(type.length > 0){ // food type is not empty for e.g. drinks, food, dessert
            let itemsToBeDisplayed = JSONdata.menuitems[selectedMenu][type];
            itemsList.innerHTML = "";
            itemsToBeDisplayed.forEach( (val,index) => {
                itemsList.innerHTML += `
                <div class="product-body">
                    <div class="product-left">
                        <div class="product-img">
                            <img src="images/${selectedMenu}/${type}/${val.name.toLowerCase()}.png" width="70" height="110" />
                        </div>
                    </div>
                    <div class="product-right">
                        <div class="product-desc">
                            <span>${val.name}</span><br />
                            Rs${parseInt(val.price).toFixed(2)}
                        </div>
                        <div class="product-buttons">
                            <button class="decrease" onclick="counter(${index},{child_type:'${type}',type:'${selectedMenu}', productName:'${val.name}',price:'${parseInt(val.price).toFixed(2)}'},'decrease');">-</button>
                            <button class="quantity">0</button>
                            <button class="increase" onclick="counter(${index},{child_type:'${type}',type:'${selectedMenu}', productName:'${val.name}',price:'${parseInt(val.price).toFixed(2)}'},'increase');">+</button>
                        </div>
                    </div>
                </div>`;
            });
        }
    }
    
    itemsdropdownlist.addEventListener("click", function() {
        showItems(this.options[this.selectedIndex].value);
    });
//show items

//add items to cart increment or decrement items quantity
    function counter(index, obj, action) {
        //to highlight the selected product
            let productBody = document.querySelectorAll(".product-body");
            productBody.forEach( (el) => {
                el.style.opacity = "0.4";
            });
            productBody[index].style.opacity = "1";
    
            let typ = []; // drinks,food,dessert
            typ.push(obj.type);
            let childtyp = []; // wines,water,juices,softdrinks
            childtyp.push(obj.child_type);
            let productname = [];
            productname.push(obj.productName);  // if ventura,anonymous wines type
            let price = obj.price;
            let qty = 0;   // first time will be 0 then increase according to that
            if(action == "increase"){
                qty += 1;
            } else {
                qty -= 1;
            }

            let productDetails = [
                {}
            ];



            let ob = {
                username: selectedUserTable.username,
                tableno:selectedUserTable.tableno,
                itemType:[
                    {
                        [obj.type]/*drinks,food,dessert*/: [
                            {[obj.child_type]/*water,wines,juices,softdrinks*/:[
                                {name:[obj.productName],price:[obj.price],quantity:2},
                            ]}
                        ]
                    }
                ]
            };
            console.log(ob);

            // now push to array
            // userSelectedItem
        // increment or decrement the quantity of a selected product
        // addToCart();
    }

    function addToCart() {

        //                 <table style="width:100%;" cellspacing="10">
        //                     <thead>
        //                         <tr><td style="font-size:23px;">Check</td></tr>
        //                         <tr>
        //                             <th style="text-align:left;" colspan="2">Drinks</th>
        //                             <td>$45.50</td>
        //                         </tr>
        //                     </thead>
        //                     <tbody>
        //                         <tr>
        //                             <td>Domain Serene</td>
        //                             <td>$6.00 X 2</td>
        //                             <td>$12.00</td>
        //                         </tr>
        //                         <tr>
        //                             <td>Water</td>
        //                             <td>$13.50</td>
        //                             <td>$13.50</td>
        //                         </tr>
        //                     </tbody>
        //                 </table>
        //                 <hr />

        //                 <table style="width:100%;" cellspacing="10">
        //                     <thead>
        //                         <tr>
        //                             <th style="text-align:left;" colspan="2">Food</th>
        //                             <td>$41.00</td>
        //                         </tr>
        //                     </thead>
        //                     <tbody>
        //                         <tr>
        //                             <td>Steak with Rice</td>
        //                             <td>$14.00</td>
        //                             <td>$14.00</td>
        //                         </tr>
        //                         <tr>
        //                             <td>Fish and Chips</td>
        //                             <td>$13.50 X 2</td>
        //                             <td>$27.00</td>
        //                         </tr>
        //                     </tbody>
        //                 </table>
        //                 <hr />

        //                 <table style="width:100%;" cellspacing="10">
        //                     <thead>
        //                         <tr>
        //                             <th style="text-align:left;" colspan="2">Dessert</th>
        //                             <td>$4.50</td>
        //                         </tr>
        //                     </thead>
        //                     <tbody>
        //                         <tr>
        //                             <td>Cheese Cake</td>
        //                             <td>$4.50</td>
        //                             <td>$4.50</td>
        //                         </tr>
        //                     </tbody>
        //                 </table>
        //                 <hr />
    }
//add items to cart increment or decrement items quantity