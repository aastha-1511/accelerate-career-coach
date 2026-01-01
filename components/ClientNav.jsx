"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  FileText,
  GraduationCap,
  PenBox,
  StarsIcon,
  LayoutDashboard,
} from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function ClientNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center space-x-4">
      <SignedIn>
        <Link href="/dashboard">
          <Button variant="outline">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Industry Insights
          </Button>
        </Link>

        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button>
              <StarsIcon className="h-4 w-4 mr-1" />
              Growth Tools
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start">
            <DropdownMenuItem asChild>
              <Link href="/resume" onClick={() => setOpen(false)}>
                <FileText className="h-4 w-4 mr-2" />
                Build Resume
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/ai-cover-letter" onClick={() => setOpen(false)}>
                <PenBox className="h-4 w-4 mr-2" />
                Cover Letter
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/interview" onClick={() => setOpen(false)}>
                <GraduationCap className="h-4 w-4 mr-2" />
                Interview Prep
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SignedIn>

      <SignedOut>
        <SignInButton>
          <Button variant="outline">Sign In</Button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </div>
  );
}
