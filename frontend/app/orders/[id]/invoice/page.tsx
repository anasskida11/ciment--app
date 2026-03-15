"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Printer, Loader2 } from "lucide-react";
import { orderService } from "@/features/orders/services/order.service";
import { formatCurrency, formatDateTime, formatQuantityWithKg } from "@/shared/utils/format";
import type { Order } from "@/features/orders/types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Company info (same as order-receipt.tsx)
const COMPANY = {
  name: process.env.NEXT_PUBLIC_COMPANY_NAME || "نظام إدارة الشركة",
  address:
    process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "العنوان الكامل، المدينة، الدولة",
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || "+222 000000000",
  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || "contact@example.com",
  logo: process.env.NEXT_PUBLIC_COMPANY_LOGO || "",
};

function escapeHtml(s: unknown) {
  if (s === null || s === undefined) return "";
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c as "&" | "<" | ">" | '"' | "'"
      ]
  );
}

function getReceiptBodyHtml(order: Order) {
  const itemsRows = (order.items || [])
    .map(
      (item, idx) => `
      <tr style="${idx % 2 === 1 ? "background-color:rgb(249,250,251)" : ""}">
        <td style="text-align:center;padding:12px;border:1px solid rgb(229,231,235)">${idx + 1}</td>
        <td style="text-align:right;padding:12px;border:1px solid rgb(229,231,235)">${escapeHtml(item.product?.name || "منتج محذوف")}</td>
        <td style="text-align:center;padding:12px;border:1px solid rgb(229,231,235)">${escapeHtml(formatQuantityWithKg(item.quantity, item.product?.unit || 'tonne'))}</td>
        <td style="text-align:left;padding:12px;border:1px solid rgb(229,231,235)">${escapeHtml(formatCurrency(item.unitPrice))}</td>
        <td style="text-align:left;padding:12px;border:1px solid rgb(229,231,235);font-weight:600">${escapeHtml(formatCurrency(item.subtotal))}</td>
      </tr>
    `
    )
    .join("");

  const logoHtml = COMPANY.logo
    ? `<img src="${escapeHtml(COMPANY.logo)}" alt="${escapeHtml(COMPANY.name)}" style="height:64px" />`
    : `<div style="font-weight:700;font-size:18px;color:rgb(17,24,39)">${escapeHtml(COMPANY.name)}</div>`;

  return `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:12px;border-bottom:2px solid rgb(209,213,219)">
        <div style="text-align:left">
          ${logoHtml}
          <div style="color:rgb(107,114,128);font-size:12px;margin-top:6px">${escapeHtml(COMPANY.address)}<br/>${escapeHtml(COMPANY.phone)} • ${escapeHtml(COMPANY.email)}</div>
        </div>
        <div style="text-align:center">
          <div style="font-size:22px;font-weight:700;color:rgb(17,24,39)">فاتورة مبيعات</div>
          <div style="color:rgb(107,114,128);margin-top:6px">رقم الفاتورة: <span style="font-weight:700">${escapeHtml(order.orderNumber || order.id)}</span></div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:24px;margin-bottom:16px">
        <div>
          <div style="font-weight:600;font-size:18px;margin-bottom:12px;color:rgb(17,24,39)">معلومات الطلب</div>
          <div style="color:rgb(55,65,81);line-height:2.2">
            <div>رقم الطلب: ${escapeHtml(order.orderNumber || order.id)}</div>
            <div>التاريخ: ${escapeHtml(formatDateTime(order.createdAt))}</div>
            <div>الحالة: <span style="padding:2px 8px;background-color:rgb(209,250,229);color:rgb(6,95,70);border-radius:4px;font-size:14px">${escapeHtml(order.status === "CONFIRMED" ? "مؤكد" : order.status)}</span></div>
          </div>
        </div>
        <div>
          <div style="font-weight:600;font-size:18px;margin-bottom:12px;color:rgb(17,24,39)">معلومات العميل</div>
          <div style="color:rgb(55,65,81)">
            <div>الاسم: ${escapeHtml(order.client?.name || "")}</div>
            ${order.client?.phone ? `<div>الهاتف: ${escapeHtml(order.client.phone)}</div>` : ""}
            ${order.client?.email ? `<div>البريد: ${escapeHtml(order.client.email)}</div>` : ""}
          </div>
        </div>
      </div>

      <div style="margin-bottom:16px">
        <div style="font-weight:600;font-size:18px;margin-bottom:12px;color:rgb(17,24,39)">المنتجات</div>
        <table style="width:100%;border-collapse:collapse;border:1px solid rgb(209,213,219)">
          <thead>
            <tr style="background-color:rgb(243,244,246)">
              <th style="border:1px solid rgb(209,213,219);padding:12px;text-align:right;font-weight:600;color:rgb(17,24,39)">#</th>
              <th style="border:1px solid rgb(209,213,219);padding:12px;text-align:right;font-weight:600;color:rgb(17,24,39)">المنتج</th>
              <th style="border:1px solid rgb(209,213,219);padding:12px;text-align:center;font-weight:600;color:rgb(17,24,39)">الكمية</th>
              <th style="border:1px solid rgb(209,213,219);padding:12px;text-align:left;font-weight:600;color:rgb(17,24,39)">سعر الوحدة</th>
              <th style="border:1px solid rgb(209,213,219);padding:12px;text-align:left;font-weight:600;color:rgb(17,24,39)">المجموع</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>
      </div>

      <div style="display:flex;justify-content:flex-end;margin-bottom:24px">
        <div style="width:256px">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-top:1px solid rgb(209,213,219)">
            <div style="font-weight:600;color:rgb(55,65,81)">الإجمالي:</div>
            <div style="font-size:20px;font-weight:700;color:rgb(17,24,39)">${escapeHtml(formatCurrency(order.totalAmount))}</div>
          </div>
        </div>
      </div>

      ${order.notes ? `<div style="margin-bottom:24px;padding:16px;background-color:rgb(249,250,251);border-radius:4px;border:1px solid rgb(229,231,235)"><h4 style="font-weight:600;margin-bottom:8px;color:rgb(17,24,39)">ملاحظات:</h4><p style="color:rgb(55,65,81)">${escapeHtml(order.notes)}</p></div>` : ""}

      <div style="text-align:center;padding-top:24px;border-top:2px solid rgb(209,213,219);margin-top:16px;color:rgb(107,114,128)">شكراً لتعاملكم معنا</div>
    `;
}

