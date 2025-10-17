# 🏺 Iain Marr Antiques (Frontend)

> Developed end-to-end by **Sultan Rasul** as a freelance project for a local antique store.

🔗 **Backend Repository:** [Iain Marr Antiques Backend](https://github.com/sultanrasul/Iain-Marr-Antiques-Backend)

---

## 🧩 Project Summary

### **Problem**
Staff managed all inventory through a shared Apple Numbers sheet and wrote receipts by hand, resulting in frequent errors, slow transactions, and limited visibility over sales data.  
The existing workflow wasn’t practical for quick lookups or mobile use on iPads.

### **Solution**
Built a **responsive Progressive Web App (PWA)** using **Svelte**, **Tailwind CSS**, and **Preline** to digitise the point-of-sale process.  
Features included:
- Fast, intuitive SKU and name-based product search  
- Dynamic cart system for adding multiple items per sale  
- On-demand receipt printing through backend API integration  
- Mobile-first design installable on iPads/iPhones via Safari for a native-like experience  

### **Impact**
Streamlined daily operations by replacing handwritten receipts with a digital system accessible across devices.  
Improved transaction speed by over 50%, reduced data entry errors, and simplified stock tracking for staff.

---

## ✨ Features

- **PWA Support:** Can be added to home screen, works offline for basic viewing, and behaves like a native app.  
- **Inventory Dashboard:** View all products, search by SKU, name, or seller, and filter sold/available items.  
- **Product Management:** Add, edit, or update product details in real time.  
- **Printing & Receipts:** Select multiple products and print receipts directly from a connected USB receipt printer.  
- **Stock Logging:** Automatically append sold items to Google Sheets for digital record-keeping.  
- **Real-Time Data Fetch:** Integrates with Google Sheets API for accurate stock and sales data.  
- **Sorting & Filtering:** Sort by SKU, name, or price; filter by availability.  
- **Modals for Actions:** Floating modals for adding/editing products and printing receipts.  
- **Responsive UI 📱💻:** Works seamlessly on desktop, tablet, and iPad for staff.

---

## 🛠️ Tech Stack

- **Frontend Framework:** Svelte  
- **Styling:** Tailwind CSS + Preline components  
- **State Management:** Reactive stores and component bindings  
- **API Integration:** Fetches and posts data via REST endpoints on the backend  
- **Printer Integration:** Communicates with a USB receipt printer connected to a Raspberry Pi  
- **PWA Features:** Offline support, installable on devices, native-like experience in Safari  
- **Build Tool & Adapter:** Vite + SvelteKit (static build possible)

---

## ⚙️ Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/sultanrasul/Iain-Marr-Antiques-Frontend.git
cd Iain-Marr-Antiques-Frontend

# 2. Install dependencies
npm install

# 3. Configure backend URL
# Edit ./conf.js and set BACKEND_URL to point to your Flask backend

# 4. Run the development server
npm run dev
```
Once running, open your browser at:

👉 http://localhost:5173

You can now interact with inventory, add/edit products, and print receipts through the connected printer.
For iPad/iPhone, add the site to the home screen for a native app experience.

---

## 🔗 Backend Integration
This frontend communicates with the Flask backend for:
- Stock retrieval (/get_stock)
- Product updates (/add_product, /modify_product)
- Printing receipts (/print_labels)
- Raspberry Pi system commands (/restart, /shutdown)
- Ensure the backend is running and accessible for all functionality.

---

## 📦 Deployment
You can build a static frontend for production:
```bash
npm run build
```
The generated output will be in /build, ready to serve on Nginx or any web server, and integrate with the Raspberry Pi backend.
