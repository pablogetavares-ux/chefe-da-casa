export type AdminPlanBreakdown = { FREE: number; PRO: number; FAMILY: number };

export type AdminStats = {
  users: number;
  recipes: number;
  pantryItems: number;
  aiGenerations: number;
  aiTokensThisMonth: number;
  chatMessagesThisMonth: number;
  activeSubscriptions: number;
  planBreakdown: AdminPlanBreakdown;
  mrrEstimateBrl: number;
  regionalOffersActive: number;
  regionalStoresActive: number;
  offerFavorites: number;
  shoppingLists: number;
  demo?: boolean;
};

export type AdminUserRow = {
  id: string;
  email: string;
  fullName: string | null;
  plan: string;
  createdAt: string;
  offerCity: string | null;
  offerState: string | null;
  offerRadiusKm: number | null;
};

export type AdminOfferRow = {
  id: string;
  title: string;
  productName: string;
  category: string;
  currentPrice: number;
  previousPrice: number | null;
  isActive: boolean;
  validUntil: string;
  storeName: string;
  storeCity: string;
  storeState: string;
};

export type AdminActivityRow = {
  id: string;
  action: string;
  userId: string;
  userEmail: string | null;
  createdAt: string;
};

export type AdminPaginated<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminTabId =
  | "overview"
  | "users"
  | "offers"
  | "activity"
  | "system";
