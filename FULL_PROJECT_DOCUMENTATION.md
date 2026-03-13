# Ciment App — Plateforme de Gestion de Distribution

## Qu'est-ce que Ciment App ?

Ciment App est une plateforme complète qui permet de gérer toute l'activité d'une entreprise de distribution de ciment depuis un seul endroit. Fini les papiers, les fichiers Excel et les appels téléphoniques pour suivre les commandes — tout se fait depuis le navigateur web, de manière simple et organisée.

Chaque personne de l'équipe se connecte avec son propre compte et retrouve directement les outils dont elle a besoin selon son poste : les commerciaux gèrent les commandes, les magasiniers gèrent le stock, les chauffeurs et responsables logistiques gèrent les camions, les comptables suivent les finances, et les responsables supervisent le tout depuis un tableau de bord clair.

![Vue d'ensemble de l'application](screenshots/accueil-general.png)

---

## Ce que Ciment App vous apporte

Ciment App regroupe tout ce dont votre entreprise a besoin au quotidien dans une seule application web accessible depuis n'importe quel ordinateur connecté à internet.

Le système gère vos commandes de A à Z : de la saisie initiale jusqu'à la livraison, avec un suivi clair du statut de chaque commande. Vos stocks sont mis à jour automatiquement à chaque opération — plus besoin de recalculer manuellement les quantités après une livraison ou une réception de marchandise. Vos camions sont organisés avec un système d'affectation qui suit les livraisons en temps réel. Vos comptes clients et fournisseurs sont tenus à jour avec un historique complet des transactions. Et tous vos documents commerciaux — factures, bons de livraison — sont générés automatiquement en PDF, prêts à imprimer ou à envoyer par email, avec support complet de la langue arabe.

---

## Sécurité

La plateforme est conçue avec la sécurité comme priorité. Chaque utilisateur se connecte avec un identifiant et un mot de passe sécurisés. Le système vérifie à chaque instant que la personne connectée a bien le droit d'effectuer l'action demandée. Un commercial ne peut pas accéder aux finances, et un comptable ne peut pas modifier les affectations de camions — chacun travaille dans son espace dédié.

La plateforme est également protégée contre les tentatives d'intrusion grâce à plusieurs niveaux de sécurité intégrés.

---

## Les Fonctionnalités en Détail

### Connexion Sécurisée

Chaque utilisateur accède à l'application en saisissant son email et son mot de passe. Il est ensuite dirigé automatiquement vers les pages qui correspondent à son poste. Il peut changer son mot de passe à tout moment, et en cas d'oubli, il lui suffit de soumettre une demande qui sera traitée rapidement par un administrateur.

### Gestion des Utilisateurs

L'administrateur crée les comptes pour chaque membre de l'équipe et leur attribue un rôle. Il peut à tout moment consulter la liste des utilisateurs, modifier leurs informations, réinitialiser un mot de passe ou désactiver un compte. C'est lui qui contrôle qui a accès à quoi dans l'application.

![Gestion des utilisateurs](screenshots/fonc-utilisateurs.png)

### Gestion des Clients

L'application permet de tenir un répertoire complet de tous vos clients avec leurs coordonnées et leur historique. Vous pouvez ajouter de nouveaux clients, modifier leurs informations et retrouver rapidement n'importe quel client. Ce répertoire est directement utilisé lors de la création des commandes et des comptes financiers.

![Répertoire des clients](screenshots/fonc-clients.png)

### Gestion des Produits

Le catalogue de vos produits est maintenu à jour en permanence. Chaque produit affiche son nom, son prix et sa quantité disponible en stock. Les quantités sont mises à jour automatiquement à chaque commande confirmée ou réception de marchandise, ce qui vous donne toujours une vision exacte de ce qui est disponible.

![Catalogue des produits](screenshots/fonc-produits.png)

### Gestion des Commandes

C'est le cœur de l'application. Créer une commande est simple : vous sélectionnez un client, ajoutez les produits souhaités avec leurs quantités, et le système calcule automatiquement les totaux. Un numéro de commande unique est attribué à chaque commande.

Le suivi est visuel et clair : chaque commande affiche son statut (en attente, confirmée, livrée). Quand vous confirmez une commande, le système vérifie que le stock est suffisant et réserve automatiquement les quantités. Une fois la livraison effectuée, la commande passe au statut « livrée » et tous les documents associés (facture, bon de livraison) sont disponibles en PDF.

![Liste des commandes](screenshots/fonc-commandes-liste.png)

