"use client";

import { useEffect, useState } from "react";

export default function UsersAdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setUsers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleAdmin = async (uid, currentIsAdmin) => {
    setToggling(uid);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, isAdmin: !currentIsAdmin }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.uid === uid ? { ...u, isAdmin: !currentIsAdmin } : u))
        );
      }
    } catch {}
    setToggling(null);
  };

  return (
    <div className="bg-background text-primary flex flex-col items-center min-h-screen">
      <section className="mb-20 w-full bg-foreground text-primary py-24 border-b-1 border-secondary">
        <div className="container mx-auto px-4 flex items-center justify-center flex-col">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Kullanıcı Yönetimi
          </h1>
        </div>
      </section>

      <section className="max-w-[1440px] w-full container mx-auto px-4 py-16">
        {loading ? (
          <div>Yükleniyor...</div>
        ) : users.length === 0 ? (
          <div>Kullanıcı bulunamadı.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-foreground border-b border-secondary text-left">
                  <th className="px-4 py-3 font-semibold">İsim</th>
                  <th className="px-4 py-3 font-semibold">E-posta</th>
                  <th className="px-4 py-3 font-semibold text-center">Admin</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.uid}
                    className="border-b border-secondary/30 hover:bg-foreground/50 transition-colors"
                  >
                    <td className="px-4 py-3 flex items-center gap-3">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <span
                        className="w-8 h-8 rounded-full bg-secondary text-white text-xs font-bold items-center justify-center flex-shrink-0"
                        style={{ display: user.photoURL ? "none" : "flex" }}
                      >
                        {(user.displayName || user.email || "?")[0].toUpperCase()}
                      </span>
                      <span>{user.displayName || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">{user.email}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleAdmin(user.uid, user.isAdmin)}
                        disabled={toggling === user.uid}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                          user.isAdmin ? "bg-secondary" : "bg-gray-300"
                        } ${toggling === user.uid ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                            user.isAdmin ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
