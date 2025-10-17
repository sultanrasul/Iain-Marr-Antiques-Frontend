# 🏺 Iain Marr Antiques (Frontend)

A responsive, interactive **Progressive Web App (PWA)** for managing inventory and sales at **Iain Marr Antiques**, built with **Svelte**, **Tailwind CSS**, and **Preline**.  
Designed to streamline product management, receipt printing, and stock tracking for staff. The app can be installed on iPads or iPhones via Safari for a native-like experience.

🔗 **Backend Repository:** [Iain Marr Antiques Backend](https://github.com/sultanrasul/Iain-Marr-Antiques-Backend)

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