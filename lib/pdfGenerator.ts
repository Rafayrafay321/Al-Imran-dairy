import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { createElement } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { getInvoiceByIdAction } from "@/actions/invoiceActions";
import { getShopSettingsAction } from "@/actions/masterDataActions";
import { UrduInvoice } from "@/components/bills/invoice-pdf/UrduInvoiceTemplate";
import { NOTO_NASKH_ARABIC_BASE64 } from "@/lib/notoNaskhArabicFont";

const FONT_DATA_URL = `data:font/woff2;base64,${NOTO_NASKH_ARABIC_BASE64}`;

function normalizeRasterColors(clonedDocument: Document) {
  const invoice = clonedDocument.querySelector<HTMLElement>("[data-invoice-pdf]");
  if (!invoice) return;
  invoice.style.backgroundColor = "#ffffff";
  invoice.style.color = "#1c1917";
  invoice.querySelectorAll<HTMLElement>("*").forEach((element) => {
    element.style.color = "#1c1917";
    element.style.borderColor = "#a8a29e";
    element.style.outlineColor = "#2563eb";
    element.style.boxShadow = "none";
    if (getComputedStyle(element).backgroundColor !== "rgba(0, 0, 0, 0)") {
      element.style.backgroundColor = "#ffffff";
    }
  });
  invoice.querySelectorAll<HTMLElement>("[data-pdf-muted]").forEach((element) => { element.style.backgroundColor = "#f5f5f4"; });
  invoice.querySelectorAll<HTMLElement>("[data-pdf-watermark]").forEach((element) => { element.style.color = "#dc2626"; element.style.borderColor = "#dc2626"; });
}

export async function generateInvoicePDF(invoiceId: string): Promise<Blob> {
  const [invoiceResult, shopResult] = await Promise.all([
    getInvoiceByIdAction(invoiceId),
    getShopSettingsAction(),
  ]);
  if (!invoiceResult.success || !invoiceResult.data) throw new Error(invoiceResult.error ?? "Invoice not found.");
  const invoice = invoiceResult.data;

  const host = document.createElement("div");
  host.style.cssText = "position:fixed;inset-inline-start:-10000px;top:0;width:559px;background:white;";
  const fontStyle = document.createElement("style");
  fontStyle.textContent = `@font-face{font-family:'Noto Naskh Arabic';src:url('${FONT_DATA_URL}') format('woff2');font-weight:100 900;font-style:normal;font-display:block;}`;
  host.appendChild(fontStyle);
  document.body.appendChild(host);
  const mount = document.createElement("div");
  host.appendChild(mount);
  const root = createRoot(mount);

  try {
    flushSync(() => root.render(createElement(UrduInvoice, {
      invoice,
      shopNameUrdu: shopResult.data?.shopNameUr,
      shopPhone: shopResult.data?.phone,
    })));
    await document.fonts.load("16px 'Noto Naskh Arabic'");
    const invoiceElement = mount.firstElementChild as HTMLElement | null;
    if (!invoiceElement) throw new Error("Invoice renderer did not mount.");
    const canvas = await html2canvas(invoiceElement, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: false,
      logging: false,
      onclone: normalizeRasterColors,
    });
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a5", compress: true });
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.82), "JPEG", 0, 0, 148, 210, undefined, "FAST");
    return pdf.output("blob");
  } finally {
    root.unmount();
    host.remove();
  }
}
