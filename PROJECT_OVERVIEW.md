# Grasp Electric - Project Overview
### A Simple Guide for Non-Technical Users

---

## What Is This Project?

This is a **complete website system** for Grasp Electric that includes:
1. **Public Website** - What your customers see
2. **Admin Panel** - Where you manage everything

Think of it like a shop:
- The **website** is your showroom where customers browse products
- The **admin panel** is your back office where you manage inventory and orders

---

## How Does It Work?

```
┌─────────────────────────────────────────────────────────────────┐
│                         CUSTOMERS                                │
│                    (Using phones/computers)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PUBLIC WEBSITE                              │
│                                                                  │
│   Home Page → Products → Product Details → Contact/Quote        │
│                                                                  │
│   Customers can:                                                 │
│   • Browse all products                                          │
│   • View product specifications                                  │
│   • Download datasheets (PDF)                                    │
│   • Request quotes                                               │
│   • Send inquiries                                               │
│   • View gallery                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ (Data stored in)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE                                  │
│                  (Central Storage System)                        │
│                                                                  │
│   Stores: Products, Categories, Images, Quote Requests,          │
│           Customer Inquiries, Admin Users, Gallery Images        │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ (Managed through)
                              │
┌─────────────────────────────────────────────────────────────────┐
│                       ADMIN PANEL                                │
│                   (Your Control Center)                          │
│                                                                  │
│   You can:                                                       │
│   • Add/Edit/Delete Products                                     │
│   • Add/Edit/Delete Categories                                   │
│   • Upload Product Images & Documents                            │
│   • View Customer Quote Requests                                 │
│   • View Customer Inquiries                                      │
│   • Manage Gallery Images                                        │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────────┐
│                          YOU                                     │
│                    (Admin/Owner)                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## The Customer Journey

### Step 1: Customer Visits Website
Customer opens your website (www.graspelectric.com)

### Step 2: Browses Products
- Sees featured products on homepage
- Can browse by categories (e.g., "IP67 Enclosures", "Junction Boxes")
- Can search for specific products

### Step 3: Views Product Details
- Sees product images
- Reads specifications (material, dimensions, IP rating, etc.)
- Sees features list
- Can download PDF datasheet

### Step 4: Takes Action
**Option A:** Requests a Quote
- Adds products to quote cart
- Fills contact details
- Submits quote request
- You receive the request in admin panel

**Option B:** Sends Inquiry
- Fills contact form
- Asks questions
- You receive the inquiry in admin panel

---

## Your Admin Tasks

### Daily/Weekly Tasks

| Task | Where to Do It | How |
|------|----------------|-----|
| Check new quote requests | Admin → Quotes | Review and respond to customers |
| Check new inquiries | Admin → Inquiries | Reply to customer questions |
| Add new product | Admin → Products → Add New | Fill form, upload images |
| Update product info | Admin → Products → Edit | Change any details |
| Add product images | Admin → Products → Edit | Upload new photos |

### Managing Products

**To Add a New Product:**
1. Go to Admin Panel
2. Click "Products" in sidebar
3. Click "Add New Product"
4. Fill in:
   - Product Name
   - Product Code
   - Select Category
   - Description
   - Specifications (material, IP rating, dimensions, etc.)
   - Features (bullet points)
5. Upload product images
6. Upload PDF datasheet (optional)
7. Click "Save"

**To Edit a Product:**
1. Go to Products list
2. Find the product
3. Click "Edit"
4. Make changes
5. Click "Save"

### Managing Categories

Categories are like folders that organize your products.
Example: "Polycarbonate Enclosures", "Metal Enclosures", "Junction Boxes"

**To Add a New Category:**
1. Go to Admin → Categories
2. Click "Add New"
3. Enter category name and description
4. Upload category image
5. Save

---

## What Gets Stored Where?

| Information | Stored In | Who Can See |
|-------------|-----------|-------------|
| Products | Database | Everyone (website) |
| Categories | Database | Everyone (website) |
| Product Images | Server (uploads folder) | Everyone (website) |
| PDF Documents | Server (uploads folder) | Everyone (website) |
| Quote Requests | Database | Only Admin |
| Customer Inquiries | Database | Only Admin |
| Admin Passwords | Database (encrypted) | No one (secure) |

---

## Important Concepts

### Categories vs Products
- **Category** = A group/type (e.g., "Polycarbonate Enclosures")
- **Product** = A specific item (e.g., "IP67 Plain Walled Enclosure 2.04")
- One category can have many products
- One product can belong to multiple categories

### Product Information Structure

```
Product
├── Basic Info
│   ├── Name: "IP67 Plain Walled Enclosure"
│   ├── Code: "2.04"
│   └── Description: "Thermoplastic enclosure..."
│
├── Specifications (Technical Details)
│   ├── Material: "ABS/PC"
│   ├── IP Rating: "IP67"
│   ├── Fire Rating: "UL94V-0"
│   ├── Temperature Range: "-25 to +80°C"
│   └── Dimensions: "180x180x100mm"
│
├── Features (Selling Points)
│   ├── "Plain walled enclosures"
│   ├── "Rust proof polymer screws"
│   └── "UV Stabilised"
│
├── Images (Photos)
│   ├── Main image
│   └── Additional angles
│
└── Documents (PDFs)
    └── Datasheet PDF
```

---

## Security

- **Admin Login Required**: Only authorized users can access admin panel
- **Passwords are Encrypted**: Stored securely, no one can see them
- **Session Timeout**: Auto logout after inactivity for security

### Login Credentials
- URL: yourwebsite.com/admin
- Email: (your admin email)
- Password: (your password)

---

## Common Questions

**Q: Can customers buy products directly?**
A: No, this is a quote-based system. Customers request quotes, and you respond with pricing.

**Q: Can I add multiple images per product?**
A: Yes, you can upload multiple images. The first one becomes the main image.

**Q: What happens when a customer submits a quote?**
A: You'll see it in Admin → Quotes. You can then contact them with pricing.

**Q: Can I delete a product?**
A: Yes, but be careful - this cannot be undone.

**Q: Can multiple people use the admin panel?**
A: Yes, you can create multiple admin accounts.

---

## System Components (Technical Summary)

For reference, here's what powers the system:

| Component | Technology | Purpose |
|-----------|------------|---------|
| Website (Frontend) | React | What users see and interact with |
| Server (Backend) | Node.js + Express | Handles data and business logic |
| Database | PostgreSQL | Stores all information |
| File Storage | Local Server | Stores images and PDFs |

---

## Support

If you need help:
1. Check this guide first
2. Contact your developer
3. Report issues at the project repository

---

*Document created for Grasp Electric project owners and administrators.*
