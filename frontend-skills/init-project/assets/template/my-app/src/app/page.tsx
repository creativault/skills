import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Welcome to <span className="text-gradient">My App</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A modern Next.js application with Tailwind CSS v4, shadcn/ui components, 
            and the Inter font family.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Next.js 15</CardTitle>
              <CardDescription>App Router and Server Components</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Built with the latest Next.js features for optimal performance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tailwind v4</CardTitle>
              <CardDescription>Modern CSS-first configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Using the new CSS-based configuration with OKLCH colors.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>shadcn/ui</CardTitle>
              <CardDescription>Accessible UI components</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Beautiful, accessible components built on Radix UI.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center gap-4">
          <Button size="lg">Get Started</Button>
          <Button variant="outline" size="lg">Learn More</Button>
        </div>
      </div>
    </main>
  );
}
