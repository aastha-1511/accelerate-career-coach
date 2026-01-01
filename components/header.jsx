import { SignedIn, SignedOut, SignInButton, UserAvatar, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React,{ useState } from 'react'
import { Button } from './ui/button'
import { ChevronDown, FileText, GraduationCap, LayoutDashboard, PenBox, StarsIcon } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { checkUser } from '@/lib/checkUser'

const Header = async() => {
    await checkUser();
    const [open, setOpen] = useState(false);
    return (
        <div>
            <header className='fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60'>
                <nav className='container mx-auto px-4 h-16 flex items-center justify-between'>
                    <Link href="/">
                        <Image src="/logo.png" alt="accelerate logo" width={200} height={60}
                            className='h-12 py-1 w-auto object-contain' />
                    </Link>

                    <div className='flex items-center space-x-2 md:space-x-4'>
                        <SignedIn>
                            <Link href={"/dashboard"}>
                                <Button variant="outline">
                                    <LayoutDashboard className='h-4 w-4' />
                                    <span className='hidden md:block'>Industry Insights</span>
                                </Button>
                            </Link>
                        
                        <DropdownMenu open={open} onOpenChange={setOpen}>
                              <DropdownMenuTrigger asChild>
                                <Button>
                                  <StarsIcon className="h-4 w-4" />
                                  <span className="hidden md:block">Growth Tools</span>
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                        
                              <DropdownMenuContent className="w-56" align="start">
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
                            <UserButton 
                            appearance={{
                                elements: {
                                    avatarBox: "w-10 h-10",
                                    userButtonPopoverCard: "shadow-xl",
                                    userPreviewMainIdentifier: "font-semibold",
                                },
                            }}
                            afterSignOutUrl='/'
                            />
                        </SignedIn>
                    </div>
                </nav>
            </header>

        </div>
    )
}

export default Header
