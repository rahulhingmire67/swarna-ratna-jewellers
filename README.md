# Swarna Ratna Jewellers - Production-Ready Indian Jewellery Platform

A high-fashion Indian jewellery boutique showroom with a full-stack **MongoDB + Node.js (Express)** backend, dedicated management portal, and responsive public showroom.

---

## 🚀 Quick Start (Local)

Simply double-click [index.html](file:///c:/Users/rahul.hingmire/Music/jewellers/index.html) or [admin.html](file:///c:/Users/rahul.hingmire/Music/jewellers/admin.html) to run the showroom directly in any browser. It automatically uses intelligent local caching when offline.

When Node.js is installed on your system, you can run the full backend server:
```bash
npm install
npm start
```
The site runs at `http://localhost:5000` with the live MongoDB API.

---

## 🌐 How to Make It Live on the Internet (Free 5-Minute Guide)

To make your website live on the web so customers and you can access it from any phone or computer:

### Step 1: Set up Free Cloud Database (MongoDB Atlas)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a **Free Shared Cluster** (e.g. AWS `ap-south-1` Mumbai region).
3. Under **Database Access**, create a user (e.g. `jeweller_admin` and set a password).
4. Under **Network Access**, click **Add IP Address** -> select **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Click **Connect** -> **Drivers (Node.js)** -> copy your connection URI:
   ```
   mongodb+srv://jeweller_admin:<password>@cluster0.mongodb.net/jewellery_db?retryWrites=true&w=majority
   ```

### Step 2: Deploy Free Live Server (Render.com or Railway.app)
1. Upload your code folder to a free GitHub repository (e.g. `my-jewellery-shop`).
2. Go to [render.com](https://render.com) and click **New Web Service**.
3. Connect your GitHub repository.
4. Settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Under **Environment Variables**, add:
   - `MONGODB_URI` = *(paste your MongoDB Atlas URI from Step 1)*
   - `PORT` = `5000`
6. Click **Deploy Web Service**!

Your website will be live at `https://your-shop-name.onrender.com` with a free SSL certificate (`https://`).

---

## 📁 Project Structure

- **[server.js](file:///c:/Users/rahul.hingmire/Music/jewellers/server.js)** – Production Express server with Mongoose schemas and REST API endpoints (`/api/products`, `/api/rates`, `/api/settings`, `/health`).
- **[package.json](file:///c:/Users/rahul.hingmire/Music/jewellers/package.json)** – Project dependencies (`express`, `mongoose`, `cors`, `dotenv`).
- **[.env.example](file:///c:/Users/rahul.hingmire/Music/jewellers/.env.example)** – Environment variable template for MongoDB Atlas URI.
- **[data.js](file:///c:/Users/rahul.hingmire/Music/jewellers/data.js)** – Hybrid data layer connecting frontends to MongoDB API with automatic offline fallback.
- **[index.html](file:///c:/Users/rahul.hingmire/Music/jewellers/index.html)** – Public luxury showroom with SEO metadata & Google LocalBusiness Schema.org.
- **[styles.css](file:///c:/Users/rahul.hingmire/Music/jewellers/styles.css)** – Royal Ivory & Champagne Gold design system.
- **[admin.html](file:///c:/Users/rahul.hingmire/Music/jewellers/admin.html)** – Admin management portal for adding products, updating rates, and managing store settings.
- **[admin.css](file:///c:/Users/rahul.hingmire/Music/jewellers/admin.css)** & **[admin.js](file:///c:/Users/rahul.hingmire/Music/jewellers/admin.js)** – Admin dashboard styling and asynchronous controllers.
