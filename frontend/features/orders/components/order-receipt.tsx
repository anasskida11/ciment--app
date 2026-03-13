/**
 * Receipt component for orders with PDF generation
 * Uses html2canvas + jsPDF for robust PDF/print generation (disables problematic styles during capture)
 */

'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Printer, Loader2 } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/shared/utils/format';
import type { Order } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Company info used on the invoice header (override via NEXT_PUBLIC_COMPANY_* env vars if desired)
const COMPANY = {
  name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'نظام إدارة الشركة',
  address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || 'العنوان الكامل، المدينة، الدولة',
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || '+222 000000000',
  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'contact@example.com',
  logo: process.env.NEXT_PUBLIC_COMPANY_LOGO || '', // optional URL to logo
};


interface OrderReceiptProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderReceipt({ order, isOpen, onClose }: OrderReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [scaledSize, setScaledSize] = useState<{ width: number; height: number } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const receiptStyle = {
    backgroundColor: 'rgb(255,255,255)',
    padding: '32px',
    borderRadius: '8px',
    border: '2px solid rgb(229,231,235)',
    width: '210mm',
    maxWidth: '210mm',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
    color: 'rgb(0,0,0)',
    direction: 'rtl' as const,
  };

  function getReceiptBodyHtml(order: Order) {
    const itemsRows = (order.items || []).map((item, idx) => `
      <tr>
        <td style="text-align:center;padding:12px;border:1px solid rgb(229,231,235)">${idx + 1}</td>
        <td style="text-align:right;padding:12px;border:1px solid rgb(229,231,235)">${escapeHtml(item.product?.name || 'منتج محذوف')}</td>
        <td style="text-align:center;padding:12px;border:1px solid rgb(229,231,235)">${item.quantity}</td>
        <td style="text-align:left;padding:12px;border:1px solid rgb(229,231,235)">${escapeHtml(formatCurrency(item.unitPrice))}</td>
        <td style="text-align:left;padding:12px;border:1px solid rgb(229,231,235);font-weight:600">${escapeHtml(formatCurrency(item.subtotal))}</td>
      </tr>
    `).join('');

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
          <div style="color:rgb(55,65,81)">
            <div>رقم الطلب: ${escapeHtml(order.orderNumber || order.id)}</div>
            <div>التاريخ: ${escapeHtml(formatDateTime(order.createdAt))}</div>
            <div>الحالة: <span style="margin-right:8px;padding:4px 8px;background-color:rgb(209,250,229);color:rgb(6,95,70);border-radius:4px;font-size:14px;display:inline-block">${escapeHtml(order.status === 'CONFIRMED' ? 'مؤكد' : order.status)}</span></div>
          </div>
        </div>
        <div>
          <div style="font-weight:600;font-size:18px;margin-bottom:12px;color:rgb(17,24,39)">معلومات العميل</div>
          <div style="color:rgb(55,65,81)">
            <div>الاسم: ${escapeHtml(order.client?.name || '')}</div>
            ${order.client?.phone ? `<div>الهاتف: ${escapeHtml(order.client.phone)}</div>` : ''}
            ${order.client?.email ? `<div>البريد: ${escapeHtml(order.client.email)}</div>` : ''}
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

      ${order.notes ? `<div style="margin-bottom:24px;padding:16px;background-color:rgb(249,250,251);border-radius:4px;border:1px solid rgb(229,231,235)"><h4 style="font-weight:600;margin-bottom:8px;color:rgb(17,24,39)">ملاحظات:</h4><p style="color:rgb(55,65,81)">${escapeHtml(order.notes)}</p></div>` : ''}

      <div style="text-align:center;padding-top:24px;border-top:2px solid rgb(209,213,219);margin-top:16px;color:rgb(107,114,128)">شكراً لتعاملكم معنا</div>
    `;
  }

  function createReceiptNode(order: Order) {
    const node = document.createElement('div');
    node.style.backgroundColor = receiptStyle.backgroundColor;
    node.style.padding = receiptStyle.padding;
    node.style.borderRadius = receiptStyle.borderRadius;
    node.style.border = receiptStyle.border;
    node.style.width = receiptStyle.width;
    node.style.maxWidth = receiptStyle.maxWidth;
    node.style.margin = receiptStyle.margin;
    node.style.fontFamily = receiptStyle.fontFamily;
    node.style.color = receiptStyle.color;
    node.style.direction = receiptStyle.direction;
    node.innerHTML = getReceiptBodyHtml(order);
    return node;
  }

  function sanitizeClonedDocument(clonedDoc: Document) {
    const root = clonedDoc.documentElement;
    const body = clonedDoc.body;

    root.style.backgroundColor = 'rgb(255,255,255)';
    root.style.color = 'rgb(0,0,0)';
    root.style.colorScheme = 'only light';
    body.style.backgroundColor = 'rgb(255,255,255)';
    body.style.color = 'rgb(0,0,0)';
    body.style.colorScheme = 'only light';

    root.style.setProperty('--background', 'rgb(255,255,255)');
    root.style.setProperty('--foreground', 'rgb(0,0,0)');
    root.style.setProperty('--card', 'rgb(255,255,255)');
    root.style.setProperty('--card-foreground', 'rgb(0,0,0)');
    root.style.setProperty('--popover', 'rgb(255,255,255)');
    root.style.setProperty('--popover-foreground', 'rgb(0,0,0)');
    root.style.setProperty('--muted', 'rgb(248,250,252)');
    root.style.setProperty('--muted-foreground', 'rgb(100,116,139)');
    root.style.setProperty('--accent', 'rgb(248,250,252)');
    root.style.setProperty('--accent-foreground', 'rgb(15,23,42)');
    root.style.setProperty('--border', 'rgb(226,232,240)');
    root.style.setProperty('--input', 'rgb(226,232,240)');
    root.style.setProperty('--ring', 'rgb(148,163,184)');

    for (const s of Array.from(clonedDoc.styleSheets) as CSSStyleSheet[]) {
      try {
        s.disabled = true;
      } catch (e) {
        // ignore cross-origin sheets
      }
    }
  }

  async function captureReceiptCanvas(order: Order) {
    const node = createReceiptNode(order);
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '0';
    container.style.backgroundColor = 'rgb(255,255,255)';
    container.style.color = 'rgb(0,0,0)';
    container.style.colorScheme = 'only light';
    container.appendChild(node);
    document.body.appendChild(container);

    try {
      return await html2canvas(node, {
        scale: 2,
        useCORS: true,
        backgroundColor: 'rgb(255,255,255)',
        logging: false,
        onclone: (clonedDoc) => {
          sanitizeClonedDocument(clonedDoc);
        }
      });
    } finally {
      try { document.body.removeChild(container); } catch (e) {}
    }
  }

  function escapeHtml(s: any) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'} as any)[c]);
  }

  const receiptHtml = getReceiptBodyHtml(order);

  const handlePrint = async () => {
    if (!receiptRef.current) {
      alert('عنصر الفاتورة غير متاح');
      return;
    }

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
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgWidthPx;
        pageCanvas.height = Math.min(pageHeightPx, imgHeightPx - position);
        const ctx = pageCanvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(canvas, 0, position, pageCanvas.width, pageCanvas.height, 0, 0, pageCanvas.width, pageCanvas.height);
        images.push(pageCanvas.toDataURL('image/png', 1.0));
        position += pageCanvas.height;
      }

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('فشل في فتح نافذة الطباعة');
      }

      const doc = printWindow.document;
      doc.open();
      doc.write(`<html><head><title>فاتورة ${order.orderNumber}</title><style>body{margin:0;padding:10mm;font-family:Arial, sans-serif} img{display:block;width:100%;height:auto;margin-bottom:8mm}</style></head><body>`);
      for (const img of images) doc.write(`<img src="${img}" />`);
      doc.write('</body></html>');
      doc.close();

      const imagesInDoc = Array.from(doc.images) as HTMLImageElement[];
      await Promise.all(imagesInDoc.map(img => new Promise<void>((resolve) => { if (img.complete) return resolve(); img.onload = () => resolve(); img.onerror = () => resolve(); })));

      printWindow.focus();
      printWindow.print();
    } catch (error: any) {
      console.error('Print error:', error);
      alert('فشل في الطباعة. تحقق من وحدة التحكم (console) للمزيد من التفاصيل');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) {
      alert('عنصر الفاتورة غير متاح');
      return;
    }

    setIsGenerating(true);
    try {
      const canvas = await captureReceiptCanvas(order);

      const imgWidthPx = canvas.width;
      const imgHeightPx = canvas.height;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const pxPerMm = imgWidthPx / pdfWidth;
      const pageHeightPx = Math.floor(pdfHeight * pxPerMm);

      let position = 0;
      let page = 0;

      while (position < imgHeightPx) {
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgWidthPx;
        pageCanvas.height = Math.min(pageHeightPx, imgHeightPx - position);
        const ctx = pageCanvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(canvas, 0, position, pageCanvas.width, pageCanvas.height, 0, 0, pageCanvas.width, pageCanvas.height);

        const imgData = pageCanvas.toDataURL('image/png', 1.0);
        const imgMmHeight = pageCanvas.height / pxPerMm;

        if (page > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgMmHeight, undefined, 'FAST');

        position += pageCanvas.height;
        page += 1;
      }

      pdf.save(`receipt-${order.orderNumber || order.id}.pdf`);
    } catch (error: any) {
      console.error('PDF error:', error);
      alert('فشل في توليد PDF. تحقق من وحدة التحكم (console) للمزيد من التفاصيل');
    } finally {
      setIsGenerating(false);
    }
  };

  useLayoutEffect(() => {
    if (!isOpen) return;
    const viewport = viewportRef.current;
    const receipt = receiptRef.current;
    if (!viewport || !receipt) return;

    const updateScale = () => {
      const viewportHeight = viewport.clientHeight;
      const viewportWidth = viewport.clientWidth;
      const receiptHeight = receipt.scrollHeight;
      const receiptWidth = receipt.scrollWidth;

      if (receiptHeight === 0 || receiptWidth === 0) {
        setScale(1);
        setScaledSize(null);
        return;
      }

      const heightScale = (viewportHeight - 16) / receiptHeight;
      const widthScale = (viewportWidth - 16) / receiptWidth;
      const nextScale = Math.min(1, heightScale, widthScale);
      const finalScale = Number.isFinite(nextScale) ? nextScale : 1;
      setScale(finalScale);
      setScaledSize({
        width: Math.max(1, Math.floor(receiptWidth * finalScale)),
        height: Math.max(1, Math.floor(receiptHeight * finalScale)),
      });
    };

    const frame = requestAnimationFrame(updateScale);
    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(viewport);
    resizeObserver.observe(receipt);
    window.addEventListener('resize', updateScale);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>فاتورة الطلب #{order.orderNumber}</DialogTitle>
          <DialogDescription>
            يمكنك تنزيل الفاتورة بصيغة PDF أو طباعتها مباشرة.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-4 mb-6 pb-4 border-b" style={{ direction: 'rtl' }}>
          <Button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                جاري التحضير...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 ml-2" />
                تنزيل PDF
              </>
            )}
          </Button>

          <Button
            onClick={handlePrint}
            disabled={isGenerating}
            className="flex-1"
            size="lg"
          >
            <Printer className="w-5 h-5 ml-2" />
            طباعة الفاتورة
          </Button>
        </div>

        {/* Receipt Content */}
        <div
          ref={viewportRef}
          style={{
            maxHeight: 'calc(90vh - 180px)',
            overflowX: 'auto',
            overflowY: 'auto',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            padding: '8px',
            direction: 'rtl',
          }}
        >
          <div
            style={{
              width: scaledSize ? `${scaledSize.width}px` : 'auto',
              height: scaledSize ? `${scaledSize.height}px` : 'auto',
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <div
              ref={receiptRef}
              style={receiptStyle}
              dangerouslySetInnerHTML={{ __html: receiptHtml }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
