# 📄 Guide d'Intégration PDF et SMS

## ✅ Services Créés

### 1. Service PDF (`src/services/pdf/pdf.service.js`)
- ✅ Génération de factures
- ✅ Génération de devis
- ✅ Génération de bons de livraison
- ✅ Génération de bons de demande
- ✅ Génération de réceptions de stock

### 2. Service SMS (`src/services/sms/sms.service.js`)
- ✅ Envoi SMS au directeur
- ✅ Messages préformatés
- ✅ Support Twilio (configurable)
- ✅ Mode développement (sans SMS réel)

### 3. Routes PDF (`src/routes/pdf.routes.js`)
- ✅ Téléchargement de factures
- ✅ Téléchargement de devis
- ✅ Téléchargement de bons de livraison
- ✅ Téléchargement de bons de demande
- ✅ Téléchargement de réceptions de stock

---

## ⚙️ Configuration Requise

Ajoutez ces variables dans votre fichier `.env` :

```env
# Configuration SMS
SMS_ENABLED=true
SMS_PROVIDER=twilio
DIRECTOR_PHONE=+222XXXXXXXXX
TWILIO_ACCOUNT_SID=votre_account_sid
TWILIO_AUTH_TOKEN=votre_auth_token
TWILIO_PHONE_NUMBER=votre_numero_twilio

# Configuration Entreprise (pour PDFs)
COMPANY_NAME=Votre Entreprise
COMPANY_ADDRESS=Adresse de l'entreprise, Mauritanie
COMPANY_PHONE=+222XXXXXXXXX
COMPANY_EMAIL=contact@entreprise.mr
```

**Note :** Si `SMS_ENABLED=false`, les SMS seront loggés mais pas envoyés (mode développement).

---

## 📝 Exemple d'Intégration dans un Controller

### Exemple : Créer une facture avec génération PDF

```javascript
const pdfService = require('../services/pdf/pdf.service');
const notificationService = require('../services/notification.service');

// Dans votre controller
const createInvoice = async (req, res, next) => {
  try {
    // ... votre logique existante pour créer la facture ...
    
    const invoice = await prisma.invoice.create({ ... });
    const client = await prisma.client.findUnique({ where: { id: invoice.clientId } });
    const items = await prisma.invoiceItem.findMany({ 
      where: { invoiceId: invoice.id },
      include: { product: true }
    });
    const order = await prisma.order.findUnique({ where: { id: invoice.orderId } });

    // Générer le PDF
    const pdfResult = await pdfService.generateInvoice(invoice, client, items, order);
    
    // Mettre à jour la facture avec l'URL du PDF (optionnel)
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { documentUrl: pdfResult.url }
    });

    // Envoyer notification avec SMS
    await notificationService.invoiceCreated(
      invoice.id,
      invoice.orderId,
      req.user.id,
      invoice.invoiceNumber,
      client.name,
      invoice.totalAmount
    );

    res.status(201).json({
      success: true,
      message: 'Facture créée avec succès',
      data: {
        invoice,
        pdf: {
          filename: pdfResult.filename,
          downloadUrl: pdfResult.url
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 🔧 Intégration dans les Controllers Existants

### 1. **Order Controller** - Créer commande
```javascript
// Après création de la commande
await notificationService.orderCreated(
  order.id,
  req.user.id,
  order.orderNumber,
  client.name,
  order.totalAmount
);
```

### 2. **Stock Request Controller** - Créer bon de demande
```javascript
// Après création du bon de demande
const pdfResult = await pdfService.generateStockRequest(
  stockRequest,
  order,
  items
);

await notificationService.stockRequestCreated(
  stockRequest.id,
  order.id,
  req.user.id,
  stockRequest.requestNumber,
  order.orderNumber
);
```

### 3. **Delivery Note Controller** - Créer bon de livraison
```javascript
// Après création du bon de livraison
const pdfResult = await pdfService.generateDeliveryNote(
  deliveryNote,
  order,
  client,
  items,
  truckAssignment
);

await notificationService.deliveryNoteCreated(
  deliveryNote.id,
  order.id,
  req.user.id,
  deliveryNote.noteNumber,
  order.orderNumber
);
```

### 4. **Stock Receipt Controller** - Réception de stock
```javascript
// Après réception de stock
const pdfResult = await pdfService.generateStockReceipt(
  stockReceipt,
  supplier,
  items
);

