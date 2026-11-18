
let editingProductId = null;

async function addProduct() {

    const product = {
        id: Number(document.getElementById('id').value),
        name: document.getElementById('name').value,
        price: Number(document.getElementById('price').value),
        category: document.getElementById('category').value
    };

    const isEditing = editingProductId !== null;
    const response = await fetch(
        isEditing ? '/products/' + editingProductId : '/products',
        {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
        }
    );

    const result = await response.json();

    alert(result.message);

    if (response.ok) {
        cancelEdit();
    }

    loadProducts();
}

async function editProduct(id) {
    const response = await fetch('/products/' + id);
    const product = await response.json();

    if (!response.ok) {
        alert(product.message);
        return;
    }

    editingProductId = product.id;
    document.getElementById('id').value = product.id;
    document.getElementById('id').disabled = true;
    document.getElementById('name').value = product.name;
    document.getElementById('price').value = product.price;
    document.getElementById('category').value = product.category;
    document.getElementById('formTitle').textContent = 'Edit Product';
    document.getElementById('submitButton').textContent = 'Save Changes';
    document.getElementById('cancelButton').hidden = false;
}

function cancelEdit() {
    editingProductId = null;
    document.getElementById('id').value = '';
    document.getElementById('id').disabled = false;
    document.getElementById('name').value = '';
    document.getElementById('price').value = '';
    document.getElementById('category').value = '';
    document.getElementById('formTitle').textContent = 'Add Product';
    document.getElementById('submitButton').textContent = 'Add Product';
    document.getElementById('cancelButton').hidden = true;
}

async function loadProducts() {

    const response = await fetch('/products');

    const products = await response.json();

    const list = document.getElementById('productList');

    list.innerHTML = '';

    products.forEach(product => {

        list.innerHTML += `
            <div class="product">

                <h3>${product.name}</h3>

                <p>ID: ${product.id}</p>

                <p>Price: Rs. ${product.price}</p>

                <p>Category: ${product.category}</p>

                <button onclick="editProduct(${product.id})">
                    Edit
                </button>

                <button onclick="deleteProduct(${product.id})">
                    Delete
                </button>

            </div>
        `;
    });
}

async function deleteProduct(id) {

    const response = await fetch('/products/' + id, {
        method: 'DELETE'
    });

    const result = await response.json();

    alert(result.message);

    loadProducts();
}
