export type FurnitureStatus =
  | "DRAFT"
  | "UNDER_REVIEW"
  | "PUBLISHED"
  | "RESERVED"
  | "SOLD"
  | "ARCHIVED"
  | "REJECTED";

export type FurnitureCondition =
  "EXCELLENT" | "VERY_GOOD" | "GOOD" | "RESTORED" | "FOR_RESTORATION";

export type Originality = "ORIGINAL" | "REPRODUCTION";
export type PriceType = "FIXED" | "OFFER";
export type ShippingMethod = "STANDARD" | "WHITE_GLOVE" | "PICKUP_ONLY";

export interface Country {
  id: string;
  name: string;
  isoCode: string;
  slug: string;
  description?: string | null;
  content?: string | null;
}

/** Ficha completa de país (Base de Conocimiento) — separada de Country,
 * que se embebe en Furniture/Profile/Store/Designer/Manufacturer. */
export interface CountryDetail {
  id: string;
  name: string;
  isoCode: string;
  slug: string;
  description: string | null;
  content: string | null;
  pieceCount: number;
  relatedDesigners: TaxonomyRef[];
  relatedManufacturers: TaxonomyRef[];
}

export interface TaxonomyRef {
  id: string;
  name: string;
  slug: string;
}

/** Presentes solo en las fichas *BySlug de la Base de Conocimiento. */
export interface RelatedContentFields {
  pieceCount?: number;
  relatedDesigners?: TaxonomyRef[];
  relatedMaterials?: TaxonomyRef[];
  relatedManufacturers?: TaxonomyRef[];
  relatedStyles?: TaxonomyRef[];
  valuationMentionCount?: number;
}

export interface Category extends RelatedContentFields {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  content?: string | null;
  parentId: string | null;
}

export interface TaxonomyTerm extends RelatedContentFields {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  content?: string | null;
}

export interface Designer extends TaxonomyTerm {
  bio: string | null;
  country: Country | null;
}

export interface Manufacturer extends TaxonomyTerm {
  country: Country | null;
}

export type TrendCategory =
  | "NEWS"
  | "MARKET"
  | "DESIGN"
  | "MATERIAL"
  | "DESIGNER"
  | "MANUFACTURER"
  | "ICONIC_PIECE";

/** Ficha ligera para la grilla de /tendencias — sin body/fuente. */
export interface TrendPreview {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: TrendCategory;
  imageUrl: string;
  imageAlt: string;
  publishedAt: string;
  material?: TaxonomyRef | null;
  woodType?: TaxonomyRef | null;
  style?: TaxonomyRef | null;
  designer?: TaxonomyRef | null;
  manufacturer?: TaxonomyRef | null;
}

/** Ficha completa para /tendencias/[slug] — incluye cuerpo y fuente. */
export interface Trend extends TrendPreview {
  body: string;
  imageCredit?: string | null;
  sourceUrl: string;
  sourceName: string;
}

export interface Decade extends RelatedContentFields {
  id: string;
  value: number;
  label: string;
  description: string | null;
  content?: string | null;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  isVerified: boolean;
  createdAt: string;
}

export interface FurnitureImage {
  id: string;
  url: string;
  altText: string | null;
  order: number;
  width: number | null;
  height: number | null;
}

export type FurnitureSort =
  | "RECENT"
  | "OLDEST"
  | "PRICE_ASC"
  | "PRICE_DESC"
  | "MOST_VIEWED"
  | "MOST_SAVED";

export interface FurnitureFilter {
  q?: string;
  storeId?: string;
  categoryIds?: string[];
  materialIds?: string[];
  woodTypeIds?: string[];
  styleIds?: string[];
  designerIds?: string[];
  manufacturerIds?: string[];
  originCountryIds?: string[];
  decades?: number[];
  conditions?: FurnitureCondition[];
  originality?: Originality[];
  priceMin?: number;
  priceMax?: number;
  locationCity?: string;
  locationRegion?: string;
  availability?: FurnitureStatus[];
  page?: number;
  perPage?: number;
}

