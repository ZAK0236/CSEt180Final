let cartItemCounter = 0;

//The following functions are for users to add and remove items from cart
if(document.readyState == "loading"){
    document.addEventListener("DOMContentLoaded", ready)
} else {
    ready()
}

function ready() {
    var removeCartItemButtons = document.getElementsByClassName('btn-danger')
    for(var i=0; i < removeCartItemButtons.length; i++) {
        var button = removeCartItemButtons[i]
        button.addEventListener('click', removeCartItem)
    }

    var quantityInputs = document.getElementsByClassName('cart-quantity-input')
    for(var i=0; i < quantityInputs.length; i++) {
        var input = quantityInputs[i]
        input.addEventListener('change', quantityChanged)
    }

    var addToCartButtons = document.getElementsByClassName('shop-item-button')
    for(var i=0; i < addToCartButtons.length; i++) {
        var button = addToCartButtons[i]
        button.addEventListener('click', addToCartClicked)
    }
    // document.getElementsByClassName('btn-purchase')[0].addEventListener('click', purchaseClicked) 
}

//Function to remove an item from your cart by clicking on the red "remove" button
function removeCartItem(event){
    var buttonClicked = event.target;
    var buttonId = buttonClicked.id; // Get the ID of the clicked button

     // Remove the cart row
     buttonClicked.parentElement.parentElement.remove();

     // Remove all hidden inputs with the same ID
     var form = document.querySelector('form');
     var matchingHiddenInputs = form.querySelectorAll('input[id="' + buttonId + '"]');
 
     matchingHiddenInputs.forEach(function (input) {
         input.remove();
     });
 
     // Update the cart total
     updateCartTotal();
 }

// This function makes it so that a negative quantity of items or 0 quantity of items cannot be purchased.
function quantityChanged(event){
    var visibleQuantityInput = event.target;
    if (isNaN(visibleQuantityInput.value) || visibleQuantityInput.value <= 0) {
        visibleQuantityInput.value = 1;
    }

    var itemId = visibleQuantityInput.name.match(/hitem-quantity(\d+)/)[1];

    // Find the corresponding hidden quantity input using the itemId
    var hiddenQuantityInput = document.querySelector('input[name="item-quantity' + itemId + '"]');

    if (hiddenQuantityInput) {
        // Update the hidden quantity input's value
        hiddenQuantityInput.value = visibleQuantityInput.value;
    }

    updateCartTotal();
}

//This function will add the title, price, and image of any item that is addedto the cart
function addToCartClicked(event){
    var button = event.target
    var shopItem = button.parentElement.parentElement
    var title = shopItem.getElementsByClassName("shop-item-title")[0].innerText
    var price = shopItem.getElementsByClassName("shop-item-price")[0].innerText
    var imageSrc = shopItem.getElementsByClassName("shop-item-image")[0].src
    addItemToCart(title, price, imageSrc)
    updateCartTotal()
}

