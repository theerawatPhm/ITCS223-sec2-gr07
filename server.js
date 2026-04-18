// server.js — Glow Society Web Services
// ITCS223 Introduction to Web Development — Project Phase II
// Section 2, Group 7

const express = require('express');
const cors    = require('cors');
const jwt     = require('jsonwebtoken');
const dotenv  = require('dotenv');
dotenv.config();

const app    = express();
const router = express.Router();

// ---- Middleware ----
app.use(cors());          // allow front-end to call this API
app.use(router);
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// ---- Database connection (same style as lab) ----
const mysql = require('mysql2');
var connection = mysql.createConnection({
    host:     process.env.MYSQL_HOST,
    user:     process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

connection.connect(function(err) {
    if (err) throw err;
    console.log(`Connected DB: ${process.env.MYSQL_DATABASE}`);
});

// ============================================================
// HELPER: Verify JWT token from Authorization header
// Returns decoded admin object, or null if invalid
// ============================================================
function verifyToken(req) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return null;
    }
}

// ============================================================
// GET / — Health check
// ============================================================
router.get('/', (req, res) => {
    console.log('Request at /');
    res.json({ message: 'Glow Society API is running ✅', port: process.env.PORT });
});

// ============================================================
// POST /api/auth/login — Admin Login
// ============================================================
// Testing Insert: Admin Login
// method: POST
// URL: http://localhost:3000/api/auth/login
// body: raw JSON
// { "username": "admin01", "password": "Pass1234" }
// Expected: 200 OK, { token: "...", admin: { emp_id, username } }
//
// Testing Insert: Wrong password
// method: POST
// URL: http://localhost:3000/api/auth/login
// body: raw JSON
// { "username": "admin01", "password": "wrongpass" }
// Expected: 401 Unauthorized, { message: "Invalid credentials." }
// ============================================================
router.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Request at ${req.path}`);
    console.log(`Login attempt by: ${username}`);

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    // Join Admin_Login with Admin_Info to get full details
    let sql = `
        SELECT al.log_id, al.username, al.login_password,
               ai.fname, ai.lname, ai.email
        FROM Admin_Login al
        JOIN Admin_Info ai ON al.log_id = ai.emp_id
        WHERE al.username = ?
    `;

    connection.query(sql, [username], function(error, results) {
        if (error) throw error;

        if (results.length === 0 || results[0].login_password !== password) {
            // Log failed attempt
            let logSql = `INSERT INTO Login_log (log_id, login_time, logout_time, login_status)
                          SELECT log_id, NOW(), NOW(), 'failed'
                          FROM Admin_Login WHERE username = ?`;
            connection.query(logSql, [username], function(err) {});

            console.log('Login failed: invalid credentials');
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const admin = results[0];

        // Log successful login
        let logSql = `INSERT INTO Login_log (log_id, login_time, logout_time, login_status)
                      VALUES (?, NOW(), NOW(), 'succeed')`;
        connection.query(logSql, [admin.log_id], function(err) {});

        // Generate JWT token (expires 8 hours)
        const token = jwt.sign(
            { id: admin.log_id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        console.log(`Login success: ${admin.username}`);
        res.status(200).json({
            message: 'Login successful.',
            token,
            admin: {
                emp_id:   admin.log_id,
                username: admin.username,
                fname:    admin.fname,
                lname:    admin.lname,
                email:    admin.email
            }
        });
    });
});

// ============================================================
// GET /api/products/search — Search Products (3 criteria)
// Query: name, category, minRating (+ optional: maxPrice, brands)
// ============================================================
// Testing Search: No criteria — return all
// method: GET
// URL: http://localhost:3000/api/products/search
// Expected: 200 OK, { products: [...all...] }
//
// Testing Search: 3 criteria
// method: GET
// URL: http://localhost:3000/api/products/search?name=mascara&category=Makeup&minRating=4
// Expected: 200 OK, { products: [...filtered...] }
// ============================================================
router.get('/api/products/search', (req, res) => {
    const { name, category, minRating, maxPrice, brands } = req.query;
    console.log(`Request at ${req.path}`);
    console.log(`Search: name=${name}, category=${category}, minRating=${minRating}`);

    let conditions = [];
    let params     = [];

    // Criterion 1: product name (partial match)
    if (name) {
        conditions.push('(p.prod_name LIKE ? OR p.brand LIKE ?)');
        params.push(`%${name}%`, `%${name}%`);
    }

    // Criterion 2: category
    if (category) {
        conditions.push('p.category = ?');
        params.push(category);
    }

    // Criterion 3: minimum rating
    if (minRating) {
        conditions.push('p.rating >= ?');
        params.push(parseInt(minRating));
    }

    // Extra: max price filter
    if (maxPrice) {
        conditions.push('p.price <= ?');
        params.push(parseFloat(maxPrice));
    }

    // Extra: brand list (comma-separated)
    if (brands) {
        const brandList = brands.split(',').map(b => b.trim());
        const placeholders = brandList.map(() => '?').join(',');
        conditions.push(`p.brand IN (${placeholders})`);
        params.push(...brandList);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    let sql = `
        SELECT p.prod_id AS id, p.prod_name AS name, p.brand,
               p.category, p.price, p.rating, p.spe_flag,
               pi.image_url AS img
        FROM Product p
        LEFT JOIN Product_Image pi ON p.prod_id = pi.prod_id
        ${whereClause}
        ORDER BY p.prod_id
    `;

    connection.query(sql, params, function(error, results) {
        if (error) throw error;

        let status = (results.length > 0) ? 'Found' : 'Not Found';
        console.log(status);
        console.log(`${results.length} rows returned`);

        res.status(200).json({ products: results, total: results.length });
    });
});

// ============================================================
// GET /api/products/home — Home page (new arrivals + high rated)
// ============================================================
// Testing Search: Get home products
// method: GET
// URL: http://localhost:3000/api/products/home
// Expected: 200 OK, { newArrivals: [...], highRated: [...] }
//
// Testing Search: Empty database
// Expected: 200 OK, { newArrivals: [], highRated: [] }
// ============================================================
router.get('/api/products/home', (req, res) => {
    console.log(`Request at ${req.path}`);

    // New arrivals — last 3 added
    let sqlNew = `
        SELECT p.prod_id AS id, p.prod_name AS name, p.brand,
               p.category, p.price, p.rating, pi.image_url AS img
        FROM Product p
        LEFT JOIN Product_Image pi ON p.prod_id = pi.prod_id
        ORDER BY p.prod_id DESC LIMIT 3
    `;

    // High rated — top 3 by rating
    let sqlTop = `
        SELECT p.prod_id AS id, p.prod_name AS name, p.brand,
               p.category, p.price, p.rating, pi.image_url AS img
        FROM Product p
        LEFT JOIN Product_Image pi ON p.prod_id = pi.prod_id
        ORDER BY p.rating DESC LIMIT 3
    `;

    connection.query(sqlNew, function(error, newArrivals) {
        if (error) throw error;

        connection.query(sqlTop, function(error, highRated) {
            if (error) throw error;

            console.log(`Home: ${newArrivals.length} new, ${highRated.length} top rated`);
            res.status(200).json({ newArrivals, highRated });
        });
    });
});

// ============================================================
// GET /api/products/:id — Product Detail
// ============================================================
// Testing Search: Valid product
// method: GET
// URL: http://localhost:3000/api/products/P001
// Expected: 200 OK, { product: { id, name, brand, ... } }
//
// Testing Search: Invalid product
// method: GET
// URL: http://localhost:3000/api/products/P999
// Expected: 404 Not Found, { message: "Product not found." }
// ============================================================
router.get('/api/products/:id', (req, res) => {
    const { id } = req.params;
    console.log(`Request at ${req.path}`);
    console.log(`Get product: ${id}`);

    let sql = `
        SELECT p.prod_id AS id, p.prod_name AS name, p.brand,
               p.category, p.price, p.rating,
               p.details, p.how_to AS howto, p.ingredients, p.spe_flag,
               pv.volume, pv.color, pv.quantity,
               pi.image_url AS img
        FROM Product p
        LEFT JOIN Product_Variant pv ON p.prod_id = pv.prod_id
        LEFT JOIN Product_Image   pi ON p.prod_id = pi.prod_id
        WHERE p.prod_id = ?
    `;

    connection.query(sql, [id], function(error, results) {
        if (error) throw error;

        if (results.length === 0) {
            console.log('Product not found');
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Build product object with arrays for volumes/colors/images
        const row = results[0];
        const product = {
            id:          row.id,
            name:        row.name,
            brand:       row.brand,
            category:    row.category,
            price:       row.price,
            rating:      row.rating,
            details:     row.details,
            howto:       row.howto,
            ingredients: row.ingredients,
            spe_flag:    row.spe_flag,
            volumes:     results.map(r => `${r.volume} ml`).filter(Boolean),
            colors:      results.map(r => r.color).filter(Boolean),
            quantity:    row.quantity,
            images:      results.map(r => r.img).filter(Boolean)
        };

        console.log(`Found: ${product.name}`);
        res.status(200).json({ product });
    });
});

// ============================================================
// POST /api/products — Insert New Product (Admin only)
// ============================================================
// Testing Insert: Valid product
// method: POST
// URL: http://localhost:3000/api/products
// headers: Authorization: Bearer <token>
// body: raw JSON
// {
//   "prod_id": "P011",
//   "name": "Glow Serum",
//   "brand": "COSRX",
//   "category": "Skincare",
//   "price": 890.00,
//   "details": "Brightening serum with niacinamide",
//   "howto": "Apply 2-3 drops after toner",
//   "ingredients": "Niacinamide, Hyaluronic Acid",
//   "rating": 4,
//   "volume": 30,
//   "color": "Clear",
//   "quantity": 100
// }
// Expected: 201 Created, { message: "Product added.", id: "P011" }
//
// Testing Insert: Missing required fields
// body: { "name": "Test Only" }
// Expected: 400 Bad Request, { message: "Missing required fields." }
// ============================================================
router.post('/api/products', (req, res) => {
    console.log(`Request at ${req.path}`);

    // Check JWT token (admin only)
    const admin = verifyToken(req);
    if (!admin) {
        return res.status(401).json({ message: 'Unauthorized. Please login first.' });
    }

    const { prod_id, name, brand, category, price,
            details, howto, ingredients, rating,
            spe_flag, volume, color, quantity } = req.body;

    console.log(`Insert product: ${prod_id} - ${name}`);

    // Validate required fields
    if (!prod_id || !name || !brand || !category || !price || !details || !howto || !ingredients) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Insert into Product table
    let sql = `
        INSERT INTO Product (prod_id, prod_name, brand, category, price, details, how_to, ingredients, rating, spe_flag)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(sql,
        [prod_id, name, brand, category, price, details, howto, ingredients, rating || 0, spe_flag || null],
        function(error, results) {
            if (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ message: 'Product ID already exists.' });
                }
                throw error;
            }

            console.log(`Product inserted: ${prod_id}`);

            // Insert variant if volume provided
            if (volume) {
                let sqlVar = `INSERT INTO Product_Variant (prod_id, volume, color, quantity) VALUES (?, ?, ?, ?)`;
                connection.query(sqlVar, [prod_id, volume, color || null, quantity || 0], function(err) {
                    if (err) console.error('Variant insert error:', err.message);
                });
            }

            res.status(201).json({ message: 'Product added.', id: prod_id });
        }
    );
});

