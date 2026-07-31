# Gear Organizer — Project Bootstrap Specification

> This file is the implementation brief for the coding agent. Read it fully before changing the repository.

## 1. Objective

Bootstrap a cross-platform mobile application and a minimal backend for a **visual gear organizer for tech people**.

The long-term product will help users record:

- **Places** where equipment is stored, such as a room, cabinet, drawer, shelf, box, backpack, case, or active desk setup.
- **Items** stored in those places, such as cables, adapters, computers, gaming accessories, camera equipment, networking devices, tools, and spare parts.

The long-term domain relationship is:

```text
Place
├── nested Place
├── Item
└── Item
```

For the initial milestone, do **not** implement the product domain yet. The goal is to create a clean foundation and prove end-to-end communication between the mobile app and backend.

## 2. Initial milestone

Deliver a runnable repository in which:

1. The C# backend runs in Docker.
2. The React Native application is based on Expo and Infinite Red Ignite.
3. A development Docker image exists for the mobile project.
4. The mobile app can run on:
   - Windows with Android Emulator or a physical Android device.
   - macOS with Android Emulator, iOS Simulator, or physical devices.
5. The mobile app calls a public backend endpoint without authentication.
6. The backend returns a simple JSON response.
7. The mobile app renders loading, success, and error states.
8. The repository contains useful root-level `README.md` and `AGENTS.md` files.

The expected vertical slice is approximately:

```text
Mobile app -> GET /api/hello -> ASP.NET Core API
```

Example response:

```json
{
  "message": "Hello from Gear Organizer API"
}
```

## 3. Technology decisions

### 3.1 Mobile

Use:

- React Native.
- Expo.
- TypeScript with strict type checking.
- Infinite Red Ignite as the project foundation.
- The latest stable Ignite release compatible with the current stable Expo SDK at implementation time.
- Ignite's recommended defaults unless there is a concrete technical reason to change them.

Generate the project using the official Ignite CLI, for example:

```bash
npx ignite-cli@latest new GearOrganizer --yes
```

Before generating, inspect the current CLI options and generated dependency versions. Do not copy an old Ignite template manually.

Keep the architecture supplied by Ignite unless a requirement in this document explicitly conflicts with it. Do not replace Ignite's navigation, state, API, styling, or testing choices merely because another library is personally preferred.

Use Expo development builds when native functionality requires them. Expo Go may be used for the first HTTP proof of concept if the generated project supports it, but the repository must remain ready for development builds.

### 3.2 Backend

Use:

- C#.
- ASP.NET Core on **.NET 10 LTS**.
- ASP.NET Core Minimal APIs for the initial endpoint.
- Nullable reference types enabled.
- Implicit usings enabled.
- OpenAPI support in development.
- A multi-stage Dockerfile.

Do not add a database, Entity Framework Core, authentication, authorization, message broker, cache, or cloud-specific infrastructure in this milestone.

### 3.3 Containers

Use Docker from the beginning for both projects, with an important platform boundary:

- The backend must be fully runnable in Docker.
- The mobile project must have a development container suitable for deterministic dependency installation, linting, formatting, type checking, tests, and optionally running Metro.
- Android Emulator and iOS Simulator remain host applications.
- iOS native compilation and iOS Simulator execution must run on macOS, not inside a Linux Docker container.
- Android native compilation may run on the host. Do not attempt to run Android Emulator inside the normal mobile development container.

The Docker setup must not pretend that native simulators can run portably inside the container.

## 4. Repository structure

Create a simple repository with the following shape. Minor variations are acceptable when required by Ignite or .NET tooling, but keep mobile and backend clearly separated.

```text
/
├── AGENTS.md
├── README.md
├── compose.yaml
├── .env.example
├── .gitignore
├── apps/
│   ├── mobile/
│   │   ├── Dockerfile.dev
│   │   ├── .dockerignore
│   │   └── ...Ignite application
│   └── backend/
│       ├── Dockerfile
│       ├── .dockerignore
│       ├── GearOrganizer.Api/
│       ├── GearOrganizer.Api.Tests/
│       └── GearOrganizer.sln
└── docs/
    └── architecture.md
```

Do not introduce Nx, Turborepo, Kubernetes, or another orchestration layer in the initial milestone.

## 5. Backend requirements

### 5.1 Endpoint

Implement:

```http
GET /api/hello
```

