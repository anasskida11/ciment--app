const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { convertArabic } = require('arabic-reshaper');
const bidiFactory = require('bidi-js');
require('dotenv').config();

/**
 * Service de génération PDF modulaire
 * Génère des PDFs professionnels pour factures, devis, bons de livraison, etc.
 */

class PDFService {
  constructor() {
    this.outputDir = path.join(__dirname, '../../assets/pdfs');
    this.logoPath = path.join(__dirname, '../../assets/logo.png');
    const fontPathEnv = process.env.PDF_ARABIC_FONT_PATH;
    const boldFontPathEnv = process.env.PDF_ARABIC_BOLD_FONT_PATH;
    const fontPathSrc = path.join(__dirname, '../../assets/fonts/arabic.ttf');
    const boldFontPathSrc = path.join(__dirname, '../../assets/fonts/arabic-bold.ttf');
    const fontPathRoot = path.join(__dirname, '../../../assets/fonts/arabic.ttf');
    const boldFontPathRoot = path.join(__dirname, '../../../assets/fonts/arabic-bold.ttf');

    const isFile = (p) => {
      try {
        return fs.statSync(p).isFile();
      } catch (error) {
        return false;
      }
    };

    this.arabicFontPath =
      (fontPathEnv && isFile(fontPathEnv) && fontPathEnv) ||
      (isFile(fontPathSrc) ? fontPathSrc : fontPathRoot);
    this.arabicBoldFontPath =
      (boldFontPathEnv && isFile(boldFontPathEnv) && boldFontPathEnv) ||
      (isFile(boldFontPathSrc) ? boldFontPathSrc : boldFontPathRoot);
    
    // Créer le dossier de sortie s'il n'existe pas
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    this.bidi = bidiFactory();
  }

  isArabicText(text) {
    return /[\u0600-\u06FF]/.test(String(text || ''));
  }

  useArabicFont(doc, bold = false) {
    try {
      const regularExists = fs.existsSync(this.arabicFontPath) && fs.statSync(this.arabicFontPath).isFile();
      const boldExists = fs.existsSync(this.arabicBoldFontPath) && fs.statSync(this.arabicBoldFontPath).isFile();
      if (!regularExists) return false;

      if (!doc._fontFamilies?.Arabic) {
        doc.registerFont('Arabic', this.arabicFontPath);
      }

      if (bold && boldExists && !doc._fontFamilies?.['Arabic-Bold']) {
        doc.registerFont('Arabic-Bold', this.arabicBoldFontPath);
      }

      doc.font(bold && boldExists ? 'Arabic-Bold' : 'Arabic');
      return true;
    } catch (error) {
      // Fallback to default font if registration fails
    }
    return false;
  }

  rtlText(text) {
    if (text === null || text === undefined) return '';
    const raw = String(text);
    if (!this.isArabicText(raw)) {
      return raw;
    }
    const reshaped = convertArabic(raw);
    try {
      if (this.bidi && typeof this.bidi.getReorderedString === 'function') {
        return this.bidi.getReorderedString(reshaped);
      }
    } catch (error) {
      // fallback to reshaped
    }
    return reshaped;
  }

  shapeArabic(text) {
    if (text === null || text === undefined) return '';
    return this.rtlText(text);
  }

  shapeArabicLabel(text) {
    if (text === null || text === undefined) return '';
    const raw = String(text);
    if (!this.isArabicText(raw)) return raw;
    return convertArabic(raw);
  }

  drawKeyValueRTL(doc, label, value, y, options = {}) {
    const {
      labelWidth = 140,
      valueWidth = 200,
      gap = 10,
      rightX = 550,
      valueIsArabic = false,
      labelBold = true,
      fontSize = 10,
    } = options;
    const labelX = rightX - labelWidth;
    const valueX = labelX - gap - valueWidth;

    doc.fontSize(fontSize)
      .font(labelBold ? 'Arabic-Bold' : 'Arabic')
      .text(this.rtlText(label), labelX, y, { width: labelWidth, align: 'right' });

    if (valueIsArabic) {
      doc.fontSize(fontSize)
        .font('Arabic')
        .text(this.rtlText(String(value ?? '')), valueX, y, { width: valueWidth, align: 'left' });
    } else {
      doc.fontSize(fontSize)
        .font('Helvetica')
        .text(String(value ?? ''), valueX, y, { width: valueWidth, align: 'left' });
    }
  }