// ============================================================
// PUT /api/products/:id — Update Product (Admin only)
// ============================================================
// Testing Update: Update price and details
// method: PUT
// URL: http://localhost:3000/api/products/P001
// headers: Authorization: Bearer <token>
// body: raw JSON
// { "price": 199.00, "details": "Updated product description" }
// Expected: 200 OK, { message: "Product updated." }
//
// Testing Update: Non-existent product
// URL: http://localhost:3000/api/products/P999
// Expected: 404 Not Found, { message: "Product not found." }
// ============================================================
router.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    console.log(`Request at ${req.path}`);

    // Check JWT token (admin only)
    const admin = verifyToken(req);
    if (!admin) {
        return res.status(401).json({ message: 'Unauthorized. Please login first.' });
    }

    const { name, brand, category, price, details, howto, ingredients, rating, spe_flag } = req.body;
    console.log(`Update product: ${id}`);

    // Check product exists first
    connection.query('SELECT prod_id FROM Product WHERE prod_id = ?', [id], function(error, results) {
        if (error) throw error;

        if (results.length === 0) {
            console.log('Product not found');
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Build dynamic SET clause — only update provided fields
        let setClause = [];
        let params    = [];

        if (name)        { setClause.push('prod_name = ?');  params.push(name); }
        if (brand)       { setClause.push('brand = ?');      params.push(brand); }
        if (category)    { setClause.push('category = ?');   params.push(category); }
        if (price)       { setClause.push('price = ?');      params.push(price); }
        if (details)     { setClause.push('details = ?');    params.push(details); }
        if (howto)       { setClause.push('how_to = ?');     params.push(howto); }
        if (ingredients) { setClause.push('ingredients = ?');params.push(ingredients); }
        if (rating !== undefined) { setClause.push('rating = ?'); params.push(rating); }
        if (spe_flag)    { setClause.push('spe_flag = ?');   params.push(spe_flag); }

        if (setClause.length === 0) {
            return res.status(400).json({ message: 'No fields to update.' });
        }

        params.push(id);
        let sql = `UPDATE Product SET ${setClause.join(', ')} WHERE prod_id = ?`;

        connection.query(sql, params, function(error, results) {
            if (error) throw error;
            console.log(`Product updated: ${id}`);
            res.status(200).json({ message: 'Product updated.' });
        });
    });
});

