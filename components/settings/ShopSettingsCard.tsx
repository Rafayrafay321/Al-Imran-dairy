// filepath: components/settings/ShopSettingsCard.tsx
"use client";

import * as React from "react";
import { Store, Save, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  getShopSettingsAction,
  updateShopSettingsAction,
} from "@/actions/masterDataActions";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { toFriendlyError } from "@/lib/friendlyError";

export function ShopSettingsCard() {
  const [shopName, setShopName] = React.useState("");
  const [shopNameUr, setShopNameUr] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [addressUr, setAddressUr] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await getShopSettingsAction();
      if (mounted && res.success && res.data) {
        setShopName(res.data.shopName);
        setShopNameUr(res.data.shopNameUr);
        setPhone(res.data.phone);
        setAddressUr(res.data.addressUr || "");
        setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setError(null);
    setIsSaving(true);

    try {
      const res = await updateShopSettingsAction({
        shopName,
        shopNameUr,
        phone,
        addressUr,
      });

      if (!res.success || !res.data) {
        setError(res.error || "Failed to update shop settings.");
      } else {
        setFeedback("Shop settings updated successfully!");
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (saveError) {
      setError(toFriendlyError(saveError, "Could not save shop settings. Please try again."));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <PageSkeleton rows={2} />;
  }

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <Store className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-stone-900">Shop Details</h2>
          <p className="mt-0.5 text-sm text-stone-600">Business information used on invoices</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-3.5">
        {feedback && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}
        {error && (
          <div className="rounded-xl bg-red-50 p-2.5 text-xs font-semibold text-red-800 border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="shop-name" className="text-sm font-semibold text-stone-800">Shop Name (English)</label>
          <Input id="shop-name" value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="Al-Imran Dairy" className="h-11 rounded-xl" required />
        </div>

        <div className="space-y-1">
          <label htmlFor="shop-name-ur" className="text-sm font-semibold text-stone-800">Shop Name (Urdu)</label>
          <Input id="shop-name-ur" value={shopNameUr} onChange={(e) => setShopNameUr(e.target.value)} placeholder="العمران ڈیری" dir="rtl" className="h-11 rounded-xl text-right font-medium" required />
        </div>

        <div className="space-y-1">
          <label htmlFor="shop-phone" className="text-sm font-semibold text-stone-800">Phone Number</label>
          <Input id="shop-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0306-4703539" className="h-11 rounded-xl font-mono" required />
        </div>

        <div className="space-y-1">
          <label htmlFor="shop-address" className="text-sm font-semibold text-stone-800">Address (Urdu)</label>
          <Input id="shop-address" value={addressUr} onChange={(e) => setAddressUr(e.target.value)} placeholder="مین بازار، نزد جامع مسجد" dir="rtl" className="h-11 rounded-xl text-right font-medium" />
        </div>

        <Button type="submit" isLoading={isSaving} requiresOnline className="h-11 w-full rounded-xl bg-[#2563EB] text-sm font-semibold text-white hover:bg-blue-600 active:bg-blue-700">
          <span className="flex items-center gap-2"><Save className="h-4 w-4" />Save Settings</span>
        </Button>
      </form>
    </section>
  );
}
