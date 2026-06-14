# Auth Service Multi-Module Analysis (GC-PROJ)

## 1. Architectural Restructuring
The project has been refactored from a single-module monolith-style structure into a **Multi-Module Maven Project**. This separation enforces a strict **Hexagonal Architecture** (Domain-Centric Design).

### The New Modules:
1.  **`auth-domain`**:
    *   **Purpose**: The core "heart" of the service.
    *   **Content**: Business entities (`User`), Domain models, and Repository interfaces.
    *   **Dependencies**: Zero (Pure Java).
2.  **`auth-application`**:
    *   **Purpose**: Orchestrates the business logic.
    *   **Content**: Use cases (`AuthUseCase`), DTOs, and Port definitions.
    *   **Dependencies**: `auth-domain`.
3.  **`auth-infrastructure`**:
    *   **Purpose**: Technical implementation of the ports.
    *   **Content**: JPA adapters (`UserRepositoryAdapter`), Database entities (`UserEntity`), Security configuration, and JWT logic.
    *   **Dependencies**: `auth-application`, Spring Data JPA, H2, JJWT, Spring Security.
4.  **`auth-api`**:
    *   **Purpose**: The external entry point.
    *   **Content**: REST Controllers (`AuthController`), Global Exception Handlers, and the Main Spring Boot Application class.
    *   **Dependencies**: `auth-infrastructure`, Spring Web.

---

## 2. Shared Libraries Used
The following industry-standard libraries were used to build this service:

| Library | Module | Purpose |
| :--- | :--- | :--- |
| **Spring Boot 3.2.5** | Parent / Api | Core runtime and dependency management. |
| **Spring Security** | Infrastructure | Password encryption and authentication logic. |
| **JJVT (io.jsonwebtoken)** | Infrastructure | Token generation and validation (JWT). |
| **Spring Data JPA** | Infrastructure | ORM for database persistence. |
| **H2 Database** | Infrastructure | Lightweight in-memory database for rapid development. |
| **Lombok** | Parent | Annotation-based boilerplate reduction. |
| **Jakarta Validation** | Api | Ensuring incoming requests contain valid data. |

---

## 3. Benefits of this Structure
*   **Decoupling**: You can change the database (e.g., move from H2 to PostgreSQL) by only modifying the `auth-infrastructure` module.
*   **Testability**: The `auth-domain` and `auth-application` can be tested without starting a web server or database.
*   **Scalability**: Different teams can work on different modules with clear boundaries.
*   **Security**: Business logic doesn't have access to the raw HTTP requests or Database queries, preventing "leaky abstractions".