//This function will actually create the row that the price title and image sit in.
function addItemToCart(title, price, imageSrc){
    // Increment the counter for each new item
    cartItemCounter++;

    var cartItemsDiv = document.getElementsByClassName("cart-items")[0];
    var cartForm = cartItemsDiv.closest("form");
    var cartRow = document.createElement('div');
    cartRow.classList.add("cart-row");
    var cartRowContents = `
        <div class="cart-item cart-column">
            <img class="cart-item-image" src="${imageSrc}" width="100" height="100">
            <span class="cart-item-title">${title}</span>
        </div>
        <span class="cart-price cart-column">${price}</span>
        <div class="cart-quantity cart-column">
            <input class="cart-quantity-input" type="number" value="1" name="hitem-quantity${cartItemCounter}">
            <button class="btn btn-danger" type="button" id="${cartItemCounter}">REMOVE</button>
        </div>`;
    cartRow.innerHTML = cartRowContents;
    cartItemsDiv.appendChild(cartRow);

    // Create hidden inputs with unique names
    var inputTitle = document.createElement('input');
    inputTitle.type = 'hidden';
    inputTitle.name = 'item-title' + cartItemCounter;
    inputTitle.id = cartItemCounter;
    inputTitle.value = title; // No encoding needed here

    var inputPrice = document.createElement('input');
    inputPrice.type = 'hidden';
    inputPrice.name = 'item-price' + cartItemCounter;
    inputPrice.id = cartItemCounter;
    inputPrice.value = price.replace("$", ""); // Remove the dollar sign

    var inputQuantity = document.createElement('input');
    inputQuantity.type = 'hidden';
    inputQuantity.name = 'item-quantity' + cartItemCounter;
    inputQuantity.id = cartItemCounter;
    inputQuantity.value = '1';

    cartForm.insertBefore(inputTitle, cartForm.childNodes[cartForm.childNodes.length]);
    cartForm.insertBefore(inputPrice, cartForm.childNodes[cartForm.childNodes.length]);
    cartForm.insertBefore(inputQuantity, cartForm.childNodes[cartForm.childNodes.length]);

    cartRow.getElementsByClassName("btn-danger")[0].addEventListener("click", function (event) { removeCartItem(event, cartItemCounter); });
    cartRow.getElementsByClassName("cart-quantity-input")[0].addEventListener("change", quantityChanged);
}

//This function will update the cart total after other functions are ran
function updateCartTotal() {
    var cartItemContainer = document.getElementsByClassName('cart-items')[0]
    var cartRows = cartItemContainer.getElementsByClassName('cart-row')
    var total = 0
    for(var i=0; i < cartRows.length; i++){
        var cartRow = cartRows[i]
        var priceElement = cartRow.getElementsByClassName('cart-price')[0]
        var quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
        var price = parseFloat(priceElement.innerText.replace('$', ''))
        var quantity = quantityElement.value
        total = total + (price * quantity)
    }
    total = Math.round(total * 100) / 100
    document.getElementsByClassName('cart-total-price')[0].innerText = '$' + total
}

//For this function after you click "Purchase" it will take you to another page with your receipt and a "thank you" message
function purchaseClicked(){

    var cartItems = document.getElementsByClassName("cart-items")[0]
    while(cartItems.hasChildNodes()) {
        cartItems.removeChild(cartItems.firstChild)
    }
    updateCartTotal()
}

        function displayOrderSummary() {
                var params = getURLParameters();
                var summaryDiv = document.getElementById('order-summary');
                var checkoutForm = document.getElementById('checkout');

                // Create the table structure
                var summaryTable = document.createElement('table');
                summaryTable.innerHTML = `
        <tr>
            <th>Item</th>
            <th>QTY</th>
            <th>Price</th>
            <th>Total</th>
        </tr>
    `;
                summaryDiv.appendChild(summaryTable);

                var subtotal = 0; // Initialize subtotal

                //group items, prices, and quantities
                Object.keys(params).forEach(key => {
                    if (key.startsWith('item-title')) {
                        var itemId = key.match(/item-title(\d+)/)[1];
                        var title = params['item-title' + itemId];
                        var price = parseFloat(params['item-price' + itemId]);
                        var quantity = parseInt(params['item-quantity' + itemId], 10);

                        if (title && price && quantity) {
                            var total = price * quantity;
                            subtotal += total; // Add to subtotal

                            var row = summaryTable.insertRow(-1);
                            var cell1 = row.insertCell(0);
                            var cell2 = row.insertCell(1);
                            var cell3 = row.insertCell(2);
                            var cell4 = row.insertCell(3);
                            cell1.innerHTML = title;
                            cell2.innerHTML = quantity;
                            cell3.innerHTML = '$' + price.toFixed(2);
                            cell4.innerHTML = '$' + total.toFixed(2);
                        }
                    }
                });

                if (summaryTable.rows.length === 1) { // Only header row exists
                    summaryDiv.innerHTML = '<p>No items in the cart.</p>';
                } else {
                    // Add the subtotal row
                    var subtotalRow = summaryTable.insertRow(-1);
                    var subtotalCell = subtotalRow.insertCell(0);
                    subtotalCell.colSpan = "3"; // Merge the first three cells
                    subtotalCell.innerHTML = "SUBTOTAL";
                    subtotalRow.insertCell(1).innerHTML = '$' + subtotal.toFixed(2);
                }
                
            }

