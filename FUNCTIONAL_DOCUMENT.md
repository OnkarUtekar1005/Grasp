# Grasp Electric — Functional Document
**Version:** 1.0 | **Audience:** AI Support Agent / Admin Staff
**Purpose:** Complete reference for resolving functional queries, support tickets, and admin operations on the Grasp Electric platform.

---

## 1. Application Overview

Grasp Electric is a B2B e-commerce and inquiry management platform for electrical enclosures and industrial equipment. It has two distinct interfaces:

| Interface | URL | Who Uses It |
|-----------|-----|-------------|
| Public Website | `/` | Customers, prospects browsing products |
| Admin Panel | `/admin` | Internal staff managing products, quotes, inquiries |

The platform does **not** handle direct online payments. Instead, customers submit **quote requests** which admins review and respond to manually.

---

## 2. Public Website — Features & Workflows

### 2.1 Browsing Products

**Entry points:**
- Home page → Featured Products section → click any product
- Home page → Categories section → click a category → browse products
- Navigation → Products → filter/search

**Product listing page filters:**
- Category (e.g., Polycarbonate Enclosures, Metal Enclosures)
- Material (e.g., PC, GRP, Steel)
- IP Rating (e.g., IP65, IP66)
- Dimension range (length, width, height in mm)
- Tags / keywords
- Text search (searches name, code, description, specs)

**Product detail page shows:**
- Product name, code, description
- All uploaded images (gallery with thumbnail strip)
- Technical specifications (material, IP rating, dimensions, flammability, color, door type, mounting type, temperature range)
- Product variants (different SKUs/sizes) with stock status
- Feature list
- Dynamic custom specs (any additional key-value specs)
- Downloadable documents (datasheets, manuals, certificates, CAD files)
- Linked gallery project images

### 2.2 Submitting a Quote Request

**Process:**
1. On any product page, select a variant (if applicable) and click **Add to Quote**
2. A quote cart/basket accumulates items across the session
3. Customer navigates to `/quote` and fills in:
   - Company name (required)
   - Contact name (required)
   - Email (required)
   - Phone (optional)
   - Message / special requirements (optional)
   - Quantities per item
4. Customer submits the form
5. System auto-generates a request number in format `QR-YYYY-XXXXX` (e.g., `QR-2025-00042`)
6. Confirmation email is sent to the customer
7. Notification email is sent to all configured admin emails
8. Quote appears in admin panel with status **PENDING**

**What happens after submission:** Admin reviews the quote, may contact the customer, then updates the status and pricing in the admin panel (see Section 3.4).

### 2.3 Submitting an Inquiry / Contact Form

**Process:**
1. Customer navigates to `/contact` or clicks Contact in navigation
2. Fills in:
   - Inquiry type: General / Support / Partnership / Other
   - Company name (optional)
   - Contact name (required)
   - Email (required)
   - Phone (optional)
   - Subject (required)
   - Message (required)
3. Submits the form
4. Admin notification email is sent immediately
5. Inquiry appears in admin panel with status **NEW**

### 2.4 Gallery

- `/gallery` shows the portfolio of completed projects
- Images can be linked to specific products — clicking a gallery image shows which products were used
- Featured gallery images appear on the home page

### 2.5 Downloads

- `/downloads` provides access to downloadable resources (product datasheets, catalogues, technical documents)
- Same documents are also accessible from individual product pages

---

## 3. Admin Panel — Features & Workflows

**Login:** `/admin/login`
**Default credentials (must be changed after first login):**
- Email: `admin@graspelectric.com`
- Password: `admin123`

**Session:** JWT-based, valid for 7 days by default. Automatically expires; user is redirected to login.

### 3.1 Dashboard

**URL:** `/admin/dashboard`

Shows at-a-glance statistics:
- Total / Active / Inactive products
- Total categories
- Quote requests by status (Pending / Reviewed / Quoted / Accepted / Rejected)
- Inquiries by status (New / Read / Replied / Closed)
- Low stock variants (items where stock ≤ low stock threshold)
- Recent 5 quote requests
- Recent 5 inquiries

