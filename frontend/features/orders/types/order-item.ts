/**
 * Type pour un article de commande local (avant soumission à l'API)
 */

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  amount: number;
}