//Toggles display of Credit Crad Info and ser Credit card inputs are required
const cardBtn = document.querySelector('#card-btn'); // Assuming this is the checkbox
const paymentInput = document.querySelector('#payment'); // Input element to hold the payment method
const div = document.querySelector('.credit-card');
const conf = document.querySelector('.btn-confirm');
const ccnInput = document.querySelector('#ccn'); // Credit card number input
const ccmInput = document.querySelector('#ccm'); // Credit card month input
const ccyInput = document.querySelector('#ccy'); // Credit card year input
const ccvInput = document.querySelector('#ccv'); // CVV input

cardBtn.addEventListener('change', () => {
    if (cardBtn.checked) {
        // If the checkbox is checked
        paymentInput.value = 'CC'; // Set value to 'CC'
        div.style.display = 'block';
        conf.style.display = 'block';
        ccnInput.required = true;
        ccmInput.required = true;
        ccyInput.required = true;
        ccvInput.required = true;
    } else {
        // If the checkbox is unchecked
        paymentInput.value = 'Cash'; // Set value to 'Cash'
        div.style.display = 'none';
        conf.style.display = 'block';
        ccnInput.required = false;
        ccmInput.required = false;
        ccyInput.required = false;
        ccvInput.required = false;
    }
});

//Function for hidden inputs in checkout
function appendHiddenInputs() {
    var params = new URLSearchParams(window.location.search);
    var checkoutForm = document.getElementById('checkout');

    params.forEach((value, key) => {
        if (key.startsWith('item-title') || key.startsWith('item-price') || key.startsWith('item-quantity')) {
            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            checkoutForm.appendChild(input);
        }
    });
}
//Displays order summary 
function displayOrderSummary() {
        var params = getURLParameters();
        var summaryDiv = document.getElementById('order-summary');
        var checkoutForm = document.getElementById('checkout');

        // Create the table structure
        var summaryTable = document.createElement('table');
        summaryTable.innerHTML = `
    <tr>
        <th>Item</th>
        <th>QTY</th>
        <th>Price</th>
        <th>Total</th>
    </tr>
`;
        summaryDiv.appendChild(summaryTable);

        var subtotal = 0; // Initialize subtotal

        //group items, prices, and quantities
        Object.keys(params).forEach(key => {
            if (key.startsWith('item-title')) {
                var itemId = key.match(/item-title(\d+)/)[1];
                var title = params['item-title' + itemId];
                var price = parseFloat(params['item-price' + itemId]);
                var quantity = parseInt(params['item-quantity' + itemId], 10);

                if (title && price && quantity) {
                    var total = price * quantity;
                    subtotal += total; // Add to subtotal

                    var row = summaryTable.insertRow(-1);
                    var cell1 = row.insertCell(0);
                    var cell2 = row.insertCell(1);
                    var cell3 = row.insertCell(2);
                    var cell4 = row.insertCell(3);
                    cell1.innerHTML = title;
                    cell2.innerHTML = quantity;
                    cell3.innerHTML = '$' + price.toFixed(2);
                    cell4.innerHTML = '$' + total.toFixed(2);
                }
            }
        });

        if (summaryTable.rows.length === 1) { // Only header row exists
            summaryDiv.innerHTML = '<p>No items in the cart.</p>';
        } else {
            // Add the subtotal row
            var subtotalRow = summaryTable.insertRow(-1);
            var subtotalCell = subtotalRow.insertCell(0);
            subtotalCell.colSpan = "3"; // Merge the first three cells
            subtotalCell.innerHTML = "SUBTOTAL";
            subtotalRow.insertCell(1).innerHTML = '$' + subtotal.toFixed(2);
        }

    }

function getURLParameters() {
    var params = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        value = value.replace(/\+/g, ' '); // Replace '+' with space
        params[key] = decodeURIComponent(value);
        return value;
    });
    return params;
}