### 3.2 Product Management

**URL:** `/admin/products`

#### Creating a Product

1. Click **New Product**
2. Fill in:
   - **Name** (required) — display name
   - **Code** — internal product code (e.g., `GE-PC-100`)
   - **Description** — short description shown in listings
   - **Full Description** — detailed description shown on product page
   - **Dimensions** — Length × Width × Height in mm
   - **Specifications** — Material, IP Rating, Flammability, Color, Door Type, Mounting, Temperature Range
   - **Tags** — comma-separated keywords for filtering
   - **Featured** — tick to show on home page
   - **Active** — untick to hide from public
3. Assign to one or more **categories**
4. Add **features** (bullet points describing product features)
5. Add **dynamic specs** (custom key-value pairs for additional technical specs)
6. Upload **images** (JPG, PNG, WEBP — max 10 images; first/primary image shown in listings)
7. Upload **documents** (PDF, DOC, DOCX — datasheets, manuals, certificates, CAD files)
8. Add **variants** (different SKUs/sizes of the same product)
9. Save

#### Editing a Product

1. On Products list, click the product name or edit icon
2. All fields from creation are editable
3. Images can be reordered (drag to change order) and set as primary
4. Documents can be added or deleted
5. Variants can be added, edited (name, SKU, dimensions, weight, stock levels), or deleted
6. Save changes

#### Managing Product Images

- **Primary image**: The image marked as primary appears in product listings and as the first image on the product page. Only one image can be primary at a time.
- **Reordering**: Drag and drop images to change display order
- **Deleting**: Click delete on an image; this removes the file from storage
- **Upload tip**: Images are automatically optimized (resized, compressed) on upload — originals are preserved alongside thumbnails

#### Managing Product Variants

Each variant represents a distinct SKU (e.g., different size of the same enclosure model).

| Field | Description |
|-------|-------------|
| SKU | Unique stock-keeping unit code |
| Name | Display name for this variant (e.g., "300×200×150mm") |
| Dimensions | Specific dimensions for this variant |
| Weight | Weight in kg |
| Stock Quantity | Current stock level |
| Low Stock Threshold | Alert when stock falls to or below this number |
| Active | Show/hide this variant |

**Low stock alert**: Variants at or below their threshold appear on the dashboard under "Low Stock Items".

#### Deleting a Product

- Deleting a product removes it and all its images, documents, and variants
- This cannot be undone
- Alternative: set the product as **Inactive** to hide from public while keeping data

### 3.3 Category Management

**URL:** `/admin/categories`

Categories group products and appear in navigation and the home page categories section.

#### Creating a Category

Fields:
- **Name** (required)
- **Code** — category code prefix (e.g., `GE-PC`)
- **Slug** — URL-safe identifier (auto-generated from name if blank)
- **Description**
- **Tags** — keywords for search
- **Featured** — show on home page categories section
- **Sort Order** — controls display order
- **Image** — representative image for the category

**Pre-seeded categories:**
| Name | Code | Featured |
|------|------|---------|
| Polycarbonate Enclosures | GE-PC | Yes |
| Metal Enclosures | GE-MT | Yes |
| Junction Boxes | GE-JB | Yes |
| Terminal Enclosures | GE-TB | No |
| Hazardous Area Enclosures | GE-HZ | Yes |
| Custom Solutions | GE-CS | No |

#### Assigning Products to Categories

Products can belong to **multiple categories**. Assignment is done from the product edit form (category multi-select).

### 3.4 Quote Request Management

**URL:** `/admin/inquiries` (Quotes tab) or directly from dashboard

#### Quote Status Workflow

```
PENDING → REVIEWED → QUOTED → ACCEPTED
                   ↘ REJECTED
                   ↘ EXPIRED
```

