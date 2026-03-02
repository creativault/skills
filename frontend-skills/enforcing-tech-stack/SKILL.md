# SKILL: enforcing-tech-stack

## Metadata
- **name**: `enforcing-tech-stack`
- **description**: Apply strict technology stack constraints to all code generation, refactoring, and architectural tasks. Use when generating project boilerplates, writing components, configuring tooling, writing tests, or suggesting implementation patterns to ensure 100% alignment with the predefined modern frontend ecosystem (Next.js 16, React 19, Tailwind v4, etc.).

## Boundaries

**Use this skill when:**
- The user requests the generation of new frontend/full-stack feature code, React components, or API routes.
- The user asks to initialize a new project, configure a Monorepo, or modify the build toolchain.
- The user asks to write test cases, configure code quality tools (Lint/Format), or implement data mocking.
- The user provides code using non-standard libraries that needs to be refactored into the mandated tech stack.

**Do NOT use this skill when:**
- The user explicitly asks theoretical questions about unrelated languages (e.g., Python, Rust).
- The user explicitly requires maintaining an un-migratable legacy system (and strictly refuses refactoring).

## Tech Stack Manifest
When executing any code generation, you must strictly map the requirements to the following tech stack and versions:

| Domain | Mandated Tech Stack & Version | Constraint Description                                                                                             |
| :--- | :--- |:-------------------------------------------------------------------------------------------------------------------|
| **Package Management** | `pnpm ~10` | Only use pnpm commands (e.g., `pnpm add`, `pnpm dev`). npm/yarn are strictly forbidden.                            |
| **Language & Typing** | `TypeScript ~5` | Mandate strong typing. Avoid using `any`.                                                                          |
| **Core Framework** | `Next.js ~16`, `React ~19` | Prioritize the App Router, React Server Components (RSC), and the latest React 19 Hooks.                           |
| **State Management** | `Zustand ~5` | Refuse to use Redux/Mobx/Context API for complex global state.                                                     |
| **Styling** | `tailwindcss ~4` | Only use Tailwind utility classes. Writing raw CSS files or using CSS-in-JS (like styled-components) is forbidden. |
| **UI Components** | `shadcn`, `magicui` | Use shadcn for base interactions. Prioritize magicui for complex visual effects.                                   |
| **API Communication** | `tRPC` | Ensure end-to-end type-safe API calls, replacing traditional REST/Axios setups.                                    |
| **Code Quality** | `Biome` | Use Biome instead of Prettier and ESLint for formatting and linting.                                               |
| **API Mocking** | `MSW` (Mock Service Worker) | Use for intercepting and mocking network requests in development and testing environments.                         |
| **Animations** | `motion` | Use for component-level complex physics animations and transitions.                                                |
| **Build & Monorepo**| `Turbopack`, `Turborepo` | Mandate Turbopack for local development (`next dev --turbo`). Use Turborepo for monorepo management.               |
| **Automated Testing**| `vitest ~4`, `Playwright` | Use Vitest for unit/integration testing, and Playwright for End-to-End (E2E) testing. Jest/Cypress are forbidden.  |

## Input & Output

**Input:**
- `taskType`: string ("component" | "setup" | "refactor" | "test" | "api")
- `requirement`: string (The user's specific requirement description)
- `existingCode?`: string (Optional, existing code context)

**Output:**
- `commands`: string[] (pnpm or generation commands to be executed)
- `codeFiles`: object[] { `filePath`: string, `content`: string } (The generated code files)
- `stackWarnings`: string[] (Corrective feedback if the user's request deviates from the tech stack)

## Steps

1. **Analyze**: Parse the `requirement` and identify the domains involved (e.g., UI, state, testing).
2. **Map to Stack**: Strictly map the requirements to the designated tools according to the `Tech Stack Manifest`.
    - *Example: User needs an "animated dropdown" -> Maps to Radix UI (Dropdown) + Tailwind v4 + motion.*
3. **Generate Commands**: If dependencies need to be installed, output `pnpm` commands only; if UI components are needed, output `pnpm dlx shadcn@latest add <component>`.
4. **Implement Code**:
    - Must adhere to Next.js 16/React 19 server/client component separation principles (use `"use client"` only when necessary).
    - Styling must be translated into Tailwind v4 classes.
    - State logic should be extracted into a Zustand store.
5. **Verify**: Check the generated output for any forbidden libraries (e.g., axios, jest, eslint). If found, immediately replace them with the standard alternatives (tRPC, vitest, Biome).

## Failure & Edge Cases

- **Requested Forbidden Library**:
    - *Strategy*: Refuse the use of forbidden libraries. Force a replacement with the stack-equivalent solution in the output code, and explain it in `stackWarnings` (e.g., "Replaced Jest with Vitest to align with project standards.").
- **Version/Syntax Conflict**:
    - *Strategy*: Strictly adhere to the major version features (e.g., using React 19's `useActionState` instead of older patterns). If compatibility is impossible, throw an error and mention the missing version feature support.
- **Missing UI Component (No existing shadcn/magicui component)**:
    - *Strategy*: Assemble the component using Tailwind v4 + Radix UI Primitives. Do not introduce unauthorized third-party component libraries (like Ant Design or MUI).