Successful response:

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "message": "Hello from Gear Organizer API"
}
```

Also expose a simple health endpoint:

```http
GET /health
```

### 5.2 Development configuration

- Listen on container port `8080` over HTTP for local development.
- Map the API to host port `8080` in `compose.yaml`.
- Enable OpenAPI only in the Development environment.
- Configure development CORS so the Expo application can call the API.
- Do not use local HTTPS certificates for this first milestone; use HTTP locally and document that this is development-only.
- Return structured JSON errors where practical.

### 5.3 Tests

Create at least one automated backend test that verifies:

- `GET /api/hello` returns HTTP 200.
- The JSON response contains the expected message.

Prefer an integration-style test using the ASP.NET Core test host rather than testing a trivial constant in isolation.

## 6. Mobile requirements

### 6.1 Initial screen

Create a small screen consistent with Ignite's design system. It must include:

- App title: `Gear Organizer`.
- A short description such as `Your visual map of tech gear and storage places.`
- A button labeled `Test API connection`.
- A visible loading state while the request is running.
- A success state displaying the message returned by the backend.
- A useful error state with a retry action.

Do not build the Places or Items UI in this milestone.

### 6.2 API client

- Use the API approach already included or recommended by the generated Ignite project.
- Keep network code outside the screen component.
- Define typed request/response boundaries.
- Add a small configuration module for the API base URL.
- Do not hardcode a single URL that only works on one platform.

Use an environment variable:

```text
EXPO_PUBLIC_API_URL
```

Provide `.env.example` with documented examples:

```dotenv
# iOS Simulator on macOS
EXPO_PUBLIC_API_URL=http://localhost:8080

# Android Emulator on Windows or macOS
# EXPO_PUBLIC_API_URL=http://10.0.2.2:8080

# Physical device on the same local network
# EXPO_PUBLIC_API_URL=http://192.168.x.x:8080
```

Document that `10.0.2.2` is the Android Emulator alias for the host loopback interface, while a physical device needs the computer's LAN address.

Validate that the environment variable exists and show a clear development error when it is missing.

### 6.3 Mobile tests and quality

At minimum, ensure these commands exist and pass:

- Type checking.
- Linting.
- Unit tests supplied by Ignite plus any adjusted tests required by the changed initial screen.

Add a focused test for the API client or the screen state transition if it can be done without fighting the generated architecture.

## 7. Docker requirements

### 7.1 Backend Dockerfile

Create a production-shaped multi-stage Dockerfile:

1. Restore dependencies.
2. Build and publish the API.
3. Run it from the ASP.NET Core runtime image.
4. Expose port `8080`.
5. Run as a non-root user when supported by the chosen official image and project layout.

Add an effective `.dockerignore`.

### 7.2 Mobile development Dockerfile

Create `apps/mobile/Dockerfile.dev` using a current Node LTS image supported by Ignite.

It should:

- Install the package manager selected by the generated Ignite project.
- Install dependencies reproducibly from the lockfile.
- Set the mobile directory as the working directory.
- Support commands for lint, typecheck, tests, and Expo/Metro development.
- Avoid copying `node_modules` from the host.

The container must not contain Android Studio, Xcode, an Android Emulator, or an iOS Simulator.

### 7.3 Compose

Create `compose.yaml` with at least:

- `api` service.
- `mobile` development service.

Recommended behavior:

- `docker compose up api` starts the backend.
- `docker compose run --rm mobile <command>` runs mobile quality commands in a consistent environment.
- Running Metro from the container may be provided through an explicit Compose profile or documented command, but local host execution must remain supported because device and simulator networking can vary.
- Add a backend health check.
- Avoid unnecessary databases or infrastructure services.

Do not make the mobile container a hard prerequisite for everyday local simulator development. It is an available, supported workflow, not an artificial limitation.

## 8. Cross-platform development workflows

Document and verify the following workflows as far as the current execution environment permits.

### Windows + Android

1. Install Docker Desktop, Node.js, Android Studio, and the Android SDK.
2. Start the backend:

```bash
docker compose up --build api
```

3. Configure:

```dotenv
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080
```

4. Start the Ignite/Expo app on the host.
5. Run it in Android Emulator.

### macOS + Android

Use the same API address for Android Emulator:

```dotenv
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080
```

### macOS + iOS

1. Start the backend in Docker.
2. Configure:

```dotenv
EXPO_PUBLIC_API_URL=http://localhost:8080
```

3. Start the Ignite/Expo app on the host.
4. Run it in iOS Simulator or through an Expo development build.

### Physical devices

Document how to use the development computer's LAN IP and note that:

- The phone and computer must normally be on the same reachable network.
- The host firewall must allow the selected port.
- `localhost` on the phone refers to the phone itself, not the development computer.

## 9. `AGENTS.md` requirements

Create a root `AGENTS.md` intended for Codex and other coding agents. It must be concise but operationally useful.

Include:

- Product purpose.
- Repository structure.
- Current milestone and explicit non-goals.
- Technology choices that must not be changed casually.
- Commands for setup, running, linting, type checking, tests, and Docker.
- Coding conventions for TypeScript and C#.
- Requirement to keep changes focused and avoid speculative abstractions.
- Requirement to update `README.md` when commands or setup change.
- Requirement to run relevant validation before finishing a task.
- A warning not to commit secrets or real local IP addresses.

Use the conventional uppercase filename exactly:

```text
AGENTS.md
```

## 10. `README.md` requirements

Create a root README that allows a developer unfamiliar with the repository to get the vertical slice running.

Include:

1. Product summary.
2. Current project status.
3. Architecture overview.
4. Repository structure.
5. Prerequisites for Windows and macOS.
6. Backend Docker commands.
7. Mobile setup commands.
8. Environment variable configuration.
9. Platform-specific API URLs.
10. How to run Android on Windows/macOS.
11. How to run iOS on macOS.
12. Docker-based quality commands for mobile.
13. Native host-based development commands.
14. Test, lint, format, and typecheck commands.
15. Troubleshooting for API connectivity.
16. Explicit note that iOS builds require macOS/Xcode or EAS Build.

Do not claim that the complete mobile application can be built and run exclusively inside Docker.

## 11. Architecture documentation

Create `docs/architecture.md` with a lightweight explanation of:

- Mobile application.
- Backend API.
- Docker's role.
- Native host toolchain boundary.
- How configuration flows through `EXPO_PUBLIC_API_URL`.
- Current request flow from the screen to `/api/hello`.
- Future domain direction without implementing it.

Future domain outline:

```text
Place
- id
- name (required)
- photo (optional)
- description (optional)
- parentPlaceId (optional)

