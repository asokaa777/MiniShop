# AI Usage Documentation

This project was developed with assistance from **ChatGPT (OpenAI)** and **Kiro IDE (AI-powered development environment powered by Claude)**.

---

## Tools Used

| Tool              | Purpose                                                                                                                                                                                                                             |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ChatGPT (OpenAI)  | Guided the project implementation from start to finish, including application architecture, Laravel REST API development, React frontend implementation, debugging, feature integration, documentation, and technical explanations. |
| Kiro IDE (Claude) | Assisted in refining the final implementation by improving the Admin Dashboard, checkout workflow, fixing the product stock decrement bug, and ensuring product data remains consistent after page refresh.                         |

---

## Example Prompts Used

### Prompt 1 – Full Stack Project Development (ChatGPT)

> "Help me build a Full Stack MiniShop application using Laravel REST API and React.js based on the provided technical test PDF. Implement the project step by step without skipping any required features."

**Purpose**

This prompt guided the overall development process based on the technical test requirements, including building the product catalog, shopping cart, checkout flow, admin dashboard, CRUD operations, frontend-backend integration, debugging, and project documentation.

---

### Prompt 2 – Checkout & Inventory Management (Kiro)

> "Implement the checkout feature in Laravel so that creating an order also creates order_items, reduces product stock inside a database transaction, and rolls back if stock is insufficient."

**Purpose**

This prompt was used to improve the checkout implementation by fixing the stock decrement issue, ensuring transactional database consistency, refining the checkout flow, and making product data remain synchronized after page refresh.

---

## Note

AI was used as a development assistant throughout the project. All generated suggestions were reviewed, tested, modified where necessary, and integrated manually. The final architecture, implementation, debugging, and testing decisions were performed by the developer.