const receiptStyle: React.CSSProperties = {
  backgroundColor: "rgb(255,255,255)",
  padding: "32px",
  borderRadius: "8px",
  border: "2px solid rgb(229,231,235)",
  width: "210mm",
  maxWidth: "210mm",
  margin: "0 auto",
  fontFamily: "Arial, sans-serif",
  color: "rgb(0,0,0)",
  direction: "rtl",
};

function createReceiptNode(order: Order) {
  const node = document.createElement("div");
  Object.assign(node.style, {
    backgroundColor: "rgb(255,255,255)",
    padding: "32px",
    borderRadius: "8px",
    border: "2px solid rgb(229,231,235)",
    width: "210mm",
    maxWidth: "210mm",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
    color: "rgb(0,0,0)",
    direction: "rtl",
  });
  node.innerHTML = getReceiptBodyHtml(order);
  return node;
}

function sanitizeClonedDocument(clonedDoc: Document) {
  const root = clonedDoc.documentElement;
  const body = clonedDoc.body;

  root.style.backgroundColor = "rgb(255,255,255)";
  root.style.color = "rgb(0,0,0)";
  root.style.colorScheme = "only light";
  body.style.backgroundColor = "rgb(255,255,255)";
  body.style.color = "rgb(0,0,0)";
  body.style.colorScheme = "only light";

  root.style.setProperty("--background", "rgb(255,255,255)");
  root.style.setProperty("--foreground", "rgb(0,0,0)");
  root.style.setProperty("--card", "rgb(255,255,255)");
  root.style.setProperty("--card-foreground", "rgb(0,0,0)");
  root.style.setProperty("--popover", "rgb(255,255,255)");
  root.style.setProperty("--popover-foreground", "rgb(0,0,0)");
  root.style.setProperty("--muted", "rgb(248,250,252)");
  root.style.setProperty("--muted-foreground", "rgb(100,116,139)");
  root.style.setProperty("--accent", "rgb(248,250,252)");
  root.style.setProperty("--accent-foreground", "rgb(15,23,42)");
  root.style.setProperty("--border", "rgb(226,232,240)");
  root.style.setProperty("--input", "rgb(226,232,240)");
  root.style.setProperty("--ring", "rgb(148,163,184)");

  for (const s of Array.from(clonedDoc.styleSheets) as CSSStyleSheet[]) {
    try {
      s.disabled = true;
    } catch (_e) {
      // ignore cross-origin sheets
    }
  }
}

