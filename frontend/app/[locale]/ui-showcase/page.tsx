'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function UIShowcasePage() {
  return (
    <div className="container mx-auto py-10 space-y-10">
      <div>
        <h1 className="text-4xl font-bold mb-2">UI Components Showcase</h1>
        <p className="text-muted-foreground">
          A comprehensive showcase of all available UI components
        </p>
      </div>

      <Separator />

      {/* Buttons Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <Separator />

      {/* Dialog Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Dialog</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Welcome!</DialogTitle>
              <DialogDescription>
                This is a dialog component built with Radix UI. It's fully
                accessible and customizable.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <input
                  id="name"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter your name"
                />
              </div>
              <Button className="w-full">Save changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </section>

      <Separator />

      {/* Dropdown Menu Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Dropdown Menu</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>

      <Separator />

      {/* Select Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Select</h2>
        <Select>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="orange">Orange</SelectItem>
            <SelectItem value="grape">Grape</SelectItem>
            <SelectItem value="mango">Mango</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <Separator />

      {/* Tabs Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Tabs</h2>
        <Tabs defaultValue="account" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <input
                id="username"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter username"
              />
            </div>
            <Button>Save changes</Button>
          </TabsContent>
          <TabsContent value="password" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current">Current password</Label>
              <input
                id="current"
                type="password"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">New password</Label>
              <input
                id="new"
                type="password"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter new password"
              />
            </div>
            <Button>Update password</Button>
          </TabsContent>
        </Tabs>
      </section>

      <Separator />

      {/* Toast Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Toast Notifications</h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => toast.success("Success! Your action was completed.")}>
            Success Toast
          </Button>
          <Button onClick={() => toast.error("Error! Something went wrong.")}>
            Error Toast
          </Button>
          <Button onClick={() => toast.info("Info: Here's some information.")}>
            Info Toast
          </Button>
          <Button
            onClick={() =>
              toast("Event created", {
                description: "Sunday, December 03, 2023 at 9:00 AM",
                action: {
                  label: "Undo",
                  onClick: () => toast("Undo clicked"),
                },
              })
            }
          >
            Custom Toast
          </Button>
        </div>
      </section>

      <Separator />

      {/* Avatar Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Avatar</h2>
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src="invalid-url" alt="Avatar" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </section>

      <Separator />

      {/* Label & Separator Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Label & Separator</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <input
              id="email"
              type="email"
              className="w-full max-w-sm px-3 py-2 border rounded-md"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <h3 className="text-lg font-medium">Horizontal Separator</h3>
            <Separator className="my-4" />
            <p className="text-sm text-muted-foreground">
              This separator divides content horizontally.
            </p>
          </div>
          <div className="flex items-center space-x-4 h-10">
            <span>Item 1</span>
            <Separator orientation="vertical" />
            <span>Item 2</span>
            <Separator orientation="vertical" />
            <span>Item 3</span>
          </div>
        </div>
      </section>
    </div>
  );
}
