export interface Product {
  id: string;
  title: string;
  category: string;
  image: string;
  hoverImage?: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  discount?: number;
  badge?: string;
}

export interface CategoryIcon {
  id: string;
  label: string;
  icon: string;
  href: string;
}

export interface Brand {
  id: string;
  name: string;
}

export interface HeroSlide {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
  gradient: string;
  href: string;
}

export interface Vendor {
  id: string;
  name: string;
  rating: string;
  items: number;
  gradient: string;
}

export interface PromoCard {
  id: string;
  title: string;
  subtitle: string;
  theme: string;
  icon: string;
  href: string;
}