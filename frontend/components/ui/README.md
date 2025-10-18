# UI Components

This directory contains reusable UI components built with [Radix UI](https://www.radix-ui.com/) primitives and styled following [shadcn/ui](https://ui.shadcn.com/) design patterns.

## Available Components

### Button
A versatile button component with multiple variants and sizes.

```tsx
import { Button } from "@/components/ui/button"

// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>

// As child (renders as different element)
<Button asChild>
  <a href="/login">Login</a>
</Button>
```

### Dialog
A modal dialog component for displaying content that requires user interaction.

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete your account.
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

### Dropdown Menu
A versatile dropdown menu with nested menus, checkboxes, and radio items.

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Select
A styled select dropdown component.

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select a fruit" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
    <SelectItem value="orange">Orange</SelectItem>
  </SelectContent>
</Select>
```

### Tabs
A tabbed interface component.

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

<Tabs defaultValue="account" className="w-[400px]">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">
    Make changes to your account here.
  </TabsContent>
  <TabsContent value="password">
    Change your password here.
  </TabsContent>
</Tabs>
```

### Toast
Toast notifications using Radix Toast primitives and Sonner.

```tsx
// Using Sonner (recommended)
import { toast } from "sonner"

// Success toast
toast.success("Account created successfully")

// Error toast
toast.error("Something went wrong")

// Info toast
toast.info("New message received")

// Custom toast
toast("Event has been created", {
  description: "Sunday, December 03, 2023 at 9:00 AM",
  action: {
    label: "Undo",
    onClick: () => console.log("Undo"),
  },
})
```

Add the Toaster component to your root layout:

```tsx
import { Toaster } from "@/components/ui/toaster"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

### Avatar
An avatar component for displaying user profile pictures.

```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>
```

### Label
A label component for form inputs.

```tsx
import { Label } from "@/components/ui/label"

<Label htmlFor="email">Email</Label>
<input id="email" type="email" />
```

### Separator
A visual separator component.

```tsx
import { Separator } from "@/components/ui/separator"

<div>
  <div className="space-y-1">
    <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
    <p className="text-sm text-muted-foreground">
      An open-source UI component library.
    </p>
  </div>
  <Separator className="my-4" />
  <div className="flex h-5 items-center space-x-4 text-sm">
    <div>Blog</div>
    <Separator orientation="vertical" />
    <div>Docs</div>
    <Separator orientation="vertical" />
    <div>Source</div>
  </div>
</div>
```

## Styling

All components use Tailwind CSS classes and are customizable via the `className` prop. The design system uses CSS variables defined in `app/globals.css` for consistent theming.

## Accessibility

All components are built with accessibility in mind using Radix UI primitives, which provide:
- Proper ARIA attributes
- Keyboard navigation
- Focus management
- Screen reader support

## Dependencies

These components require the following dependencies (already installed):
- `@radix-ui/*` - Headless UI primitives
- `class-variance-authority` - For component variants
- `clsx` - For conditional class names
- `tailwind-merge` - For merging Tailwind classes
- `lucide-react` - For icons
- `sonner` - For toast notifications