![Détail d'une commande](screenshots/fonc-commandes-detail.png)

![Facture PDF](screenshots/fonc-commandes-facture.png)

### Gestion des Fournisseurs

Comme pour les clients, vous disposez d'un répertoire complet de vos fournisseurs. Toutes leurs informations sont centralisées et facilement accessibles. Les fournisseurs sont référencés lors des réceptions de marchandise et dans la gestion des comptes financiers.

![Répertoire des fournisseurs](screenshots/fonc-fournisseurs.png)

### Gestion des Comptes et Transactions

Ce module vous donne une vision claire de la situation financière de chaque client et fournisseur. Chaque compte affiche son solde actuel, et vous pouvez enregistrer des transactions de plusieurs types : débits, crédits, paiements et remboursements. Le solde est recalculé automatiquement à chaque opération, et l'historique complet reste accessible avec des filtres de recherche.

![Gestion des comptes](screenshots/fonc-comptes.png)

![Enregistrement d'une transaction](screenshots/fonc-transactions.png)

### Gestion de la Flotte de Camions

L'application facilite la gestion de votre parc de véhicules. Vous voyez en un coup d'œil quels camions sont disponibles, lesquels sont en livraison ou en maintenance. Vous pouvez enregistrer les interventions de maintenance, les pleins de carburant et les dépenses liées à chaque camion.

Pour les livraisons, il suffit d'affecter un ou plusieurs camions à une commande en indiquant la quantité à transporter et le nom du chauffeur. Le système s'assure que la quantité totale des camions affectés couvre bien la commande complète avant de valider la livraison.

![Gestion des camions](screenshots/fonc-flotte-camions.png)

![Affectation d'un camion à une commande](screenshots/fonc-flotte-affectation.png)

### Gestion du Stock et des Livraisons

Ce module regroupe tout ce qui concerne le mouvement de la marchandise.

Les **bons de livraison** sont créés facilement à partir des commandes confirmées. Une fois la livraison effectuée, la confirmation du bon met automatiquement à jour le stock et le statut de la commande. Le bon de livraison est disponible en PDF avec support de l'arabe, prêt à imprimer ou à remettre au client.

Les **réceptions de stock** permettent d'enregistrer l'arrivée de marchandise de vos fournisseurs. Dès qu'une réception est confirmée, les quantités de chaque produit sont automatiquement augmentées dans le stock.

Les **demandes de stock** permettent de suivre les besoins de réapprovisionnement et de les traiter de manière organisée.

![Gestion du stock](screenshots/fonc-stock.png)

![Bon de livraison](screenshots/fonc-bon-livraison.png)

![PDF du bon de livraison](screenshots/fonc-bon-livraison-pdf.png)

### Notifications

Le système envoie automatiquement des notifications aux bonnes personnes au bon moment. Par exemple, quand un utilisateur demande la réinitialisation de son mot de passe, l'administrateur en est informé immédiatement. Les notifications se gèrent facilement : on peut les marquer comme lues une par une, ou toutes en même temps.

![Notifications](screenshots/fonc-notifications.png)

### Tableau de Bord

Le tableau de bord offre une vue d'ensemble instantanée de l'activité de votre entreprise. Des indicateurs clés affichent le nombre de commandes, l'état du stock et les soldes des comptes. Des graphiques visuels permettent de suivre les tendances. Un panneau de notifications récentes garde le responsable informé de tout ce qui se passe. C'est l'outil idéal pour prendre des décisions rapides et éclairées.

![Tableau de bord](screenshots/fonc-tableau-bord.png)

---

### Réapprovisionner le stock

Quand la marchandise arrive du fournisseur, il suffit de créer une réception de stock en indiquant les produits et quantités reçus. Une fois confirmée, les stocks sont mis à jour instantanément. Tout est traçable.

![Réception de stock](screenshots/processus-reapprovisionnement.png)

### Organiser les livraisons

Le responsable de la flotte voit les commandes prêtes à livrer et affecte les camions en quelques clics. Il indique la quantité par camion et le chauffeur. Quand la livraison est terminée, il complète l'affectation et le coût de transport est enregistré.

![Affectation des camions](screenshots/processus-affectation-flotte.png)

### Suivre les finances

Chaque client et fournisseur a son compte. Les transactions sont enregistrées (débits, crédits, paiements, remboursements) et le solde se met à jour automatiquement. L'historique complet est toujours consultable.

---

## Qui a accès à quoi

L'application est organisée pour que chaque personne ne voie que ce dont elle a besoin. Voici comment les accès sont répartis :

**Administrateur** — a accès à tout : utilisateurs, commandes, stock, camions, comptes et tableau de bord. C'est le superviseur général.

**Gestionnaire de Clientèle** — gère les clients et les commandes. C'est le point de contact commercial.

**Gestionnaire de Stock** — gère les produits, les réceptions, les bons de livraison et les demandes de stock. Il maintient le stock à jour.

**Gestionnaire de Camions** — gère le parc de véhicules, les affectations et les coûts liés aux livraisons.

**Comptable** — gère les comptes financiers et les transactions. Il suit les soldes clients et fournisseurs.

| Rôle | Utilisateurs | Clients | Produits | Commandes | Stock | Camions | Comptes | Tableau de bord |
|------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Administrateur | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Gest. Clientèle | — | ✅ | — | ✅ | — | — | — | — |
| Gest. Stock | — | — | ✅ | — | ✅ | — | — | — |
| Gest. Camions | — | — | — | — | — | ✅ | — | — |
| Comptable | — | — | — | — | — | — | ✅ | — |

## En Résumé

Ciment App est une solution complète, prête à l'emploi, qui centralise la gestion de vos commandes, votre stock, votre flotte de camions et vos finances dans une seule plateforme web simple d'utilisation.

Elle automatise les tâches répétitives, élimine les erreurs de saisie manuelle, fournit des documents professionnels en un clic, et donne à chaque membre de votre équipe exactement les outils dont il a besoin — ni plus, ni moins.