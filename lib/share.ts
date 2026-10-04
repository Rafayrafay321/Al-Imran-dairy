import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

type ShareInvoiceResult = "shared" | "downloaded";

function safeName(value: string): string {
  return value.normalize("NFKD").replace(/[^a-zA-Z0-9]/g, "") || "customer";
}

async function blobToBase64(blob: Blob): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
  return dataUrl.split(",")[1] ?? "";
}

export async function shareInvoicePDF(
  blob: Blob,
  invoiceNo: string,
  customerName: string
): Promise<ShareInvoiceResult> {
  const filename = `invoice-${invoiceNo}-${safeName(customerName)}.pdf`;
  if (Capacitor.isNativePlatform()) {
    const saved = await Filesystem.writeFile({ path: filename, data: await blobToBase64(blob), directory: Directory.Cache });
    await Share.share({ files: [saved.uri], title: "Invoice" });
    return "shared";
  }

  const file = new File([blob], filename, { type: "application/pdf" });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: "Invoice" });
    return "shared";
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
  return "downloaded";
}