async function captureReceiptCanvas(order: Order) {
  const node = createReceiptNode(order);
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.backgroundColor = "rgb(255,255,255)";
  container.style.color = "rgb(0,0,0)";
  container.style.colorScheme = "only light";
  container.appendChild(node);
  document.body.appendChild(container);

  try {
    return await html2canvas(node, {
      scale: 2,
      useCORS: true,
      backgroundColor: "rgb(255,255,255)",
      logging: false,
      onclone: (clonedDoc: Document) => {
        sanitizeClonedDocument(clonedDoc);
      },
    });
  } finally {
    try {
      document.body.removeChild(container);
    } catch (_e) {
      /* noop */
    }
  }
}

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const orderId = params.id as string;

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    orderService
      .getById(orderId)
      .then((data) => setOrder(data))
      .catch((err) => setError(err.message || "فشل في تحميل بيانات الطلب"))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handlePrint = async () => {
    if (!order) return;
    setIsGenerating(true);
    try {
      const canvas = await captureReceiptCanvas(order);

      const imgWidthPx = canvas.width;
      const imgHeightPx = canvas.height;
      const a4WidthMm = 210;
      const a4HeightMm = 297;
      const pxPerMm = imgWidthPx / a4WidthMm;
      const pageHeightPx = Math.floor(a4HeightMm * pxPerMm);

      let position = 0;
      const images: string[] = [];

      while (position < imgHeightPx) {
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = imgWidthPx;
        pageCanvas.height = Math.min(pageHeightPx, imgHeightPx - position);
        const ctx = pageCanvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.fillStyle = "rgb(255,255,255)";
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          position,
          pageCanvas.width,
          pageCanvas.height,
          0,
          0,
          pageCanvas.width,
          pageCanvas.height
        );
        images.push(pageCanvas.toDataURL("image/png", 1.0));
        position += pageCanvas.height;
      }

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error("فشل في فتح نافذة الطباعة");
      }

      const doc = printWindow.document;
      doc.open();
      doc.write(
        `<html><head><title>فاتورة ${escapeHtml(order.orderNumber)}</title><style>body{margin:0;padding:10mm;font-family:Arial, sans-serif} img{display:block;width:100%;height:auto;margin-bottom:8mm}</style></head><body>`
      );
      for (const img of images) doc.write(`<img src="${img}" />`);
      doc.write("</body></html>");
      doc.close();

      const imagesInDoc = Array.from(doc.images) as HTMLImageElement[];
      await Promise.all(
        imagesInDoc.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) return resolve();
              img.onload = () => resolve();
              img.onerror = () => resolve();
            })
        )
      );

      printWindow.focus();
      printWindow.print();
    } catch (error) {
      console.error("Print error:", error);
      alert("فشل في الطباعة. تحقق من وحدة التحكم (console) للمزيد من التفاصيل");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!order) return;
    setIsGenerating(true);
    try {
      const canvas = await captureReceiptCanvas(order);

      const imgWidthPx = canvas.width;
      const imgHeightPx = canvas.height;

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const pxPerMm = imgWidthPx / pdfWidth;
      const pageHeightPx = Math.floor(pdfHeight * pxPerMm);

      let position = 0;
      let page = 0;

      while (position < imgHeightPx) {
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = imgWidthPx;
        pageCanvas.height = Math.min(pageHeightPx, imgHeightPx - position);
        const ctx = pageCanvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.fillStyle = "rgb(255,255,255)";
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          position,
          pageCanvas.width,
          pageCanvas.height,
          0,
          0,
          pageCanvas.width,
          pageCanvas.height
        );

        const imgData = pageCanvas.toDataURL("image/png", 1.0);
        const imgMmHeight = pageCanvas.height / pxPerMm;

        if (page > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgMmHeight, undefined, "FAST");

        position += pageCanvas.height;
        page += 1;
      }

      pdf.save(`receipt-${order.orderNumber || order.id}.pdf`);
    } catch (error) {
      console.error("PDF error:", error);
      alert(
        "فشل في توليد PDF. تحقق من وحدة التحكم (console) للمزيد من التفاصيل"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        dir="rtl"
      >
        <Loader2 className="w-8 h-8 animate-spin ml-3" />
        <span className="text-lg text-muted-foreground">
          جارٍ تحميل الفاتورة...
        </span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen gap-4"
        dir="rtl"
      >
        <div className="text-lg text-destructive">
          {error || "لم يتم العثور على الطلب"}
        </div>
        <Button variant="outline" onClick={() => router.push("/orders")}>
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة إلى الطلبات
        </Button>
      </div>
    );
  }

  const receiptHtml = getReceiptBodyHtml(order);

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      {/* Action Bar — hidden when printing */}
      <div className="no-print sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div
          style={{ maxWidth: "210mm" }}
          className="mx-auto px-6 py-3 flex items-center justify-between"
        >
          <Button
            variant="outline"
            onClick={() => router.push("/orders")}
            className="gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            العودة إلى الطلبات
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Printer className="h-4 w-4" />
              )}
              طباعة الفاتورة
            </Button>
            <Button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              تنزيل PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Full-page invoice document */}
      <div
        style={{ maxWidth: "210mm" }}
        className="mx-auto my-8 invoice-page-wrapper"
      >
        <div
          style={receiptStyle}
          className="shadow-lg invoice-document"
          dangerouslySetInnerHTML={{ __html: receiptHtml }}
        />
      </div>
    </div>
  );
}
