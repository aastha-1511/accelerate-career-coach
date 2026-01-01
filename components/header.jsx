import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { checkUser } from "@/lib/checkUser";
import ClientNav from "./ClientNav";

const Header = async () => {
  await checkUser(); 

  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <Image src="/logo.png" alt="logo" width={200} height={60} />
        </Link>

        <ClientNav />
      </nav>
    </header>
  );
};

export default Header;
