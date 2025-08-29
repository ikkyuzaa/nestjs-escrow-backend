# NestJS Escrow Platform Backend

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) ![TypeORM](https://img.shields.io/badge/TypeORM-262627?style=for-the-badge&logo=typeorm&logoColor=white) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

A comprehensive, production-ready backend for an Escrow platform built with NestJS, TypeORM, and PostgreSQL. This project showcases a modern, modular architecture designed for scalability, security, and maintainability, making it a perfect foundation for any fintech or marketplace application requiring trusted, multi-party transactions.

## ✨ Features

This project implements a complete, end-to-end transaction lifecycle with a robust state machine and role-based access control.

* **🛡️ Secure Authentication & Authorization (`AuthModule`)**
    * User registration and login.
    * Secure password hashing with **Argon2**.
    * JWT-based authentication using **Passport.js**.
    * Role-based authorization with a dedicated **Admin Guard**.

* **👤 User Management (`UserModule`)**
    * Manages user profiles and roles (`USER`, `ADMIN`).

* **🔄 Transaction Lifecycle ("Happy Path") (`TransactionModule`)**
    * Sellers can create new transactions.
    * Sellers can update shipping information.
    * Buyers can confirm receipt of goods to complete the transaction.

* **💳 Automated Payment Flow (`PaymentModule`)**
    * Automatically creates a `Payment` record for every new `Transaction`.
    * Includes a webhook endpoint (`/payments/webhook`) to simulate successful payment confirmation from a payment gateway, automatically updating transaction status.

* **⚖️ Dispute Management ("Unhappy Path") (`DisputeModule`)**
    * Users (buyers or sellers) can open a dispute for an active transaction.
    * Opening a dispute automatically places the transaction in a `DISPUTED` state, pausing the flow.

* **👑 Admin Panel API (`AdminModule`)**
    * Secure endpoints accessible only by users with the `ADMIN` role.
    * Admins can view all open disputes.
    * Admins can resolve disputes, which in turn updates the status of both the dispute and the associated transaction (e.g., to `COMPLETED` or `REFUNDED`).

## 🏛️ System Architecture

This project is built using a **Modular Monolith** architecture. Each core feature (Auth, Transactions, Payments, etc.) is encapsulated within its own dedicated NestJS module. This approach provides clear separation of concerns, enhances maintainability, and makes the system ready to be scaled into individual microservices in the future.

```mermaid
graph TD
    subgraph "USER LAYER"
        A["Web / Mobile App (Frontend)"]
    end

    subgraph "GATEWAY LAYER"
        B["API Gateway (Auth, Rate Limit)"]
    end

    subgraph "BACKEND SERVICES (NestJS)"
        C["Auth Module"]
        D["User Module"]
        E["Transaction Module"]
        F["Payment Module"]
        G["Dispute Module"]
        H["Admin Module"]
    end

    subgraph "DATA & EXTERNAL LAYER"
        I[("PostgreSQL DB")]
        J[("Redis Cache")]
        K["External APIs (Bank, KYC)"]
    end

    %% Main Flow
    A --> B

    %% Gateway to Services
    B --> C
    B --> D
    B --> E
    B --> F
    B --> G
    B --> H

    %% Inter-Module Communication
    E --> F & G
    F --> E
    G --> E
    H --> G

    %% Data Access
    C & D & E & F & G & H --> I
    C & D & E & F & G & H --> J
    F --> K
## 🚀 Getting Started

### Prerequisites

* Node.js (v18 or higher)
* npm or yarn
* PostgreSQL database
* Docker (optional, for running PostgreSQL)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/nestjs-escrow-backend.git](https://github.com/your-username/nestjs-escrow-backend.git)
    cd nestjs-escrow-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the `.env.example` file (if you create one). Fill in your database credentials and JWT secret.
    ```env
    # Database Configuration
    DATABASE_TYPE=postgres
    DATABASE_HOST=localhost
    DATABASE_PORT=5432
    DATABASE_USERNAME=your_db_user
    DATABASE_PASSWORD=your_db_password
    DATABASE_NAME=your_db_name

    # JWT Configuration
    JWT_SECRET=your_super_secret_key
    JWT_EXPIRES_IN=3600s
    ```

4.  **Run database migrations:**
    This will create all the necessary tables (`users`, `transactions`, `payments`, `disputes`).
    ```bash
    npm run typeorm -- migration:run
    ```

5.  **Run the application:**
    ```bash
    # Watch mode
    npm run start:dev

    # Production mode
    npm run start:prod
    ```
    The application will be running on `http://localhost:3000`.

## ✅ Running Tests

This project includes a basic test setup. You can run the tests using the following commands:

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov

📄 License
This project is licensed under the MIT License. See the LICENSE file for details.
