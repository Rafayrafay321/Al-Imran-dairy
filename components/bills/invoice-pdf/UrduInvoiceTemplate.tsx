import * as React from "react";
import { formatRupees } from "@/lib/data/money";
import { type InvoiceDetail } from "@/lib/services/invoiceService";

interface UrduInvoiceProps {
  invoice: InvoiceDetail;
  shopNameUrdu?: string;
  shopPhone?: string;
}

export const UrduInvoice = React.forwardRef<HTMLDivElement, UrduInvoiceProps>(
  ({ invoice, shopNameUrdu = "العمران ڈیری", shopPhone = "0306-4703539" }, ref) => (
    <div
      ref={ref}
      data-invoice-pdf
      dir="rtl"
      lang="ur"
      className="relative w-[559px] min-h-[794px] bg-white p-10 text-stone-900"
      style={{ fontFamily: "Noto Naskh Arabic, serif" }}
    >
      {invoice.status === "VOID" && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
          <div data-pdf-watermark className="-rotate-30 whitespace-nowrap border-8 border-red-600 px-8 py-3 text-5xl font-bold text-red-600 opacity-35">
            CANCELLED / منسوخ
          </div>
        </div>
      )}

      <header className="border-b-2 border-stone-800 pb-4 text-center">
        <h1 className="text-4xl font-bold leading-tight">{shopNameUrdu}</h1>
        <p className="mt-1 text-base" dir="ltr">{shopPhone}</p>
      </header>

      <section className="mt-5 grid grid-cols-2 gap-x-5 gap-y-2 text-base">
        <p className="text-start">بل نمبر: <b dir="ltr">{invoice.invoiceNo}</b></p>
        <p className="text-start">تاریخ: <b dir="ltr">{invoice.issueDate}</b></p>
        <p className="text-start">مدت: <b dir="ltr">{invoice.weekStart} – {invoice.weekEnd}</b></p>
        <p className="text-start">کسٹمر: <b>{invoice.customerName}</b></p>
      </section>

      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr data-pdf-muted className="bg-stone-100">
            <th className="border border-stone-400 px-2 py-2 text-end">رقم</th>
            <th className="border border-stone-400 px-2 py-2 text-end">ریٹ</th>
            <th className="border border-stone-400 px-2 py-2 text-end">مقدار (لیٹر)</th>
            <th className="border border-stone-400 px-2 py-2 text-start">دودھ کی قسم</th>
            <th className="border border-stone-400 px-2 py-2 text-start">تاریخ</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines.map((line) => (
            <tr key={line.id}>
              <td className="border border-stone-300 px-2 py-2 text-end" dir="ltr">Rs {formatRupees(line.amount)}</td>
              <td className="border border-stone-300 px-2 py-2 text-end" dir="ltr">Rs {formatRupees(line.rate)}</td>
              <td className="border border-stone-300 px-2 py-2 text-end" dir="ltr">{line.liters}</td>
              <td className="border border-stone-300 px-2 py-2 text-start">{line.milkTypeNameUr || line.milkTypeName}</td>
              <td className="border border-stone-300 px-2 py-2 text-start" dir="ltr">{line.deliveryDate}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="ms-auto mt-7 w-[72%] space-y-2 text-lg">
        <p className="flex justify-between gap-4"><span>کل مقدار:</span><b dir="ltr">{invoice.totalLiters} لیٹر</b></p>
        <p className="flex justify-between gap-4"><span>اس ہفتے کی رقم:</span><b dir="ltr">Rs {formatRupees(invoice.totalAmount)}</b></p>
        <p className="flex justify-between gap-4"><span>پچھلا بقایا:</span><b dir="ltr">Rs {formatRupees(invoice.previousBalance)}</b></p>
        <p className="flex items-center justify-between gap-4 border-t-2 border-stone-800 pt-3 text-2xl font-bold">
          <span>کل واجب الادا:</span><span dir="ltr">Rs {formatRupees(invoice.grandTotal)}</span>
        </p>
      </section>

      <footer className="absolute inset-x-10 bottom-8 border-t border-stone-300 pt-3 text-center text-base">
        ادائیگی کے لیے رابطہ کریں: <span dir="ltr">{shopPhone}</span>
      </footer>
    </div>
  )
);

UrduInvoice.displayName = "UrduInvoice";
export const UrduInvoiceTemplate = UrduInvoice;