  drawLabelValueStack(doc, x, y, label, value, options = {}) {
    const { width = 220, valueIsArabic = false } = options;
    doc.fontSize(10)
      .font('Arabic-Bold')
      .text(this.shapeArabicLabel(label), x, y, { width, align: 'right' });

    const valueFont = valueIsArabic ? 'Arabic' : 'Helvetica';
    doc.fontSize(10)
      .font(valueFont)
      .text(valueIsArabic ? this.rtlText(value) : String(value ?? ''), x, y + 12, { width, align: 'left' });

    return y + 26;
  }

  /**
   * Génère un PDF de facture
   */
  async generateInvoice(invoice, client, items, order) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const filename = `facture_${invoice.invoiceNumber}_${Date.now()}.pdf`;
        const filepath = path.join(this.outputDir, filename);
        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        // En-tête avec logo
        this.addHeader(doc, 'FACTURE');

        // Informations entreprise
        this.addCompanyInfo(doc);

        // Informations client
        this.addClientInfo(doc, client);

        // Informations facture
        doc.moveDown();
        doc.fontSize(12);
        doc.text(`Facture N°: ${invoice.invoiceNumber}`, { align: 'right' });
        doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString('fr-FR')}`, { align: 'right' });
        if (order) {
          doc.text(`Commande N°: ${order.orderNumber}`, { align: 'right' });
        }

        // Tableau des articles
        doc.moveDown(2);
        this.addItemsTable(doc, items, invoice.totalAmount, invoice.taxAmount);

        // Notes et conditions
        doc.moveDown();
        this.addFooter(doc, 'Merci de votre confiance !');

        doc.end();

        stream.on('finish', () => {
          resolve({ filepath, filename, url: `/api/pdf/invoice/${filename}` });
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Génère un PDF de devis
   */
  async generateQuote(quote, client, items) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const filename = `devis_${quote.quoteNumber}_${Date.now()}.pdf`;
        const filepath = path.join(this.outputDir, filename);
        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        this.addHeader(doc, 'DEVIS');
        this.addCompanyInfo(doc);
        this.addClientInfo(doc, client);

        doc.moveDown();
        doc.fontSize(12);
        doc.text(`Devis N°: ${quote.quoteNumber}`, { align: 'right' });
        doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString('fr-FR')}`, { align: 'right' });
        if (quote.validUntil) {
          doc.text(`Valable jusqu'au: ${new Date(quote.validUntil).toLocaleDateString('fr-FR')}`, { align: 'right' });
        }

        doc.moveDown(2);
        this.addItemsTable(doc, items, quote.totalAmount, quote.taxAmount);

        doc.moveDown();
        this.addFooter(doc, 'Ce devis est valable 30 jours.');

        doc.end();

        stream.on('finish', () => {
          resolve({ filepath, filename, url: `/api/pdf/quote/${filename}` });
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Génère un PDF de bon de livraison — design professionnel
   */
  async generateDeliveryNote(deliveryNote, order, client, items, truckAssignment) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const filename = `bon_livraison_${deliveryNote.noteNumber}_${Date.now()}.pdf`;
        const filepath = path.join(this.outputDir, filename);
        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        const hasArabicFont = this.useArabicFont(doc, true);
        const fontR = hasArabicFont ? 'Arabic' : 'Helvetica';
        const fontB = hasArabicFont ? 'Arabic-Bold' : 'Helvetica-Bold';

        // Helper: render Arabic text with proper BiDi reordering for PDFKit
        const ar = (text) => this.rtlText(text);

        const PAGE_W = 595.28;
        const M = 40;
        const W = PAGE_W - 2 * M;
        const ACCENT = '#1a1a2e';
        const LIGHT_BG = '#f0f0f4';
        const BORDER = '#d0d0d0';

        const fmtCurrency = (v) => {
          const n = Number(v);
          return isNaN(n) ? `${v} MRU` : `${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MRU`;
        };

        // Helper: filled rect that preserves text fillColor
        const fillRect = (x, ry, w, h, color) => {
          doc.save();
          doc.rect(x, ry, w, h).fill(color);
          doc.restore();
        };

        // Helper: draw a bordered info box with a tinted header row
        const drawInfoBox = (x, bY, w, title, rows) => {
          const headerH = 22;
          const rowH = 18;
          const padX = 8;
          const boxH = headerH + rows.length * rowH + 8;

          // Outer border
          doc.rect(x, bY, w, boxH).lineWidth(0.5).stroke(BORDER);

          // Header fill
          fillRect(x, bY, w, headerH, ACCENT);
          doc.fontSize(10).font(fontB).fillColor('#ffffff')
            .text(ar(title), x + padX, bY + 5, { width: w - padX * 2, align: 'center' });
          doc.fillColor('#000000');

          // Header bottom line
          doc.moveTo(x, bY + headerH).lineTo(x + w, bY + headerH).lineWidth(0.3).stroke(BORDER);

          let rY = bY + headerH + 5;
          rows.forEach(({ label, value }) => {
            const valRaw = String(value ?? '');
            const isAr = this.isArabicText(valRaw);
            const valStr = isAr ? ar(valRaw) : valRaw;

            // Label on the right half
            doc.fontSize(9).font(fontB).fillColor('#000000')
              .text(ar(label), x + w / 2, rY, { width: w / 2 - padX, align: 'right' });
            // Value on the left half
            doc.fontSize(9).font(isAr ? fontR : 'Helvetica').fillColor('#333333')
              .text(valStr, x + padX, rY, { width: w / 2 - padX, align: 'left' });
            rY += rowH;
          });

          doc.fillColor('#000000');
          return boxH;
        };

        // ═══ TITLE BAR ═══════════════════════════════════════════
        fillRect(M, 28, W, 42, ACCENT);
        doc.fontSize(22).font(fontB).fillColor('#ffffff')
          .text(ar('التسليم سند  '), M, 37, { width: W, align: 'center' });
        doc.fillColor('#000000');

        // Thin accent line below title
        fillRect(M, 71, W, 3, '#e8b931');

        // ═══ TWO INFO BOXES SIDE BY SIDE ═════════════════════════
        let y = 88;
        const gap = 14;
        const halfW = (W - gap) / 2;
        const rightBoxX = M + halfW + gap;
        const leftBoxX = M;

        // Right box: Company info
        const companyRows = [];
        companyRows.push({ label: 'الاسم:', value: process.env.COMPANY_NAME || '' });
        if (process.env.COMPANY_ADDRESS) companyRows.push({ label: 'العنوان:', value: process.env.COMPANY_ADDRESS });
        if (process.env.COMPANY_PHONE) companyRows.push({ label: 'الهاتف:', value: process.env.COMPANY_PHONE });
        if (process.env.COMPANY_EMAIL) companyRows.push({ label: 'البريد:', value: process.env.COMPANY_EMAIL });
        const compBoxH = drawInfoBox(rightBoxX, y, halfW, '  الشركة بيانات ', companyRows);

        // Left box: Slip metadata
        const slipRows = [
          { label:  ': السند رقم ' , value: deliveryNote.noteNumber },
          { label: 'التاريخ:', value: new Date(deliveryNote.createdAt).toLocaleDateString('fr-FR') },
          { label: ': الطلب رقم ', value: order.orderNumber },
        ];
        const slipBoxH = drawInfoBox(leftBoxX, y, halfW, ' السند بيانات ', slipRows);

        // ═══ CLIENT INFO BOX (full width) ════════════════════════
        y += Math.max(compBoxH, slipBoxH) + 14;
        const clientRows = [{ label: 'الاسم:', value: client.name }];
        if (client.phone) clientRows.push({ label: 'الهاتف:', value: client.phone });
        if (client.email) clientRows.push({ label: 'البريد:', value: client.email });
        if (deliveryNote.deliveryAddress) clientRows.push({ label: ' العنوان تسليم :', value: deliveryNote.deliveryAddress });
        if (truckAssignment?.truck) {
          clientRows.push({ label: 'المركبة', value: truckAssignment.truck.matricule });
          if (truckAssignment.driverName) clientRows.push({ label: 'السائق', value: truckAssignment.driverName });
        }
        const clientBoxH = drawInfoBox(M, y, W, ' العميل بيانات ', clientRows);

        // ═══ ITEMS TABLE ═════════════════════════════════════════
        y += clientBoxH + 16;

        // Column layout (RTL visual): المنتج | الكمية | سعر الوحدة | الإجمالي
        // Drawn left-to-right:        الإجمالي | سعر الوحدة | الكمية | المنتج
        const colW = [W * 0.20, W * 0.20, W * 0.10, W * 0.50];
        const colX = [M];
        for (let i = 1; i < 4; i++) colX.push(colX[i - 1] + colW[i - 1]);

        const headerH = 26;
        const rowH = 24;

        // Table header
        fillRect(M, y, W, headerH, ACCENT);
        const headers = ['الإجمالي', ' الوحدة سعر ', 'الكمية', 'المنتج'];
        doc.fontSize(10).font(fontB).fillColor('#ffffff');
        for (let i = 0; i < 4; i++) {
          doc.text(ar(headers[i]), colX[i] + 4, y + 7, {
            width: colW[i] - 8,
            align: 'center',
          });
        }
        doc.fillColor('#000000');
        y += headerH;

        // Table rows
        items.forEach((item, idx) => {
          // Alternating row background
          if (idx % 2 === 0) {
            fillRect(M, y, W, rowH, LIGHT_BG);
          }

          // Row outer border
          doc.rect(M, y, W, rowH).lineWidth(0.3).stroke(BORDER);
          // Vertical cell dividers
          for (let i = 1; i < 4; i++) {
            doc.moveTo(colX[i], y).lineTo(colX[i], y + rowH).lineWidth(0.3).stroke(BORDER);
          }

          const textY = y + 7;
          const productName = item.product?.name || 'منتج';
          const isArProduct = this.isArabicText(productName);

          // Reset fillColor to black for text
          doc.fillColor('#000000');

          // الإجمالي
          doc.fontSize(9).font('Helvetica')
            .text(fmtCurrency(item.subtotal), colX[0] + 4, textY, { width: colW[0] - 8, align: 'center' });
          // سعر الوحدة
          doc.text(fmtCurrency(item.unitPrice), colX[1] + 4, textY, { width: colW[1] - 8, align: 'center' });
          // الكمية
          doc.text(item.quantity.toString(), colX[2] + 4, textY, { width: colW[2] - 8, align: 'center' });
          // المنتج
          doc.fontSize(9).font(isArProduct ? fontR : 'Helvetica')
            .text(isArProduct ? ar(productName) : productName, colX[3] + 6, textY, {
              width: colW[3] - 12,
              align: 'right',
            });

          y += rowH;
        });

        // Bottom border of last row
        doc.moveTo(M, y).lineTo(M + W, y).lineWidth(0.5).stroke(BORDER);

        // ═══ TOTALS ══════════════════════════════════════════════
        if (order?.totalAmount != null) {
          y += 4;
          // Double accent line
          doc.moveTo(M, y).lineTo(M + W, y).lineWidth(1.5).stroke(ACCENT);
          y += 3;
          doc.moveTo(M, y).lineTo(M + W, y).lineWidth(0.5).stroke(ACCENT);

          y += 10;
          const totalStr = fmtCurrency(order.totalAmount);

          doc.fillColor('#000000');
          doc.fontSize(13).font(fontB)
            .text(ar(' الإجمالي السعر '), M + W * 0.30, y, { width: W * 0.50, align: 'right' });
          doc.fontSize(13).font('Helvetica-Bold')
            .text(totalStr, M + 8, y, { width: W * 0.28, align: 'center' });
        }

        // ═══ NOTES ═══════════════════════════════════════════════
        y += 36;
        doc.fillColor('#000000');
        doc.fontSize(10).font(fontB)
          .text(ar('ملاحظات:'), M, y, { width: W, align: 'right' });
        y += 16;
        const notesText = deliveryNote.notes || '—';
        doc.fontSize(9).font(this.isArabicText(notesText) ? fontR : 'Helvetica')
          .text(this.isArabicText(notesText) ? ar(notesText) : notesText, M, y, { width: W, align: 'right' });

        // ═══ SIGNATURE SECTION ═══════════════════════════════════
        y += 35;
        doc.fillColor('#000000');
        const sigW = (W - 40) / 2;

        // Right: Client signature
        doc.fontSize(10).font(fontB)
          .text(ar(' العميل توقيع '), M + sigW + 40, y, { width: sigW, align: 'center' });
        doc.moveTo(M + sigW + 70, y + 40).lineTo(M + W - 30, y + 40).lineWidth(0.5).stroke('#999999');

        // Left: Company rep signature
        doc.fontSize(10).font(fontB)
          .text(ar(' المسؤول توقيع '), M, y, { width: sigW, align: 'center' });
        doc.moveTo(M + 30, y + 40).lineTo(M + sigW - 10, y + 40).lineWidth(0.5).stroke('#999999');

        doc.end();

        stream.on('finish', () => {
          resolve({ filepath, filename, url: `/api/pdf/delivery-note/${filename}` });
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Génère un PDF de bon de demande
   */
  async generateStockRequest(stockRequest, order, items) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const filename = `bon_demande_${stockRequest.requestNumber}_${Date.now()}.pdf`;
        const filepath = path.join(this.outputDir, filename);
        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        this.addHeader(doc, 'BON DE DEMANDE');
        this.addCompanyInfo(doc);

        doc.moveDown();
        doc.fontSize(12);
        doc.text(`Bon de demande N°: ${stockRequest.requestNumber}`, { align: 'right' });
        doc.text(`Date: ${new Date(stockRequest.createdAt).toLocaleDateString('fr-FR')}`, { align: 'right' });
        doc.text(`Commande N°: ${order.orderNumber}`, { align: 'right' });

        doc.moveDown(2);
        this.addItemsTable(doc, items, null, null, false);

        doc.moveDown();
        this.addFooter(doc, 'À préparer et livrer selon la commande.');

        doc.end();

        stream.on('finish', () => {
          resolve({ filepath, filename, url: `/api/pdf/stock-request/${filename}` });
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Génère un PDF de réception de stock
   */
  async generateStockReceipt(stockReceipt, supplier, items) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const filename = `reception_stock_${stockReceipt.receiptNumber}_${Date.now()}.pdf`;
        const filepath = path.join(this.outputDir, filename);
        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        this.addHeader(doc, 'RÉCEPTION DE STOCK');
        this.addCompanyInfo(doc);

        if (supplier) {
          doc.moveDown();
          doc.fontSize(12);
          doc.text(`Fournisseur: ${supplier.name}`, { align: 'left' });
          if (supplier.phone) doc.text(`Téléphone: ${supplier.phone}`, { align: 'left' });
        }

        doc.moveDown();
        doc.text(`Réception N°: ${stockReceipt.receiptNumber}`, { align: 'right' });
        doc.text(`Date: ${new Date(stockReceipt.createdAt).toLocaleDateString('fr-FR')}`, { align: 'right' });

        doc.moveDown(2);
        this.addItemsTable(doc, items, null, null, false);

        doc.moveDown();
        this.addFooter(doc, 'Stock enregistré et disponible.');

        doc.end();

        stream.on('finish', () => {
          resolve({ filepath, filename, url: `/api/pdf/stock-receipt/${filename}` });
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Méthodes helper pour la mise en forme

  addHeader(doc, title) {
    // Logo (si disponible)
    if (fs.existsSync(this.logoPath)) {
      doc.image(this.logoPath, 50, 50, { width: 100 });
    }

    // Titre
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text(title, 200, 50, { align: 'left' });

    doc.moveDown(3);
  }

  addCompanyInfo(doc) {
    const companyName = process.env.COMPANY_NAME || 'Entreprise de Distribution';
    const companyAddress = process.env.COMPANY_ADDRESS || 'Adresse de l\'entreprise';
    const companyPhone = process.env.COMPANY_PHONE || '';
    const companyEmail = process.env.COMPANY_EMAIL || '';

    doc.fontSize(10)
       .font('Helvetica')
       .text(companyName, { align: 'left' })
       .text(companyAddress, { align: 'left' });
    
    if (companyPhone) doc.text(`Tél: ${companyPhone}`, { align: 'left' });
    if (companyEmail) doc.text(`Email: ${companyEmail}`, { align: 'left' });
  }

  addClientInfo(doc, client) {
    doc.moveDown();
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Client:', { align: 'left' })
       .font('Helvetica')
       .fontSize(10)
       .text(client.name, { align: 'left' });
    
    if (client.phone) doc.text(`Tél: ${client.phone}`, { align: 'left' });
    if (client.email) doc.text(`Email: ${client.email}`, { align: 'left' });
  }

  addItemsTable(doc, items, totalAmount, taxAmount, showTotal = true) {
    // En-tête du tableau
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('Désignation', 50, doc.y)
       .text('Qté', 250, doc.y)
       .text('Prix unit.', 300, doc.y)
       .text('Total', 400, doc.y, { align: 'right' });

    doc.moveTo(50, doc.y + 5)
       .lineTo(550, doc.y)
       .stroke();

    doc.moveDown();

    // Lignes des articles
    items.forEach((item) => {
      const y = doc.y;
      doc.font('Helvetica')
         .fontSize(9)
         .text(item.product?.name || 'Produit', 50, y, { width: 200 })
         .text(item.quantity.toString(), 250, y)
         .text(`${item.unitPrice} MRU`, 300, y)
         .text(`${item.subtotal} MRU`, 400, y, { align: 'right' });

      doc.moveDown();
    });

    // Totaux
    if (showTotal && totalAmount !== null) {
      doc.moveDown();
      doc.moveTo(350, doc.y)
         .lineTo(550, doc.y)
         .stroke();

      doc.moveDown();
      doc.font('Helvetica-Bold')
         .fontSize(10);

      if (taxAmount && taxAmount > 0) {
        const subtotal = totalAmount - taxAmount;
        doc.text(`Sous-total: ${subtotal} MRU`, 400, doc.y, { align: 'right' });
        doc.moveDown();
        doc.text(`TVA: ${taxAmount} MRU`, 400, doc.y, { align: 'right' });
        doc.moveDown();
      }

      doc.fontSize(12)
         .text(`TOTAL: ${totalAmount} MRU`, 400, doc.y, { align: 'right' });
    }
  }

  addFooter(doc, text) {
    doc.moveDown(3);
    doc.fontSize(9)
       .font('Helvetica')
       .text(text, { align: 'center' });
  }

  /**
   * Supprime un fichier PDF
   */
  deletePDF(filename) {
    const filepath = path.join(this.outputDir, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
    return false;
  }
}

// Instance singleton
const pdfService = new PDFService();

module.exports = pdfService;