// ============================================================
// DELETE /api/products/:id — Delete Product (Admin only)
// ============================================================
// Testing Delete: Valid product
// method: DELETE
// URL: http://localhost:3000/api/products/P011
// headers: Authorization: Bearer <token>
// Expected: 200 OK, { message: "Product deleted." }
//
// Testing Delete: Non-existent product
// URL: http://localhost:3000/api/products/P999
// Expected: 404 Not Found, { message: "Product not found." }
// ============================================================
router.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    console.log(`Request at ${req.path}`);

    // Check JWT token (admin only)
    const admin = verifyToken(req);
    if (!admin) {
        return res.status(401).json({ message: 'Unauthorized. Please login first.' });
    }

    console.log(`Delete product: ${id}`);

    // Check product exists
    connection.query('SELECT prod_id FROM Product WHERE prod_id = ?', [id], function(error, results) {
        if (error) throw error;

        if (results.length === 0) {
            console.log('Product not found');
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Delete related records first (foreign key order)
        connection.query('DELETE FROM Product_Image WHERE prod_id = ?', [id], function(err) {
            if (err) throw err;

            connection.query('DELETE FROM Product_Variant WHERE prod_id = ?', [id], function(err) {
                if (err) throw err;

                connection.query('DELETE FROM Product WHERE prod_id = ?', [id], function(err, results) {
                    if (err) throw err;
                    console.log(`Product deleted: ${id}`);
                    res.status(200).json({ message: 'Product deleted.' });
                });
            });
        });
    });
});

// ============================================================
// 404 — Route not found
// ============================================================
router.use((req, res) => {
    console.log('404: Invalid accessed');
    res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` });
});

// ============================================================
// Start server
// ============================================================
app.listen(process.env.PORT, () => {
    console.log(`Server listening on port: ${process.env.PORT}`);
});
