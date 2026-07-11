import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { ProfileForm } from "@/components/account/ProfileForm";

export const metadata: Metadata = { title: "Profile" };

export default async function AccountProfilePage() {
  const session = await getServerSession(authOptions);

  return (
    <div>
      <h1>Profile</h1>
      <p className="meta">Update your account details.</p>
      <section>
        <h2>Name</h2>
        <ProfileForm initialName={session?.user?.name || ""} />
      </section>
      <section>
        <h2>Email</h2>
        <p>{session?.user?.email}</p>
        <p className="small-disclosure">
          To change the email address on your account, please contact <a href="mailto:KE@kiraengineerhub.com">support</a>.
        </p>
      </section>
    </div>
  );
}