//Function for reciept page
function generateReceipt() {
    if (window.location.href.includes('receipt.html')) { 
    var params = new URLSearchParams(window.location.search);
    var receiptDiv = document.querySelector('.receipt-body');
    receiptDiv.innerHTML = '<h2>Receipt of Purchase</h2>';

    // Create a div for client, type, and payment details
    var detailsDiv = document.createElement('div');

    // Append client name, type, and payment method to the details div
    var name = params.get('name');
    var type = params.get('type');
    var payment = params.get('payment');
    var tip = parseFloat(params.get('tip')) || 0;

    if (name) {
        var namePara = document.createElement('p');
        namePara.textContent = `Name: ${name}`;
        detailsDiv.appendChild(namePara);
    }

    if (type) {
        var typePara = document.createElement('p');
        typePara.textContent = `Type: ${type}`;
        detailsDiv.appendChild(typePara);
    }

    if (payment) {
        var paymentPara = document.createElement('p');
        paymentPara.textContent = `Payment: ${payment}`;
        detailsDiv.appendChild(paymentPara);
    }

    // Append details div to receipt body
    receiptDiv.appendChild(detailsDiv);

    // Creating a table for item details
    var table = document.createElement('table');
    var thead = table.createTHead();
    var headerRow = thead.insertRow();
    var headers = ['Item', 'QTY', 'Price', 'Total'];
    headers.forEach(headerText => {
        var headerCell = document.createElement('th');
        headerCell.textContent = headerText;
        headerRow.appendChild(headerCell);
    });

    var tbody = table.createTBody();
    var subtotal = 0;

    // Display each item in the table
    params.forEach((value, key) => {
        if (key.startsWith('item-title')) {
            var itemId = key.match(/item-title(\d+)/)[1];
            var title = params.get('item-title' + itemId);
            var price = parseFloat(params.get('item-price' + itemId));
            var quantity = parseInt(params.get('item-quantity' + itemId), 10);
            var total = price * quantity;

            subtotal += total;

            var row = tbody.insertRow();
            row.insertCell().textContent = title;
            row.insertCell().textContent = quantity;
            row.insertCell().textContent = `$${price.toFixed(2)}`;
            row.insertCell().textContent = `$${total.toFixed(2)}`;
        }
    });
    
    // Append subtotal, tip, and total rows to the table
    var subtotalRow = tbody.insertRow();
    subtotalRow.insertCell().textContent = "Subtotal";
    subtotalRow.insertCell().colSpan = 2;
    var subtotalCell = subtotalRow.insertCell();
    subtotalCell.textContent = `$${subtotal.toFixed(2)}`;
    subtotalCell.className = 'text-right';

    var tipRow = tbody.insertRow();
    tipRow.insertCell().textContent = "Tip";
    tipRow.insertCell().colSpan = 2;
    var tipCell = tipRow.insertCell();
    tipCell.textContent = `$${tip.toFixed(2)}`;
    tipCell.className = 'text-right';

    var totalRow = tbody.insertRow();
    totalRow.insertCell().textContent = "Total";
    totalRow.insertCell().colSpan = 2;
    var totalCell = totalRow.insertCell();
    totalCell.textContent = `$${(subtotal + tip).toFixed(2)}`;
    totalCell.className = 'text-right';

    // Append table to the receipt body
    receiptDiv.appendChild(table);
}}

function addItemBreakfast() {
    const shopItems = document.querySelector("#breakfast");
    let newShopItemTitle = document.getElementById('shop-item-title').value;
    let newShopItemPrice = document.getElementById('shop-item-price').value;
    let newShopItemImage = document.getElementById('shop-item-image').value;

    const newDiv = document.createElement('div');
    newDiv.classList.add('shop-item');
    newDiv.innerHTML = `    <div class="shop-item">
    <span class="shop-item-title">${newShopItemTitle}</span>
    <img class="shop-item-image" src="${newShopItemImage}" style="height: auto; object-fit: fill;">
    <div class="shop-item-details">
        <span class="shop-item-price">${newShopItemPrice}</span>
        <button class="btn1 btn-primary shop-item-button" type="button">ADD TO CART</button>
    </div>
    <input type="checkbox" class="checkItems">
</div>`;

    shopItems.appendChild(newDiv)

    clearInputs();
}

