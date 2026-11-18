
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const DATA_FILE = path.join(__dirname, 'products.json');

// Read products
function readProducts() {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

// Save products
function saveProducts(products) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
}

// Create server
const server = http.createServer((req, res) => {

    res.setHeader('Content-Type', 'application/json');

    // GET: Display all products
    if (req.method === 'GET' && req.url === '/products') {

        const products = readProducts();

        res.writeHead(200);
        res.end(JSON.stringify(products));
    }

    // POST: Add new product
    else if (req.method === 'POST' && req.url === '/products') {

        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {

            const newProduct = JSON.parse(body);

            const products = readProducts();

            const exists = products.some(p => p.id === newProduct.id);

            if (exists) {
                res.writeHead(409);
                res.end(JSON.stringify({
                    message: 'Product ID already exists'
                }));
                return;
            }

            products.push(newProduct);

            saveProducts(products);

            res.writeHead(201);
            res.end(JSON.stringify({
                message: 'Product added successfully'
            }));
        });
    }

    // GET: Search product by ID
    else if (req.method === 'GET' && req.url.startsWith('/products/')) {

        const id = Number(req.url.split('/')[2]);

        const products = readProducts();

        const product = products.find(p => p.id === id);

        if (product) {
            res.writeHead(200);
            res.end(JSON.stringify(product));
        } 
        else {
            res.writeHead(404);
            res.end(JSON.stringify({
                message: 'Product not found'
            }));
        }
    }

    // PUT: Update product
    else if (req.method === 'PUT' && req.url.startsWith('/products/')) {

        const id = Number(req.url.split('/')[2]);

        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {

            const updatedData = JSON.parse(body);

            const products = readProducts();

            const index = products.findIndex(p => p.id === id);

            if (index === -1) {
                res.writeHead(404);
                res.end(JSON.stringify({
                    message: 'Product not found'
                }));
                return;
            }

            products[index] = {
                id: id,
                name: updatedData.name,
                price: updatedData.price,
                category: updatedData.category
            };

            saveProducts(products);

            res.writeHead(200);
            res.end(JSON.stringify({
                message: 'Product updated successfully'
            }));
        });
    }

    // DELETE: Delete product
    else if (req.method === 'DELETE' && req.url.startsWith('/products/')) {

        const id = Number(req.url.split('/')[2]);

        const products = readProducts();

        const updatedProducts = products.filter(p => p.id !== id);

        if (products.length === updatedProducts.length) {
            res.writeHead(404);
            res.end(JSON.stringify({
                message: 'Product not found'
            }));
            return;
        }

        saveProducts(updatedProducts);

        res.writeHead(200);
        res.end(JSON.stringify({
            message: 'Product deleted successfully'
        }));
    }

    // GET: Display HTML page
    else if (req.method === 'GET' && req.url === '/') {

        res.writeHead(200, {
            'Content-Type': 'text/html'
        });

        res.end(
            fs.readFileSync(
                path.join(__dirname, 'public', 'index.html')
            )
        );
    }

    // GET: Load CSS and JavaScript
    else if (
        req.method === 'GET' &&
        ['/style.css', '/script.js'].includes(req.url)
    ) {

        const filePath = path.join(
            __dirname,
            'public',
            req.url.slice(1)
        );

        const contentType = req.url.endsWith('.css')
            ? 'text/css'
            : 'application/javascript';

        res.writeHead(200, {
            'Content-Type': contentType
        });

        res.end(fs.readFileSync(filePath));
    }

    // Invalid route
    else {
        res.writeHead(404);
        res.end(JSON.stringify({
            message: 'Route not found'
        }));
    }

});

// Start server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
