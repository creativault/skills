---
name: nextjs-frontend-base
description: Scaffold and maintain company-standard Next.js frontend projects with Tailwind CSS v4, shadcn/ui components, Inter font system, and feature-based architecture. Use when creating new frontend applications with standardized styling, theming, and component patterns.
metadata:
  author: creativault
  version: "1.0"
---

# Next.js Frontend Base

Standardized single-project Next.js architecture with Tailwind CSS v4, shadcn/ui, and company design system.

## Quick Start

### Create New Project

```bash
# 1. Create project from template
cp -r <skill-path>/assets/template/my-app ./my-project
cd my-project

# 2. Install dependencies
pnpm install

# 3. Copy environment variables
cp .env.example .env.local

# 4. Start development
pnpm dev
```

### Add to Existing Project

```bash
# 1. Copy configuration files
cp <skill-path>/assets/template/my-app/src/styles/globals.css ./src/styles/
cp <skill-path>/assets/template/my-app/src/lib/fonts.ts ./src/lib/
cp <skill-path>/assets/template/my-app/tailwind.config.ts ./

# 2. Update layout.tsx to use fontInter
# See Layout Configuration section below
```

## Architecture Overview

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with Inter font
│   ├── page.tsx                 # Home page
│   ├── loading.tsx              # Loading UI
│   ├── error.tsx                # Error boundary
│   └── globals.css              # Global styles
├── components/
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── blocks/                  # Page sections
│   │   ├── hero.tsx
│   │   ├── features.tsx
│   │   └── footer.tsx
│   ├── layout/                  # Layout components
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── navigation.tsx
│   └── providers.tsx            # App providers
├── hooks/                       # Custom React hooks
├── lib/                         # Utility functions
│   ├── fonts.ts                 # Inter font configuration
│   └── utils.ts                 # cn() and helpers
├── styles/
│   └── globals.css              # Tailwind v4 + theme variables
└── types/                       # TypeScript types
```

## Core Principles

### 1. Feature-Based Organization

Group by feature/domain, not by type:

```
components/
├── auth/                        # Auth feature
│   ├── login-form.tsx
│   ├── signup-form.tsx
│   └── user-menu.tsx
├── dashboard/                   # Dashboard feature
│   ├── stats-card.tsx
│   ├── activity-feed.tsx
│   └── dashboard-shell.tsx
└── settings/                    # Settings feature
    ├── profile-form.tsx
    └── preferences.tsx
```

### 2. Component Categories

| Category | Location | Purpose |
|----------|----------|---------|
| UI Primitives | `components/ui/` | shadcn/ui base components |
| Blocks | `components/blocks/` | Page sections, marketing blocks |
| Layout | `components/layout/` | Shell, navigation, headers |
| Features | `components/[feature]/` | Domain-specific components |

## Styling System

### Tailwind CSS v4 + Theme Variables

The `globals.css` defines a complete design system:

```css
/* Theme color variables */
:root {
  --background: oklch(1.0 0 0);
  --foreground: oklch(0.1448 0 0);
  --primary: oklch(0.623 0.214 259.815);
  --primary-foreground: oklch(0.9851 0 0);
  /* ... see full globals.css */
}

.dark {
  --background: oklch(0.1448 0 0);
  --foreground: oklch(0.9851 0 0);
  /* ... dark theme */
}
```

### Font Configuration

**Inter** is the primary font, configured in `src/lib/fonts.ts`:

```typescript
import { Inter } from 'next/font/google';

export const fontInter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});
```

Apply in `layout.tsx`:

```tsx
import { fontInter } from '@/lib/fonts';
import { cn } from '@/lib/utils';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'size-full antialiased',
          fontInter.className,
          fontInter.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
```

## Component Patterns

### UI Component (shadcn/ui Style)

```tsx
// components/ui/button.tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-input bg-background hover:bg-accent',
        secondary: 'bg-secondary text-secondary-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

### Feature Component

```tsx
// components/dashboard/stats-card.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStats } from '@/hooks/use-stats';

interface StatsCardProps {
  title: string;
  metric: 'users' | 'revenue' | 'orders';
}

export function StatsCard({ title, metric }: StatsCardProps) {
  const { data, isLoading } = useStats(metric);

  if (isLoading) return <StatsCardSkeleton />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{data?.value}</div>
        <p className="text-xs text-muted-foreground">
          {data?.change > 0 ? '+' : ''}{data?.change}% from last month
        </p>
      </CardContent>
    </Card>
  );
}

function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-4 w-24 skeleton-shimmer rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-32 skeleton-shimmer rounded mb-2" />
        <div className="h-3 w-40 skeleton-shimmer rounded" />
      </CardContent>
    </Card>
  );
}
```

### Server Component with Data

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your account activity
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard title="Total Users" metric="users" />
          <StatsCard title="Revenue" metric="revenue" />
          <StatsCard title="Orders" metric="orders" />
        </div>

        <Suspense fallback={<ActivitySkeleton />}>
          <RecentActivity />
        </Suspense>
      </div>
    </DashboardShell>
  );
}
```

## Theming

### Built-in Themes

Override CSS variables for custom themes:

```css
/* Custom theme */
.theme-custom {
  --primary: oklch(0.6 0.2 250);
  --primary-foreground: oklch(0.98 0 0);
}
```

Apply theme:

```tsx
<html className="theme-custom">
```

### Dark Mode

```tsx
// components/providers.tsx
'use client';

import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
```

## State Management

### Zustand Store Pattern

```tsx
// stores/user-store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UserState {
  user: User | null;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
  setUser: (user: User | null) => void;
  updatePreferences: (prefs: Partial<UserState['preferences']>) => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        preferences: { theme: 'system', language: 'en' },
        setUser: (user) => set({ user }),
        updatePreferences: (prefs) =>
          set((state) => ({
            preferences: { ...state.preferences, ...prefs },
          })),
      }),
      {
        name: 'user-storage',
        partialize: (state) => ({ preferences: state.preferences }),
      }
    )
  )
);
```

## Adding shadcn/ui Components

```bash
# Add base color (only once per project)
npx shadcn@latest init --yes --template next --base-color neutral

# Add components
npx shadcn add button
npx shadcn add card
npx shadcn add dialog
npx shadcn add form
# ... etc
```

Components are installed to `components/ui/` by default.

## Common Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript check |
| `pnpm test` | Run tests |

## File Templates

See `assets/template/` for complete project template including:
- `package.json` with dependencies
- `next.config.ts` configuration
- `tsconfig.json` setup
- `src/styles/globals.css` - complete theme system
- `src/lib/fonts.ts` - Inter font configuration
- `src/lib/utils.ts` - utility functions
- `src/components/ui/` - base shadcn components
- `src/app/layout.tsx` - root layout with fonts

## Key Files Reference

### globals.css
Complete design system with:
- Tailwind CSS v4 imports
- OKLCH color variables for light/dark themes
- CSS animations (shimmer, accordion, marquee, etc.)
- Typography styles
- Skeleton loading animations

### fonts.ts
Inter font configuration from Google Fonts with specific weights (400-700).

### utils.ts
`cn()` utility combining `clsx` and `tailwind-merge` for conditional class names.