export interface FurniturePreviewImage {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

/** Forma mínima usada en grids (explorar, categoría, diseñador, material). */
export interface FurniturePreview {
  id: string;
  title: string;
  slug: string;
  price: number | null;
  currency: string;
  decade: number | null;
  condition: FurnitureCondition | null;
  locationCity: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  primaryMaterial: string | null;
  primaryImage: FurniturePreviewImage | null;
}

export interface FurnitureConnection {
  items: FurniturePreview[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface KeyValue {
  key: string;
  value: string;
}

/** Ficha completa de tienda (perfil público) — distinta de `Store`, que es
 * la forma mínima embebida en Furniture.store. */
export interface StoreProfile {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  isVerified: boolean;
  logoUrl: string | null;
  bannerUrl: string | null;
  websiteUrl: string | null;
  socialLinks: KeyValue[];
  schedule: KeyValue[];
  locationCity: string | null;
  locationRegion: string | null;
  locationCountry: Country | null;
  ownerId: string;
  ownerUsername: string | null;
  pieceCount: number;
  followersCount: number;
  createdAt: string;
}

export interface PublicProfileStore {
  id: string;
  name: string;
  slug: string;
  isVerified: boolean;
}

export interface PublicProfile {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  country: Country | null;
  memberSince: string;
  reputation: number;
  followersCount: number;
  followingCount: number;
  listingsCount: number;
  salesCount: number;
  isFollowedByViewer: boolean;
  isOwnProfile: boolean;
  store: PublicProfileStore | null;
  pieces: FurniturePreview[];
}

export interface CollectionSummary {
  id: string;
  name: string;
  description: string | null;
  storeId: string | null;
  itemCount: number;
  items: FurniturePreview[];
  createdAt: string;
}

export type NotificationType =
  | "NEW_MESSAGE"
  | "NEW_OFFER"
  | "LISTING_APPROVED"
  | "LISTING_REJECTED"
  | "VALUATION_READY"
  | "SYSTEM"
  | "NEW_FOLLOWER"
  | "FURNITURE_FAVORITED"
  | "FURNITURE_SOLD"
  | "MODERATION_ACTION";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationConnection {
  items: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  totalPages: number;
}

export interface ConversationParticipant {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface Message {
  id: string;
  senderId: string;
  body: string;
  attachmentUrls: string[];
  isMine: boolean;
  delivered: boolean;
  read: boolean;
  createdAt: string;
}

export type ConversationStatus = "OPEN" | "CLOSED";

export interface Conversation {
  id: string;
  furniture: FurniturePreview;
  counterpart: ConversationParticipant;
  status: ConversationStatus;
  lastMessagePreview: string | null;
  unreadCount: number;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export type ReportTargetType = "FURNITURE" | "USER" | "STORE" | "MESSAGE" | "CONVERSATION";

export interface Furniture {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: FurnitureStatus;
  rejectionReason: string | null;
  category: Category | null;
  style: TaxonomyTerm | null;
  designer: Designer | null;
  manufacturer: Manufacturer | null;
  originCountry: Country | null;
  materials: TaxonomyTerm[];
  woodTypes: TaxonomyTerm[];
  condition: FurnitureCondition | null;
  conditionNotes: string | null;
  originality: Originality;
  color: string | null;
  decade: number | null;
  widthCm: number | null;
  heightCm: number | null;
  depthCm: number | null;
  weightKg: number | null;
  price: number | null;
  currency: string;
  priceType: PriceType;
  shippingMethods: ShippingMethod[];
  locationCity: string | null;
  locationRegion: string | null;
  locationCountry: Country | null;
  images: FurnitureImage[];
  store: Store;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export type ValuationRequestStatus =
  | "DRAFT"
  | "PENDING"
  | "IN_REVIEW"
  | "COMPLETED"
  | "CANCELLED";

export type ValuationObjective = "SELL" | "BUY" | "IDENTIFY" | "RESTORE";

export interface ValuationRequestImage {
  id: string;
  url: string;
  altText: string | null;
  order: number;
  width: number | null;
  height: number | null;
}

export interface ValuationComment {
  id: string;
  body: string;
  author: ConversationParticipant;
  createdAt: string;
}

export interface ValuationHistoryEntry {
  id: string;
  description: string;
  actorName: string | null;
  createdAt: string;
}

export interface ValuationReport {
  id: string;
  requestId: string;
  expert: ConversationParticipant;
  summary: string;
  probableIdentification: string | null;
  materials: TaxonomyTerm[];
  woodTypes: TaxonomyTerm[];
  style: TaxonomyTerm | null;
  decade: number | null;
  designer: Designer | null;
  manufacturer: Manufacturer | null;
  condition: FurnitureCondition | null;
  observations: string | null;
  warnings: string | null;
  estimatedValueMin: number;
  estimatedValueMax: number;
  quickSaleValue: number | null;
  idealSaleValue: number | null;
  currency: string;
  estimatedSaleTime: string | null;
  tips: string | null;
  confidenceLevel: number | null;
  pdfUrl: string | null;
  providedAt: string;
  updatedAt: string;
}

export interface ValuationRequest {
  id: string;
  title: string | null;
  description: string | null;
  category: Category | null;
  estimatedDecade: number | null;
  locationCity: string | null;
  objective: ValuationObjective | null;
  images: ValuationRequestImage[];
  serviceFee: number;
  currency: string;
  paidAt: string | null;
  status: ValuationRequestStatus;
  requester: ConversationParticipant;
  assignedExpert: ConversationParticipant | null;
  comments: ValuationComment[];
  history: ValuationHistoryEntry[];
  report: ValuationReport | null;
  createdAt: string;
  updatedAt: string;
}

export type EstateLiquidationRequestStatus =
  | "DRAFT"
  | "PENDING"
  | "IN_REVIEW"
  | "COMPLETED"
  | "CANCELLED";

export type EstateLiquidationPieceOutcome =
  | "SELL_ON_NOGAL"
  | "REFER_RESTORER"
  | "INFORM_ONLY";

export interface Restorer {
  id: string;
  name: string;
  specialty: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EstateLiquidationPieceImage {
  id: string;
  url: string;
  altText: string | null;
  order: number;
  width: number | null;
  height: number | null;
}

export interface EstateLiquidationPiece {
  id: string;
  requestId: string;
  title: string;
  description: string | null;
  category: Category | null;
  images: EstateLiquidationPieceImage[];
  outcome: EstateLiquidationPieceOutcome | null;
  condition: FurnitureCondition | null;
  expertNotes: string | null;
  estimatedValueMin: number | null;
  estimatedValueMax: number | null;
  /** null para el solicitante — Nogal actúa de intermediario, nunca se
   * expone el contacto del restaurador al cliente. */
  recommendedRestorer: Restorer | null;
  classifiedAt: string | null;
  classifiedBy: ConversationParticipant | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface EstateLiquidationComment {
  id: string;
  body: string;
  author: ConversationParticipant;
  createdAt: string;
}

export interface EstateLiquidationHistoryEntry {
  id: string;
  description: string;
  actorName: string | null;
  createdAt: string;
}

export interface EstateLiquidationRequest {
  id: string;
  contactName: string | null;
  contactPhone: string | null;
  addressLine: string | null;
  addressCity: string | null;
  addressRegion: string | null;
  visitNotes: string | null;
  pieces: EstateLiquidationPiece[];
  unitFee: number;
  totalFee: number | null;
  currency: string;
  paidAt: string | null;
  status: EstateLiquidationRequestStatus;
  requester: ConversationParticipant;
  assignedExpert: ConversationParticipant | null;
  comments: EstateLiquidationComment[];
  history: EstateLiquidationHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}
