## Backend changes (Spring Boot)

- **Validation & DTOs**: Introduced request DTOs with `jakarta.validation` for all major CRUD endpoints:
  - Jobs: `JobCreateRequest`, `JobUpdateRequest` (`JobController` → `JobService`).
  - Bookings: `BookingCreateRequest`, `BookingStatusUpdateRequest`, `BookingUpdateRequest` (`BookingController` → `BookingService`).
  - Reviews/complaints/messaging: `ReviewCreateRequest`, `ReviewUpdateRequest`, `ComplaintCreateRequest`, `ComplaintStatusUpdateRequest`, `MessageThreadCreateRequest`, `MessageCreateRequest` (`ReviewController` → `ReviewService`).
  - Equipment: `EquipmentCreateRequest`, `EquipmentUpdateRequest`, `EquipmentBookingRequest` (`EquipmentController` → `EquipmentService`).
  - Worker profile: `WorkerProfileUpdateRequest` (`WorkerController` → `UserService`).
- **Global error handling**: Existing `GlobalExceptionHandler` now receives validation errors from the new DTOs, returning consistent `ApiResponse` JSON for bad requests.
- **Security rules** (`SecurityConfig`):
  - Public (no auth): `POST /api/auth/**`, `GET /api/jobs`, `GET /api/jobs/categories`, `GET /api/equipment`, `GET /api/equipment/categories`, `GET /api/workers`, `GET /api/workers/{id}`.
  - All other endpoints require a valid JWT; method-level `@PreAuthorize` still applies (e.g. admin user management).
- **Equipment inventory & late fees**:
  - Removed manual quantity updates from `EquipmentService.bookEquipment` and `returnEquipment`; the MySQL triggers in `database_schema.sql` now own inventory changes.
  - `EquipmentService.calculateLateFee` delegates to the `calculate_late_fee` stored procedure via `EquipmentBookingRepository.callCalculateLateFee`, then reloads the booking to return up-to-date late-fee data.

## Frontend changes (React)

- **Role‑aware navigation & dashboard**:
  - `Navbar` and `Dashboard` now filter visible modules based on `user.role` (`customer`, `worker`, `supplier`, `admin`) so each role sees the most relevant flows.
  - User role and email are still shown in the header for clarity.
- **Admin complaint management UI**:
  - `ReviewsPage` still lists all complaints, but only `admin` users see the Investigate/Resolve/Delete actions. Other roles can submit and view complaints but not change their status.
- **Equipment supplier UX**:
  - In `EquipmentPage`, only `supplier` and `admin` roles see the “Add Equipment” button and per-item delete button; all authenticated users can browse and rent.
- **Google login entry point**:
  - `LoginPage` includes a “Continue with Google” button to match the UI requirement; it currently shows a clear message that Google login is not configured in this demo (no backend OAuth flow wired yet).

## How to run & test locally

1. **Backend**
   - Ensure MySQL is running and execute `database_schema.sql` once to create schema, tables, triggers, and procedures.
   - Update `backend/src/main/resources/application.properties` with your local DB credentials and JWT secret.
   - From the `backend` folder, run (with Maven installed or using `mvnw`/`mvnw.cmd`):
     - `mvn -DskipTests spring-boot:run`
   - Test key endpoints via Postman (example base URL `http://localhost:8083/api`):
     - Member 1: `/auth/register`, `/auth/login`, `/workers/me`, `/workers/admin/users`.
     - Member 2: `/jobs`, `/jobs/{id}`, `/jobs/my`, `/jobs/categories`.
     - Member 3: `/bookings`, `/bookings/my`, `/bookings/{id}/status`, `/bookings/{id}/history`.
     - Member 4: `/reviews`, `/reviews/worker/{workerUserId}`, `/complaints`, `/messages/threads`.
     - Member 5: `/equipment`, `/equipment/book`, `/equipment/bookings/{id}/return`, `/equipment/bookings/{id}/late-fee`, `/equipment/my-bookings`.

2. **Frontend**
   - From the `frontend` folder:
     - `npm install`
     - `npm run dev`
   - Navigate to the Vite dev URL (default `http://localhost:5173`).
   - Create test accounts for each role (customer, worker, supplier, admin) and verify:
     - Visible nav items change appropriately per role.
     - CRUD flows work end‑to‑end for each member’s pages (create, read, update, delete where applicable).

## Recommended manual test scenarios

- **Member 1 (Auth & Workers)**:
  - Register/login for each role; verify JWT stored and role shown in UI.
  - As worker, update profile via `Workers` page and confirm changes persist.
  - As admin, list users and toggle active status; verify suspended users cannot log in.
- **Member 2 (Jobs)**:
  - As customer, create a job with category, budget, and urgency; confirm it appears in list and can be edited/deleted only by the owner.
  - Filter jobs by district and category and confirm the backend filtering works.
- **Member 3 (Bookings)**:
  - As customer, create bookings for a job + worker; check status starts as `requested` and history logs creation.
  - As worker, use the “view as worker” toggle to accept, start, complete, and cancel bookings; verify invalid transitions are rejected with clear error messages.
- **Member 4 (Reviews & Complaints)**:
  - After a completed booking, submit a review and confirm it appears in the worker’s review list.
  - Submit complaints from a customer/worker account and then log in as admin to change their status to `investigating` and `resolved`.
- **Member 5 (Equipment)**:
  - As supplier, add equipment, then as customer, rent it and confirm availability decreases and the rental appears under “My Rentals”.
  - Create an overdue booking and call the late‑fee endpoint; verify the fee matches the DB procedure’s logic and that inventory quantities remain correct after return.

These notes should help future contributors understand the main implementation decisions and how to verify each member’s CRUD responsibilities quickly.