function addItemLunch() {
    const shopItems = document.querySelector("#lunch");
    let newShopItemTitle = document.getElementById('shop-item-title').value;
    let newShopItemPrice = document.getElementById('shop-item-price').value;
    let newShopItemImage = document.getElementById('shop-item-image').value;

    const newDiv = document.createElement('div');
    newDiv.classList.add('shop-item');
    newDiv.innerHTML = `    <div class="shop-item">
    <span class="shop-item-title">${newShopItemTitle}</span>
    <img class="shop-item-image" src="${newShopItemImage}" style="height: auto; object-fit: fill;">
    <div class="shop-item-details">
        <span class="shop-item-price">${newShopItemPrice}</span>
        <button class="btn1 btn-primary shop-item-button" type="button">ADD TO CART</button>
    </div>
    <input type="checkbox" class="checkItems">
</div>`;

    shopItems.appendChild(newDiv)

    clearInputs();
}

function addItemDinner() {
    const shopItems = document.querySelector("#dinner");
    let newShopItemTitle = document.getElementById('shop-item-title').value;
    let newShopItemPrice = document.getElementById('shop-item-price').value;
    let newShopItemImage = document.getElementById('shop-item-image').value;

    const newDiv = document.createElement('div');
    newDiv.classList.add('shop-item');
    newDiv.innerHTML = `    <div class="shop-item">
    <span class="shop-item-title">${newShopItemTitle}</span>
    <img class="shop-item-image" src="${newShopItemImage}" style="height: auto; object-fit: fill;">
    <div class="shop-item-details">
        <span class="shop-item-price">${newShopItemPrice}</span>
        <button class="btn1 btn-primary shop-item-button" type="button">ADD TO CART</button>
    </div>
    <input type="checkbox" class="checkItems">
</div>`;

    shopItems.appendChild(newDiv)

    clearInputs();
}

function addItemDrinks() {
    const shopItems = document.querySelector("#drinks");
    let newShopItemTitle = document.getElementById('shop-item-title').value;
    let newShopItemPrice = document.getElementById('shop-item-price').value;
    let newShopItemImage = document.getElementById('shop-item-image').value;

    const newDiv = document.createElement('div');
    newDiv.classList.add('shop-item');
    newDiv.innerHTML = `    <div class="shop-item">
    <span class="shop-item-title">${newShopItemTitle}</span>
    <img class="shop-item-image" src="${newShopItemImage}" style="height: auto; object-fit: fill;">
    <div class="shop-item-details">
        <span class="shop-item-price">${newShopItemPrice}</span>
        <button class="btn1 btn-primary shop-item-button" type="button">ADD TO CART</button>
    </div>
    <input type="checkbox" class="checkItems">
</div>`;

    shopItems.appendChild(newDiv)

    clearInputs();
}

//function to remove items from menu
function removeItem(removeDiv, category) {
    removeDiv.remove();
    saveMenuToLocalStorage(category);
}

function removal() {
    const checkItems = document.querySelectorAll('.checkItems');
    checkItems.forEach(item => {
        if (item.checked) {
            var shopItem = item.closest('.shop-item');
            removeItem(shopItem);
        }
    });
}

  function clearInputs (){
    let clearAll = document.querySelectorAll('input');
    clearAll.forEach(eachInput => eachInput.value = '');
  }

function saveMenuToLocalStorage(category) {
    const categoryDiv = document.getElementById(category);
    localStorage.setItem('current-menu-' + category, categoryDiv.outerHTML);
}

function loadMenuFromLocalStorage() {
    var storedMenu = localStorage.getItem('current-menu');
    if (storedMenu) {
        document.getElementById('menus').innerHTML = storedMenu;
    }
}