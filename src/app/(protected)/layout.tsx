import Header from "@/components/header";
import { getUserProfile } from "@/server/queries/user";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authenticate on the server
  const supabase = await createClient();

  const { data, error: authError } = await supabase.auth.getUser();
  if (authError || !data?.user) {
    redirect("/login");
  }

  const user = await getUserProfile(data.user.id);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header user={user} />
      <main className="flex-1 overflow-auto bg-black text-white">
        <div className="h-full">{children}</div>
      </main>
    </div>
  );
}
