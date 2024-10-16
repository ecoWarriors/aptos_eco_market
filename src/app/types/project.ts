export interface Project {
  ID: string;
  active: boolean;
  batch: string;
  description: string;
  escrow: string;
  image: string;
  image_nft: string;
  location: string;
  name: string;
  order: number;
  price: number;
  registry: string;
  type: string;
  uri: string;
  solana_wallet: string;
  celo_wallet: string;
  aptos_wallet: string; 
}

  export interface TokenPrice {
    id: string;
    price: number; 
  }