| Status | Meaning |
|--------|---------|
| PENDING | Just submitted by customer, not yet looked at |
| REVIEWED | Admin has opened and reviewed the request |
| QUOTED | Admin has provided pricing |
| ACCEPTED | Customer accepted the quoted price |
| REJECTED | Customer declined or admin rejected |
| EXPIRED | Quote validity period has passed |

#### Processing a Quote

1. Open a quote from the list
2. Review the items: product name, variant, quantity requested
3. Update status to **REVIEWED**
4. Add unit pricing for each line item:
   - Set **Quoted Unit Price** per item
   - System calculates line totals and overall total
5. Set **Quote Valid Until** date
6. Select currency (default: INR)
7. Add **Internal Notes** (not visible to customer)
8. Update status to **QUOTED**
9. Contact the customer externally (email/phone) to share the quote
10. Once customer responds, update to **ACCEPTED** or **REJECTED**

#### Quote Number Format

Auto-generated as `QR-YYYY-XXXXX`:
- `QR` — prefix
- `YYYY` — year of submission
- `XXXXX` — zero-padded sequential number for that year

Example: `QR-2025-00042`

### 3.5 Inquiry Management

**URL:** `/admin/inquiries`

#### Inquiry Status Workflow

```
NEW → READ → REPLIED → CLOSED
```

| Status | Meaning |
|--------|---------|
| NEW | Just submitted, not opened |
| READ | Admin has opened and read the inquiry |
| REPLIED | Admin has responded to the customer (externally) |
| CLOSED | Inquiry resolved and closed |

#### Processing an Inquiry

1. Open an inquiry from the list (status automatically becomes READ)
2. Review: type, contact details, subject, message
3. Respond to customer externally (email or phone — the platform does not send replies directly)
4. Update status to **REPLIED**
5. Add **Internal Notes** for reference
6. Set to **CLOSED** when fully resolved

#### Inquiry Types

| Type | When Used |
|------|-----------|
| GENERAL | General questions about products or company |
| SUPPORT | After-sales support, technical questions |
| PARTNERSHIP | Distributor/reseller inquiries |
| OTHER | Anything that doesn't fit above categories |

### 3.6 Gallery Management

**URL:** `/admin/gallery`

#### Creating a Gallery Entry

1. Click **New Gallery Image**
2. Upload the project photo
3. Fill in:
   - **Title** — name of the project/installation
   - **Description** — details about the project
   - **Alt Text** — accessibility description
   - **Featured** — show on home page
   - **Active** — show in public gallery
   - **Sort Order** — display position
4. Link related products (optional — allows visitors to see what products were used)
5. Save

#### Reordering Gallery

Drag gallery items to reorder, or use the **Bulk Reorder** feature.

### 3.7 Admin User Management

**URL:** `/admin/settings` → Users tab (or `/admin/admins`)

#### Creating an Admin User

1. Click **New Admin**
2. Fill in: Name, Email, Password
3. Save

**Note:** All admin users have full access. There is no role-based permission system within the admin panel — all admins can do everything.

#### Deactivating an Admin User

- Set the user to **Inactive** to prevent login without deleting the account
- An inactive admin's existing sessions are invalidated

#### Resetting a Password

- An admin can reset another admin's password from the user management screen
- Admins can also change their own password via the profile menu → **Change Password**
- **Forgot Password** flow: Enter email on login page → receive reset link by email → set new password

### 3.8 Settings

**URL:** `/admin/settings`

Configurable settings stored in the database:
- `company_name` — displayed in emails and site header
- `company_email` — contact email shown on website
- `company_phone` — contact phone shown on website
- `company_address` — company address shown on website

These settings are editable from the admin settings page and take effect immediately.

---

## 4. Email Notification System

### Automated Emails Sent

| Trigger | Recipient | Content |
|---------|-----------|---------|
| New inquiry submitted | All admin emails | Inquiry type, contact details, subject, message |
| New quote request submitted | All admin emails | Customer details, list of requested items with quantities |
| Quote submitted confirmation | Customer | Confirmation that quote was received, request number |
| Quote status updated | Customer (if configured) | New status, any notes |
| Password reset requested | Requesting admin | Password reset link (valid for limited time) |

