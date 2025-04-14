# Restaurant Menu System Implementation

## Database Changes
- [ ] Create `menu_items` table (id, name, description, price, image_url, created_at, updated_at)
- [ ] Create `orders` table (id, user_id, rsvp_id, total_amount, status, created_at, updated_at)
- [ ] Create `order_items` table (id, order_id, menu_item_id, quantity, notes, created_at)

## Organizer Features
- [ ] Create organizer menu management page
- [ ] Add menu item form component
- [ ] Edit menu item functionality
- [ ] Delete menu item functionality
- [ ] Menu item list view with current items

## Guest Features
- [ ] Create menu browsing page for guests
- [ ] Menu item display with images
- [ ] Order creation form
- [ ] Order confirmation page
- [ ] View/modify existing order

## Restaurant Dashboard
- [ ] Create restaurant order dashboard
- [ ] Order summary view (total counts per dish)
- [ ] Detailed order list
- [ ] Order status management
- [ ] Export functionality for orders

## API Endpoints
- [ ] GET /api/menu/items
- [ ] POST /api/organizer/menu/add-item
- [ ] PUT /api/organizer/menu/update-item
- [ ] DELETE /api/organizer/menu/delete-item
- [ ] GET /api/orders
- [ ] POST /api/orders/create
- [ ] PUT /api/orders/update
- [ ] GET /api/restaurant/orders
- [ ] PUT /api/restaurant/orders/update-status