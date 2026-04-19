"use client";

import { authClient } from "@/lib/auth-client";
import { redirect, useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import {
  ChevronLeft,
  LogOut,
  User as UserIcon,
  CreditCard,
  Moon,
  ChevronRight,
  Info,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { updateBudget } from "@/app/actions/settings";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [budget, setBudget] = useState<string>("50000");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user) {
      // ユーザーの初期予算を設定
      // Note: session.user.budget が型定義にない場合はキャストするか取得し直す
      const userWithBudget = session.user as any;
      if (userWithBudget.budget) {
        setBudget(userWithBudget.budget.toString());
      }
    }
  }, [session]);

  if (isPending) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!session) redirect("/");

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const handleSaveBudget = async () => {
    setSaving(true);
    try {
      await updateBudget(parseInt(budget) || 0);
      alert("予算を更新しました");
    } catch (error) {
      console.error(error);
      alert("エラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <main className="flex-1 pb-24">
        <div className="max-w-md mx-auto bg-white dark:bg-zinc-950 min-h-screen shadow-xl">
          {/* ヘッダー */}
          <header className="px-4 py-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-4 sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-30">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full"
            >
              <ChevronLeft className="size-6" />
            </Button>
            <h1 className="text-xl font-bold tracking-tight">設定</h1>
          </header>

          <div className="p-4 space-y-8">
            {/* プロフィールセクション */}
            <section className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl">
                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <UserIcon className="size-8 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-lg truncate">{session.user.name}</div>
                  <div className="text-xs text-zinc-500 truncate">{session.user.email}</div>
                </div>
                <Button variant="ghost" size="icon" className="text-red-500" onClick={handleLogout}>
                  <LogOut className="size-5" />
                </Button>
              </div>
            </section>

            {/* 家計管理設定 */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <CreditCard className="size-4 text-zinc-400" />
                <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  家計管理設定
                </h2>
              </div>
              <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-sm space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-sm font-medium">
                    毎月の予算
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="budget"
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="pl-8 font-bold"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">
                        ¥
                      </span>
                    </div>
                    <Button onClick={handleSaveBudget} disabled={saving} size="sm">
                      {saving ? "..." : "保存"}
                    </Button>
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    ※ホーム画面の収支サマリーに反映されます
                  </p>
                </div>
              </div>
            </section>

            {/* その他設定リスト */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <ShieldCheck className="size-4 text-zinc-400" />
                <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  一般・セキュリティ
                </h2>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <SettingItem icon={<Moon className="size-4" />} title="ダークモード" value="自動" />
                <Separator className="bg-zinc-50 dark:bg-zinc-800" />
                <SettingItem icon={<Info className="size-4" />} title="アプリについて" />
              </div>
            </section>

            <div className="pt-8 text-center">
              <p className="text-[10px] text-zinc-400">
                Syokuhi App Version 1.0.0 (Build 20260419)
              </p>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

function SettingItem({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-4 active:bg-zinc-50 dark:active:bg-zinc-800 transition-colors cursor-pointer">
      <div className="size-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
        {icon}
      </div>
      <div className="flex-1 font-medium text-sm">{title}</div>
      {value && <div className="text-xs text-zinc-400">{value}</div>}
      <ChevronRight className="size-4 text-zinc-300" />
    </div>
  );
}
