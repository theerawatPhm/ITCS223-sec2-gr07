# Glow Society — Web Application
**ITCS223 Introduction to Web Development — Project Phase II**  
Section 2, Group 7

---

## Project Structure

```
sec2_gr7/
├── sec2_gr7_fe_src/        ← Front-end (HTML, CSS, JS)
│   ├── index.html
│   ├── login.html
│   ├── search.html
│   ├── detail.html
│   ├── manage.html
│   ├── team.html
│   └── style.css
│
├── sec2_gr7_ws_src/        ← Web Services (Node.js)
│   ├── server.js
│   ├── db.js
│   ├── package.json
│   ├── .env
│   ├── routes/
│   │   ├── auth.js
│   │   └── products.js
│   └── middleware/
│       └── auth.js
│
└── sec2_gr7_database.sql   ← MySQL database
```

---

## 1. Install Required Software

### Step 1 — Install Node.js
1. Go to https://nodejs.org
2. Download **LTS version** (e.g. v20)
3. Run the installer → click Next until done
4. Open **Terminal** (Mac) or **Command Prompt** (Windows) and verify:
   ```
   node -v
   npm -v
   ```

### Step 2 — Install MySQL
1. Go to https://dev.mysql.com/downloads/mysql/
2. Download and install **MySQL Community Server**
3. Remember your **root password** during setup

---

## 2. Setup Database

1. Open **MySQL Workbench** or terminal:
   ```bash
   mysql -u root -p
   ```
2. Import the SQL file:
   ```bash
   mysql -u root -p < sec2_gr7_database.sql
   ```
3. Verify database was created:
   ```sql
   SHOW DATABASES;
   USE sec2_gr7_database;
   SHOW TABLES;
   ```

---

## 3. Setup Web Service (Back-end)

```bash
# 1. Go into the web service folder
cd sec2_gr7_ws_src

# 2. Install dependencies
npm install

# 3. Edit the .env file — set your MySQL password
#    Open .env and change DB_PASSWORD=your_password_here
#    to your actual MySQL root password

# 4. Start the server
node server.js
```

You should see:
```
✅ Connected to MySQL database: sec2_gr7_database
🚀 Glow Society API running at http://localhost:3000
```

---

## 4. Run Front-end

### Option A — VS Code Live Server (Recommended)
1. Open `sec2_gr7_fe_src/` folder in VS Code
2. Install extension: **Live Server** by Ritwick Dey
3. Right-click `index.html` → **Open with Live Server**
4. Browser opens at `http://127.0.0.1:5500`

### Option B — Node.js static server
```bash
cd sec2_gr7_fe_src
npx serve .
```
Then open: `http://localhost:3000`

> **Important:** Front-end and back-end must run on **different ports**.
> - Front-end: port 5500 (Live Server) or 8080
> - Back-end API: port 3000

---

## 5. API Endpoints

| Method | URL | Description | Auth |
|--------|-----|-------------|------|
| POST | `/api/auth/login` | Admin login | ✗ |
| GET | `/api/products/home` | Home page products | ✗ |
| GET | `/api/products/search` | Search products | ✗ |
| GET | `/api/products/:id` | Product detail | ✗ |
| POST | `/api/products` | Add product | ✅ JWT |
| PUT | `/api/products/:id` | Update product | ✅ JWT |
| DELETE | `/api/products/:id` | Delete product | ✅ JWT |

### Search Query Parameters
| Param | Description | Example |
|-------|-------------|---------|
| `name` | Product name (partial) | `?name=mascara` |
| `category` | Category filter | `?category=makeup` |
| `minRating` | Minimum rating | `?minRating=4` |
| `maxPrice` | Maximum price | `?maxPrice=500` |
| `brands` | Brand list (comma-sep) | `?brands=COSRX,LANEIGE` |

---

## 6. Test with Postman

Import these requests into Postman:

### Login
- Method: `POST`
- URL: `http://localhost:3000/api/auth/login`
- Body (raw JSON):
  ```json
  { "username": "admin01", "password": "password123" }
  ```

### Search Products
- Method: `GET`
- URL: `http://localhost:3000/api/products/search?name=mascara&category=makeup&minRating=4`

### Add Product (requires login token)
- Method: `POST`
- URL: `http://localhost:3000/api/products`
- Header: `Authorization: Bearer <token from login>`
- Body (raw JSON):
  ```json
  {
    "prod_id": "P011",
    "name": "Glow Serum",
    "brand": "COSRX",
    "category": "skincare",
    "price": 890.00,
    "details": "Brightening serum with niacinamide",
    "howto": "Apply 2-3 drops after toner",
    "ingredients": "Niacinamide, Hyaluronic Acid",
    "rating": 4,
    "volumes": [30, 50],
    "color": "Clear",
    "quantity": 100
  }
  ```

---

## Extra Remarks / Known Issues

- The `.env` file must have the correct MySQL password before starting the server.
- `node_modules/` folder is excluded from submission (run `npm install` to regenerate).
- Front-end falls back to sample data if the web service is not running.
- Public web service used: **OpenWeather API** (or other — to be implemented in Task 4).
