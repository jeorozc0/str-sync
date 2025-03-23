import { BarChart2 } from "lucide-react"
import { Inter } from "next/font/google"
import Image from "next/image"
import schoolOfAthens from "public/Raphael_School_of_Athens.jpg"
import OAuthGoogleCard from "@/components/auth/oath-login-card"

const inter = Inter({ subsets: ["latin"] })

export default function LoginPage() {
  return (
    <div className={`min-h-screen w-full flex flex-col ${inter.className} p-4`}>
      {/* Logo in corner */}
      <div className="absolute top-6 left-6 z-10">
        <div className="flex items-center gap-2 text-white">
          <BarChart2 className="h-6 w-6" />
          <span className="text-lg font-semibold">StrengthSync</span>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Left side - Login Form */}
        <div className="w-full lg:w-1/2 bg-black flex items-center justify-center p-8">
          <OAuthGoogleCard />
        </div>

        {/* Right side - Image */}
        <div className="hidden lg:block lg:w-1/2 bg-[#111111] relative">
          <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/30" />
          <Image
            src={schoolOfAthens} // e.g., import schoolOfAthens from '@/public/school-of-athens.jpg'
            alt="Raphael, The School of Athens, featuring classical figures with strong anatomical details"
            fill
            className="object-cover rounded-xl"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
          />
        </div>
      </div>
    </div>
  )
}


