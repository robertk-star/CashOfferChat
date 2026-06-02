import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit Client User | CashOfferChat" };

type Business = {
  id: string;
  name: string;
};

export default async function AdminClientEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) redirect("/admin/login");

  const supabase = getSupabaseAdmin();
  if (!supabase) notFound();

  const { data: user } = await supabase
    .from("business_users")
    .select("id, business_id, email, name, role, is_active, created_at, last_login_at")
    .eq("id", id)
    .maybeSingle();

  if (!user) notFound();

  const { data: businessesData } = await supabase
    .from("businesses")
    .select("id, name")
    .order("name", { ascending: true });

  const businesses = (businessesData || []) as Business[];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <Link href="/admin/clients" className="text-sm font-bold text-slate-500 underline">Back to Client Users</Link>
            <h1 className="mt-2 text-2xl font-bold text-navy">Edit Client User</h1>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
          <form action="/api/admin/logout" method="post">
            <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-navy">
              Log Out
            </button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-8">
        {query.saved && <div className="mb-6 rounded-2xl bg-green-50 p-4 text-sm text-green-800">Client user saved.</div>}
        {query.error && <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">Unable to save client user.</div>}

        <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
          <form action={`/api/admin/clients/${user.id}`} method="post" className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Business
              <select name="business_id" defaultValue={user.business_id || ""} required className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3">
                <option value="">Select a business</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>{business.name}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Name
              <input name="name" defaultValue={user.name || ""} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Email
              <input name="email" type="email" required defaultValue={user.email || ""} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              New Password
              <input name="new_password" type="password" minLength={8} placeholder="Leave blank to keep current password" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>

            <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
              <input name="is_active" type="checkbox" defaultChecked={user.is_active} /> Active
            </label>

            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 md:col-span-2">
              <div><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</div>
              <div><strong>Last login:</strong> {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "—"}</div>
            </div>

            <div className="md:col-span-2">
              <button className="rounded-full bg-gold px-7 py-3 font-bold text-navy" type="submit">
                Save Client User
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