### Admin Email Configuration

Admin notification emails are configured via the `ADMIN_EMAILS` environment variable (comma-separated list of email addresses). Changes require a server restart.

SMTP settings (host, port, credentials) are also environment-variable based.

---

## 5. File Management

### Upload Locations

| File Type | Storage Path | Max Files |
|-----------|-------------|-----------|
| Product images | `/uploads/products/` | 10 per product |
| Category images | `/uploads/categories/` | 1 per category |
| Product documents | `/uploads/documents/` | 10 per product |
| Gallery images | `/uploads/gallery/` | 1 per gallery entry |

### Supported File Types

| Type | Formats |
|------|---------|
| Images | JPG, JPEG, PNG, WEBP |
| Documents | PDF, DOC, DOCX |

### Image Processing

On upload, images are automatically:
- Auto-rotated based on EXIF orientation
- Stripped of EXIF metadata
- Saved in three sizes: original, medium, and thumbnail (300×300)
- Compressed (85% quality for originals, 80% for thumbnails)

---

## 6. Stock Management

Stock is tracked at the **variant level**, not product level.

| Concept | Description |
|---------|-------------|
| Stock Quantity | Current number of units available |
| Low Stock Threshold | The level at which a warning appears on the dashboard |
| Low Stock Alert | Variant appears on dashboard when `stock ≤ threshold` |

**Updating stock:** Edit the product → edit the variant → update Stock Quantity → save.

There is no automatic stock deduction when a quote is submitted. Stock management is fully manual.

---

## 7. Common Admin Tasks — Step-by-Step

### How to add a new product

1. Go to `/admin/products` → click **New Product**
2. Enter name, code, description
3. Add specs (material, IP rating, etc.)
4. Assign to category/categories
5. Upload at least one image
6. Upload datasheet PDF if available
7. Add at least one variant (SKU + stock quantity)
8. Set **Active: Yes** and optionally **Featured: Yes**
9. Click **Save**

### How to update stock for a product

1. Go to `/admin/products` → find the product → click Edit
2. Scroll to **Variants** section
3. Find the variant → click Edit Variant
4. Update **Stock Quantity**
5. Click Save Variant → Save Product

### How to respond to a quote request

1. Go to `/admin/quotes` or dashboard → Recent Quotes
2. Open the quote → set status to **REVIEWED**
3. Enter unit prices for each line item
4. Set Quote Valid Until date
5. Set status to **QUOTED**
6. Contact customer externally with the pricing
7. When customer responds, update status to **ACCEPTED** or **REJECTED**

### How to close an inquiry

1. Go to `/admin/inquiries` → open the inquiry
2. Status automatically becomes **READ**
3. Respond to customer externally (email/phone)
4. Update status to **REPLIED**, add internal notes
5. Later, set status to **CLOSED**

### How to feature a product on the home page

1. Go to `/admin/products` → find the product → click Edit
2. Check the **Featured** checkbox
3. Save

### How to add a new admin user

1. Go to `/admin/settings` → Users tab
2. Click **New Admin**
3. Enter name, email, and temporary password
4. Click Save
5. Share credentials with the new admin and ask them to change their password

### How to change your admin password

1. Click your name/avatar in the top-right of the admin panel
2. Select **Change Password**
3. Enter current password and new password
4. Confirm

### How to reset a forgotten admin password

1. On the admin login page, click **Forgot Password**
2. Enter the admin email address
3. Check email for the reset link
4. Click the link, enter new password

---

## 8. Troubleshooting Common Issues

### Customer says they submitted a quote but it's not showing in admin

**Check:**
1. Admin panel → Quotes → make sure no active filters are excluding it
2. Check spam folder of admin email (notification may have been filtered)
3. Check if the customer received a confirmation email (if yes, submission succeeded)
4. Ask the customer for their request number (format: `QR-YYYY-XXXXX`)

### Customer says they can't find a product

