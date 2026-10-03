// Open (or create) the database with the version 1
let db;
const request = indexedDB.open('exampleProductDB', 1);

request.onerror = function(event) {
    console.error("Database error: ", event.target.error);
};

request.onsuccess = function(event) {
    db = event.target.result;
    loadProductTable(); // Load products after the database is opened
};

request.onupgradeneeded = function(event) {
    db = event.target.result;
    db.createObjectStore('products', { keyPath: 'id' });
};

//Load/Read products from IndexedDB and display them in the table
function loadProductTable() {
    const transaction = db.transaction(['products'], 'readonly');
    const store = transaction.objectStore('products');

    const request = store.getAll();

    request.onsuccess = function(event) {
        const products = event.target.result;
        const tableBody = document.querySelector('#productsTable tbody');
        tableBody.textContent = ''; // Clear the table before adding new products

        if (products.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = 4;
            emptyCell.className = 'empty-row';
            emptyCell.textContent = 'No products yet. Add your first one!';
            emptyRow.appendChild(emptyCell);
            tableBody.appendChild(emptyRow);
            return;
        }

        const pesoFormatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

        products.forEach(product => {
            //Create a table row using safe DOM methods (avoids innerHTML/XSS)
            const row = document.createElement('tr');

            const idCell = document.createElement('td');
            idCell.textContent = product.id;

            const nameCell = document.createElement('td');
            nameCell.textContent = product.name;

            const priceCell = document.createElement('td');
            priceCell.textContent = pesoFormatter.format(product.price);

            const actionsCell = document.createElement('td');
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-btn';
            deleteButton.dataset.id = product.id;
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', deleteProduct);
            actionsCell.appendChild(deleteButton);

            row.appendChild(idCell);
            row.appendChild(nameCell);
            row.appendChild(priceCell);
            row.appendChild(actionsCell);
            tableBody.appendChild(row);
        });
    };
}

//Add/Create a new product
function addProduct() {
    const name = document.getElementById('name').value.trim();
    const price = parseFloat(document.getElementById('price').value);

    //Validate inputs
    if (!name || isNaN(price) || price <= 0) {
        alert("Please enter a valid name and price.");
        return;
    }

    const transaction = db.transaction(['products'], 'readwrite');
    const store = transaction.objectStore('products');

    //Get/Read the products
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = function(event) {
        const products = event.target.result;
        const newProduct = {
            id: products.length > 0 ? products[products.length - 1].id + 1 : 1, // Assign an incremental ID
            name: name,
            price: price
        };

    //Add/Create the new product to the DB
        store.add(newProduct);
        //Clear the form fields
        document.getElementById('name').value = '';
        document.getElementById('price').value = '';

    //Update the table with the new product
        loadProductTable();
    };
}

//Delete a product
function deleteProduct(event) {
    const productId = parseInt(event.target.getAttribute('data-id')); // Get the product ID from the button's data attribute
    const transaction = db.transaction(['products'], 'readwrite');
    const store = transaction.objectStore('products');

    //Delete the product with the corresponding ID
    store.delete(productId);

    //Reload the product table to reflect changes
    loadProductTable();
}

//Event listener for the button click
document.getElementById('addProduct').addEventListener('click', addProduct);