await notificationService.stockReceived(
  stockReceipt.id,
  req.user.id,
  stockReceipt.receiptNumber,
  supplier?.name || 'Inconnu'
);
```

---

## 📱 Utilisation des Routes PDF

Une fois les PDFs générés, ils sont accessibles via :

```
GET /api/pdf/invoice/:filename
GET /api/pdf/quote/:filename
GET /api/pdf/delivery-note/:filename
GET /api/pdf/stock-request/:filename
GET /api/pdf/stock-receipt/:filename
```

**Exemple :**
```javascript
// Dans votre réponse API
{
  "success": true,
  "data": {
    "invoice": { ... },
    "pdf": {
      "filename": "facture_INV-123_1234567890.pdf",
      "downloadUrl": "/api/pdf/invoice/facture_INV-123_1234567890.pdf"
    }
  }
}
```

Le frontend peut alors faire :
```javascript
window.open(`http://localhost:3000${pdf.downloadUrl}`, '_blank');
```

---

## 🎨 Personnalisation des PDFs

### Ajouter un logo
1. Placez votre logo dans `src/assets/logo.png`
2. Le service PDF l'utilisera automatiquement

### Modifier les templates
Éditez `src/services/pdf/pdf.service.js` pour personnaliser :
- Couleurs
- Polices
- Mise en page
- Informations affichées

---

## 📞 Configuration SMS

### Option 1 : Twilio (Recommandé)
1. Créez un compte sur [Twilio.com](https://www.twilio.com)
2. Obtenez votre Account SID et Auth Token
3. Achetez un numéro de téléphone
4. Configurez dans `.env`

### Option 2 : Service SMS Local (Mauritanie)
Pour utiliser un service SMS local, modifiez `src/services/sms/sms.service.js` :
```javascript
// Dans le constructeur, ajoutez votre service
if (this.provider === 'local') {
  // Intégrez votre service SMS local
}
```

---

## 🧪 Test en Mode Développement

Sans configuration SMS, les messages sont loggés dans la console :
```
📱 [SMS désactivé] Message au directeur: ...
```

Les PDFs sont générés normalement dans `src/assets/pdfs/`.

---

## ✅ Checklist d'Intégration

- [ ] Ajouter variables d'environnement dans `.env`
- [ ] Placer le logo dans `src/assets/logo.png`
- [ ] Intégrer `pdfService` dans les controllers de factures
- [ ] Intégrer `pdfService` dans les controllers de devis
- [ ] Intégrer `pdfService` dans les controllers de bons de livraison
- [ ] Intégrer `notificationService` avec SMS dans tous les controllers
- [ ] Tester la génération PDF
- [ ] Tester l'envoi SMS (ou vérifier les logs en mode dev)
- [ ] Vérifier les routes de téléchargement PDF

---

## 🐛 Dépannage

### PDF ne se génère pas
- Vérifiez que le dossier `src/assets/pdfs` existe
- Vérifiez les permissions d'écriture
- Vérifiez les logs d'erreur

### SMS ne s'envoie pas
- Vérifiez `SMS_ENABLED=true` dans `.env`
- Vérifiez les credentials Twilio
- Vérifiez le format du numéro (commence par +)
- En mode dev, vérifiez les logs console

### Logo ne s'affiche pas
- Vérifiez que `src/assets/logo.png` existe
- Format PNG recommandé
- Taille recommandée : 200x100px max

---

## 📚 Documentation des Services

### PDF Service
```javascript
// Générer une facture
await pdfService.generateInvoice(invoice, client, items, order);

// Générer un devis
await pdfService.generateQuote(quote, client, items);

// Générer un bon de livraison
await pdfService.generateDeliveryNote(deliveryNote, order, client, items, truckAssignment);

// Générer un bon de demande
await pdfService.generateStockRequest(stockRequest, order, items);

// Générer une réception de stock
await pdfService.generateStockReceipt(stockReceipt, supplier, items);
```

### SMS Service
```javascript
// Envoyer SMS au directeur
await smsService.sendToDirector(message, priority);

// Envoyer SMS personnalisé
await smsService.sendSMS(phoneNumber, message);

// Utiliser messages préformatés
const message = smsService.formatMessages.orderCreated(orderNumber, clientName, amount);
```

---

## 🎯 Prochaines Étapes

1. **Intégrer dans les controllers** - Suivez les exemples ci-dessus
2. **Tester chaque fonctionnalité** - PDF et SMS séparément
3. **Personnaliser les templates** - Logo, couleurs, mise en page
4. **Configurer SMS production** - Twilio ou service local
5. **Documenter pour votre ami** - Frontend pour utiliser les URLs PDF