Item
- id
- name (required)
- placeId (required)
- photo (optional)
- brand (optional)
- model (optional)
- serialNumber (optional)
- quantity (optional)
- notes (optional)
- tags (optional)
- status (optional)
- purchaseDate (optional)
- purchasePrice (optional)
- warrantyUntil (optional)
- productUrl (optional)
- compatibility (optional)
```

This model is documentation only for now. Do not generate database migrations or CRUD endpoints in the bootstrap milestone.

## 12. Engineering principles

Follow these principles:

- Prefer a small working vertical slice over broad scaffolding.
- Keep the generated Ignite architecture recognizable.
- Use strict, explicit types at system boundaries.
- Avoid premature repositories, service layers, CQRS, MediatR, event buses, or generic abstractions.
- Keep backend endpoint definitions easy to find.
- Keep mobile API configuration in one place.
- Never commit secrets.
- Pin important tool and dependency versions through normal ecosystem files and lockfiles.
- Keep commands cross-platform where possible.
- Explain unavoidable platform-specific differences clearly.
- Use comments only where they explain a non-obvious decision.

## 13. Non-goals for this milestone

Do not implement:

- User accounts.
- Authentication or authorization.
- Places CRUD.
- Items CRUD.
- Database persistence.
- Image upload or object storage.
- Offline synchronization.
- Push notifications.
- QR codes or barcode scanning.
- Cloud deployment.
- CI/CD beyond small configuration that is generated automatically and clearly useful.
- Kubernetes.
- A web application.
- Production branding or final UI design.

## 14. Acceptance criteria

The milestone is complete only when all applicable criteria are met:

### Repository

- [ ] `README.md` exists and contains working setup instructions.
- [ ] `AGENTS.md` exists and contains agent guidance.
- [ ] `compose.yaml` exists.
- [ ] `.env.example` exists and contains no secrets.
- [ ] Mobile and backend projects are clearly separated.

### Backend

- [ ] Backend targets .NET 10 LTS.
- [ ] Backend builds successfully.
- [ ] Backend tests pass.
- [ ] Backend runs with `docker compose up --build api`.
- [ ] `GET http://localhost:8080/api/hello` returns HTTP 200 and the expected JSON.
- [ ] `GET http://localhost:8080/health` reports healthy status.

### Mobile

- [ ] Mobile project was generated from the current Ignite CLI rather than reconstructed manually.
- [ ] Mobile project uses TypeScript.
- [ ] Mobile project is configured as an Expo application.
- [ ] Initial screen contains a button that calls the backend.
- [ ] Loading, success, and error states are visible.
- [ ] API base URL is configured through `EXPO_PUBLIC_API_URL`.
- [ ] Linting passes.
- [ ] Type checking passes.
- [ ] Tests pass.
- [ ] A mobile development Docker image builds successfully.

### Documentation

- [ ] Windows Android workflow is documented.
- [ ] macOS Android workflow is documented.
- [ ] macOS iOS workflow is documented.
- [ ] Physical-device networking is documented.
- [ ] Docker/native limitations are stated honestly.

## 15. Execution instructions for the coding agent

1. Inspect the repository before making changes.
2. If the repository is empty, create the structure described above.
3. Verify the current Ignite release and supported toolchain before generating the mobile project.
4. Use the current stable .NET 10 SDK and official container images.
5. Implement only the initial vertical slice.
6. Run all relevant builds, tests, linting, and type checks available in the execution environment.
7. If native Android or iOS execution cannot be verified in the current environment, do not claim it was verified. Document the exact commands and state what was actually tested.
8. Finish with a concise summary containing:
   - What was created.
   - Commands that were run.
   - Validation results.
   - Any remaining environment-specific manual checks.

## 16. Current source references

These references were verified when this specification was prepared. Re-check them before implementation because toolchains evolve.

- Ignite repository: https://github.com/infinitered/ignite
- Ignite documentation: https://docs.infinite.red
- Expo documentation: https://docs.expo.dev
- Expo development builds: https://docs.expo.dev/develop/development-builds/introduction/
- .NET support policy: https://dotnet.microsoft.com/platform/support/policy/dotnet-core
- ASP.NET Core Docker guidance: https://learn.microsoft.com/aspnet/core/host-and-deploy/docker/
