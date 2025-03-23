import Link from "next/link"
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Inter } from 'next/font/google'
import { getFoldersName } from "@/server/queries/folders"

const inter = Inter({ subsets: ["latin"] })

export default async function CreateWorkoutPage({
  searchParams
}: {
  searchParams: { folder?: string }
}) {
  // Convert to string to avoid type issues and provide a fallback
  const folderIdParam = typeof searchParams.folder === 'string' ? searchParams.folder : ""
  console.log(folderIdParam)

  // Fetch folders on the server
  const folders = await getFoldersName()
  console.log(folders)

  return (
    <div className={`min-h-screen bg-black text-white ${inter.className}`}>
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="h-8 w-8 border-[#333333]">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Create Workout</h1>
        </div>

      </main>
    </div>
  )
}