**Check:**
1. Admin panel → Products → search for the product
2. Verify **Active** is set to Yes
3. Verify it is assigned to at least one category
4. Check if the product is only visible when logged in as admin (showAll mode)

### Product images not showing on website

**Check:**
1. Admin panel → edit product → confirm images are uploaded and not deleted
2. Confirm at least one image is set as **Primary**
3. Check that the image file format is JPG, PNG, or WEBP
4. Re-upload the image if it appears corrupted

### Admin cannot log in

**Check:**
1. Confirm they are using the correct email (case-insensitive)
2. Try **Forgot Password** flow to reset
3. Verify the admin account is not set to **Inactive** (another admin needs to re-activate it)
4. If all admins are locked out, a database-level password reset is required (contact system admin)

### Quote email notifications not being received by admins

**Check:**
1. Check spam/junk folder
2. Verify `ADMIN_EMAILS` environment variable has the correct email addresses
3. Verify SMTP settings are correct (host, port, credentials)
4. Check server logs for email errors

### Gallery images not showing on home page

**Check:**
1. Admin panel → Gallery → confirm the image has **Featured: Yes** and **Active: Yes**
2. At least one featured+active gallery image must exist for the home page section to show

---

## 9. Data Relationships Summary

```
Organization
└── Project (Grasp Electric)
    ├── Products (many)
    │   ├── Variants (many per product)
    │   ├── Images (many per product)
    │   ├── Documents (many per product)
    │   ├── Features (many per product)
    │   └── Dynamic Specs (many per product)
    ├── Categories (many)
    │   └── Products ←→ Categories (many-to-many)
    ├── Quote Requests (many)
    │   ├── Items (many per quote) → linked to Product + Variant
    │   └── Status History (audit trail)
    ├── Inquiries (many)
    └── Gallery Images (many)
        └── Products ←→ Gallery (many-to-many)
```

---

## 10. API Quick Reference

All API endpoints are prefixed with `/api/v1`. All admin routes require a valid JWT `Authorization: Bearer <token>` header.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | No | Admin login |
| GET | `/auth/me` | Yes | Get current admin |
| GET | `/products` | No | List products (public) |
| GET | `/products/:slug` | No | Product detail (public) |
| POST | `/products` | Yes | Create product |
| PUT | `/products/:id` | Yes | Update product |
| DELETE | `/products/:id` | Yes | Delete product |
| GET | `/categories` | No | List categories (public) |
| POST | `/categories` | Yes | Create category |
| POST | `/quotes` | No | Submit quote request (public) |
| GET | `/quotes` | Yes | List all quotes (admin) |
| PUT | `/quotes/:id` | Yes | Update quote |
| POST | `/inquiries` | No | Submit inquiry (public) |
| GET | `/inquiries` | Yes | List all inquiries (admin) |
| PUT | `/inquiries/:id` | Yes | Update inquiry |
| GET | `/gallery` | No | List gallery (public) |
| POST | `/gallery` | Yes | Create gallery image |
| GET | `/dashboard/stats` | Yes | Dashboard statistics |

---

## 11. Glossary

| Term | Definition |
|------|-----------|
| Quote Request | A customer's request for pricing on one or more products. Not an order — no payment is taken. |
| Inquiry | A general question or contact form submission from a customer. |
| Variant | A specific SKU/size option of a product (e.g., different dimensions of the same enclosure). |
| Primary Image | The main product image shown in listings. Only one per product. |
| Featured | A flag that causes the product, category, or gallery image to appear on the home page. |
| IP Rating | Ingress Protection rating (e.g., IP65 = dust-tight + water jet protected). |
| Datasheet | A technical PDF document for a product, available for download. |
| Low Stock Threshold | The quantity level at which a variant is flagged as low stock on the admin dashboard. |
| Slug | A URL-safe identifier (e.g., `polycarbonate-enclosures`). Auto-generated from the name. |
| Dynamic Spec | A custom key-value specification added to a product beyond the standard spec fields. |
