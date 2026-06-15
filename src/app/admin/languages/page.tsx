"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  Globe, Plus, Search, Edit3, Check, X, CheckCircle, XCircle,
  Languages, Key, FileText, BookOpen, AlertTriangle,
  ChevronDown,
} from "lucide-react";

interface Language {
  code: string;
  name: string;
  native_name: string;
  rtl: boolean;
  enabled: boolean;
  is_default: boolean;
  translation_pct: number;
}

interface TranslationKey {
  key: string;
  namespace: string;
  context: string;
}

interface Translation {
  key: string;
  language: string;
  value: string;
  auto_translated: boolean;
}

const seedLanguages: Language[] = [
  { code: "en", name: "English", native_name: "English", rtl: false, enabled: true, is_default: true, translation_pct: 100 },
  { code: "fr", name: "French", native_name: "Français", rtl: false, enabled: true, is_default: false, translation_pct: 92 },
  { code: "ar", name: "Arabic", native_name: "العربية", rtl: true, enabled: true, is_default: false, translation_pct: 78 },
  { code: "hi", name: "Hindi", native_name: "हिन्दी", rtl: false, enabled: true, is_default: false, translation_pct: 65 },
  { code: "zh", name: "Chinese", native_name: "中文", rtl: false, enabled: false, is_default: false, translation_pct: 45 },
  { code: "es", name: "Spanish", native_name: "Español", rtl: false, enabled: true, is_default: false, translation_pct: 88 },
  { code: "pt", name: "Portuguese", native_name: "Português", rtl: false, enabled: true, is_default: false, translation_pct: 82 },
];

const seedKeys: TranslationKey[] = [
  { key: "home.hero.title", namespace: "homepage", context: "Hero section main headline" },
  { key: "home.hero.subtitle", namespace: "homepage", context: "Hero section sub-headline" },
  { key: "home.hero.cta", namespace: "homepage", context: "Call to action button" },
  { key: "nav.categories", namespace: "navigation", context: "Categories nav link" },
  { key: "nav.deals", namespace: "navigation", context: "Deals nav link" },
  { key: "nav.account", namespace: "navigation", context: "Account nav link" },
  { key: "product.add_to_cart", namespace: "product", context: "Add to cart button" },
  { key: "product.buy_now", namespace: "product", context: "Buy now button" },
  { key: "product.description", namespace: "product", context: "Description tab" },
  { key: "product.reviews", namespace: "product", context: "Reviews tab" },
  { key: "product.specifications", namespace: "product", context: "Specifications tab" },
  { key: "cart.title", namespace: "cart", context: "Cart page title" },
  { key: "cart.checkout", namespace: "cart", context: "Checkout button" },
  { key: "cart.empty", namespace: "cart", context: "Empty cart message" },
  { key: "checkout.shipping", namespace: "checkout", context: "Shipping section" },
  { key: "checkout.payment", namespace: "checkout", context: "Payment section" },
  { key: "checkout.review", namespace: "checkout", context: "Review order section" },
  { key: "account.profile", namespace: "account", context: "Profile page title" },
  { key: "account.orders", namespace: "account", context: "Orders list title" },
  { key: "account.wishlist", namespace: "account", context: "Wishlist page title" },
  { key: "footer.about", namespace: "footer", context: "About us link" },
  { key: "footer.contact", namespace: "footer", context: "Contact us link" },
  { key: "footer.privacy", namespace: "footer", context: "Privacy policy link" },
  { key: "search.placeholder", namespace: "search", context: "Search input placeholder" },
  { key: "search.no_results", namespace: "search", context: "No results message" },
  { key: "auth.login", namespace: "auth", context: "Login button" },
  { key: "auth.register", namespace: "auth", context: "Register button" },
  { key: "auth.logout", namespace: "auth", context: "Logout button" },
];

const seedTranslations: Record<string, Record<string, { value: string; auto: boolean }>> = {
  en: {
    "home.hero.title": { value: "Everything. Everywhere. Delivered.", auto: false },
    "home.hero.subtitle": { value: "Shop millions of products from trusted vendors", auto: false },
    "home.hero.cta": { value: "Shop Now", auto: false },
    "nav.categories": { value: "Categories", auto: false },
    "nav.deals": { value: "Today's Deals", auto: false },
    "nav.account": { value: "My Account", auto: false },
    "product.add_to_cart": { value: "Add to Cart", auto: false },
    "product.buy_now": { value: "Buy Now", auto: false },
    "product.description": { value: "Description", auto: false },
    "product.reviews": { value: "Reviews", auto: false },
    "product.specifications": { value: "Specifications", auto: false },
    "cart.title": { value: "Shopping Cart", auto: false },
    "cart.checkout": { value: "Proceed to Checkout", auto: false },
    "cart.empty": { value: "Your cart is empty", auto: false },
    "checkout.shipping": { value: "Shipping Information", auto: false },
    "checkout.payment": { value: "Payment Method", auto: false },
    "checkout.review": { value: "Review Your Order", auto: false },
    "account.profile": { value: "My Profile", auto: false },
    "account.orders": { value: "My Orders", auto: false },
    "account.wishlist": { value: "My Wishlist", auto: false },
    "footer.about": { value: "About Us", auto: false },
    "footer.contact": { value: "Contact Us", auto: false },
    "footer.privacy": { value: "Privacy Policy", auto: false },
    "search.placeholder": { value: "Search products...", auto: false },
    "search.no_results": { value: "No products found", auto: false },
    "auth.login": { value: "Login", auto: false },
    "auth.register": { value: "Create Account", auto: false },
    "auth.logout": { value: "Logout", auto: false },
  },
  fr: {
    "home.hero.title": { value: "Tout. Partout. Livré.", auto: true },
    "home.hero.subtitle": { value: "Achetez des millions de produits auprès de vendeurs de confiance", auto: true },
    "home.hero.cta": { value: "Acheter maintenant", auto: false },
    "nav.categories": { value: "Catégories", auto: false },
    "nav.deals": { value: "Offres du jour", auto: true },
    "nav.account": { value: "Mon compte", auto: false },
    "product.add_to_cart": { value: "Ajouter au panier", auto: false },
    "product.buy_now": { value: "Acheter maintenant", auto: true },
    "cart.title": { value: "Panier d'achat", auto: false },
    "cart.checkout": { value: "Commander", auto: false },
    "cart.empty": { value: "Votre panier est vide", auto: false },
    "checkout.shipping": { value: "Informations de livraison", auto: true },
    "checkout.payment": { value: "Moyen de paiement", auto: false },
    "account.profile": { value: "Mon profil", auto: false },
    "account.orders": { value: "Mes commandes", auto: false },
    "account.wishlist": { value: "Ma liste d'envies", auto: true },
    "footer.about": { value: "À propos", auto: false },
    "footer.contact": { value: "Nous contacter", auto: false },
    "search.placeholder": { value: "Rechercher des produits...", auto: true },
    "search.no_results": { value: "Aucun produit trouvé", auto: false },
    "auth.login": { value: "Connexion", auto: false },
    "auth.register": { value: "Créer un compte", auto: true },
    "auth.logout": { value: "Déconnexion", auto: false },
  },
  ar: {
    "home.hero.title": { value: "كل شيء. في كل مكان. يتم التوصيل.", auto: true },
    "home.hero.cta": { value: "تسوق الآن", auto: false },
    "nav.categories": { value: "الفئات", auto: false },
    "nav.account": { value: "حسابي", auto: false },
    "product.add_to_cart": { value: "أضف إلى السلة", auto: true },
    "cart.title": { value: "سلة التسوق", auto: false },
    "cart.checkout": { value: "إتمام الشراء", auto: true },
    "account.profile": { value: "ملفي الشخصي", auto: false },
    "account.orders": { value: "طلباتي", auto: false },
    "search.placeholder": { value: "البحث عن منتجات...", auto: true },
    "auth.login": { value: "تسجيل الدخول", auto: false },
    "auth.register": { value: "إنشاء حساب", auto: true },
  },
  hi: {
    "home.hero.title": { value: "सब कुछ। हर जगह। डिलीवर।", auto: true },
    "home.hero.cta": { value: "अभी खरीदें", auto: false },
    "nav.categories": { value: "श्रेणियाँ", auto: false },
    "product.add_to_cart": { value: "कार्ट में डालें", auto: false },
    "cart.title": { value: "शॉपिंग कार्ट", auto: false },
    "cart.checkout": { value: "चेकआउट करें", auto: true },
    "account.profile": { value: "मेरी प्रोफ़ाइल", auto: false },
    "account.orders": { value: "मेरे ऑर्डर", auto: false },
    "search.placeholder": { value: "उत्पाद खोजें...", auto: true },
    "auth.login": { value: "लॉगिन करें", auto: false },
    "auth.register": { value: "खाता बनाएं", auto: true },
  },
  es: {
    "home.hero.title": { value: "Todo. En todas partes. Entregado.", auto: true },
    "home.hero.subtitle": { value: "Compra millones de productos de vendedores confiables", auto: true },
    "home.hero.cta": { value: "Comprar ahora", auto: false },
    "nav.categories": { value: "Categorías", auto: false },
    "nav.deals": { value: "Ofertas de hoy", auto: true },
    "nav.account": { value: "Mi cuenta", auto: false },
    "product.add_to_cart": { value: "Añadir al carrito", auto: false },
    "product.buy_now": { value: "Comprar ahora", auto: false },
    "cart.title": { value: "Carrito de compras", auto: false },
    "cart.checkout": { value: "Proceder al pago", auto: false },
    "cart.empty": { value: "Tu carrito está vacío", auto: false },
    "checkout.shipping": { value: "Información de envío", auto: true },
    "checkout.payment": { value: "Método de pago", auto: false },
    "account.profile": { value: "Mi perfil", auto: false },
    "account.orders": { value: "Mis pedidos", auto: false },
    "footer.about": { value: "Sobre nosotros", auto: false },
    "footer.contact": { value: "Contáctenos", auto: false },
    "search.placeholder": { value: "Buscar productos...", auto: true },
    "search.no_results": { value: "No se encontraron productos", auto: true },
    "auth.login": { value: "Iniciar sesión", auto: false },
    "auth.register": { value: "Crear cuenta", auto: false },
  },
  pt: {
    "home.hero.title": { value: "Tudo. Em todo lugar. Entregue.", auto: true },
    "home.hero.cta": { value: "Compre agora", auto: false },
    "nav.categories": { value: "Categorias", auto: false },
    "nav.account": { value: "Minha conta", auto: false },
    "product.add_to_cart": { value: "Adicionar ao carrinho", auto: false },
    "cart.title": { value: "Carrinho de compras", auto: false },
    "cart.checkout": { value: "Finalizar compra", auto: false },
    "cart.empty": { value: "Seu carrinho está vazio", auto: false },
    "checkout.shipping": { value: "Informações de envio", auto: true },
    "account.profile": { value: "Meu perfil", auto: false },
    "account.orders": { value: "Meus pedidos", auto: false },
    "search.placeholder": { value: "Pesquisar produtos...", auto: true },
    "auth.login": { value: "Entrar", auto: false },
    "auth.register": { value: "Criar conta", auto: true },
    "auth.logout": { value: "Sair", auto: false },
  },
};

export default function LanguagesPage() {
  const [activeTab, setActiveTab] = useState<"languages" | "keys" | "translations">("languages");
  const [search, setSearch] = useState("");
  const [showAddLang, setShowAddLang] = useState(false);
  const [showAddKey, setShowAddKey] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const totalKeys = seedKeys.length;
  const enabledLangs = seedLanguages.filter((l) => l.enabled).length;
  const totalTranslated = seedLanguages.reduce((sum, l) => sum + Math.round((l.translation_pct / 100) * totalKeys), 0);
  const overallPct = Math.round((totalTranslated / (totalKeys * seedLanguages.length)) * 100);
  const missingCount = totalKeys * seedLanguages.length - totalTranslated;

  const kpis = [
    { label: "Total Languages", value: seedLanguages.length.toString(), change: `+${enabledLangs} active`, trend: "up", icon: Globe, color: "text-blue", bg: "bg-blue/10" },
    { label: "Total Keys", value: totalKeys.toString(), change: "Across all namespaces", trend: "up", icon: Key, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Translated", value: `${overallPct}%`, change: `${overallPct >= 80 ? "Good" : "Needs work"}`, trend: overallPct >= 80 ? "up" : "down", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Missing", value: missingCount.toString(), change: "Needs attention", trend: "down", icon: AlertTriangle, color: "text-red", bg: "bg-red/10" },
  ];

  const filteredKeys = seedKeys.filter((k) =>
    k.key.toLowerCase().includes(search.toLowerCase()) ||
    k.namespace.toLowerCase().includes(search.toLowerCase())
  );

  const getTranslatedCount = (code: string) => {
    const lang = seedTranslations[code];
    if (!lang) return 0;
    return Object.keys(lang).length;
  };

  return (
    <AdminShell title="Multi-Language System" subtitle="Manage translations and localized content">
      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 w-fit border border-gray-200">
        {[
          { id: "languages" as const, label: "Languages", icon: Globe },
          { id: "keys" as const, label: "Translation Keys", icon: Key },
          { id: "translations" as const, label: "Translations", icon: Languages },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-blue text-white" : "text-text-3 hover:bg-gray-50"}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon size={16} className={kpi.color} />
              </div>
              <span className={`text-xs font-medium flex items-center gap-0.5 ${kpi.trend === "up" ? "text-green-600" : "text-red"}`}>{kpi.change}</span>
            </div>
            <p className="text-lg font-bold text-text-1">{kpi.value}</p>
            <p className="text-[10px] text-text-4 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {activeTab === "languages" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="relative max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search languages..." className="w-full h-10 pl-9 pr-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue" />
            </div>
            <button onClick={() => setShowAddLang(true)} className="flex items-center gap-2 px-4 py-2 bg-blue text-white text-sm font-medium rounded-lg hover:bg-blue-600"><Plus size={14} /> Add Language</button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Code", "Language", "Native Name", "RTL", "Enabled", "Default", "Translated", ""].map((h) => (
                      <th key={h} className="text-left p-3 text-text-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {seedLanguages.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()) || l.code.includes(search)).map((lang) => (
                    <tr key={lang.code} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-3 font-mono text-xs font-semibold text-blue">{lang.code}</td>
                      <td className="p-3 font-medium text-text-1">{lang.name}</td>
                      <td className="p-3 text-text-2">{lang.native_name}</td>
                      <td className="p-3">{lang.rtl ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-text-4" />}</td>
                      <td className="p-3">{lang.enabled ? <span className="text-green-600 text-xs font-medium">Active</span> : <span className="text-text-4 text-xs">Disabled</span>}</td>
                      <td className="p-3">{lang.is_default ? <span className="px-2 py-0.5 bg-blue/10 text-blue text-[10px] font-semibold rounded-full">Default</span> : "—"}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue rounded-full" style={{ width: `${lang.translation_pct}%` }} />
                          </div>
                          <span className="text-xs text-text-4">{lang.translation_pct}%</span>
                        </div>
                      </td>
                      <td className="p-3"><button className="text-xs text-blue hover:underline">Edit</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {showAddLang && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowAddLang(false)}>
              <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
                <h3 className="font-bold text-sm mb-4">Add Language</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-text-4 block mb-1 font-medium">Language Code</label>
                    <input placeholder="e.g. de" className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue" />
                  </div>
                  <div>
                    <label className="text-xs text-text-4 block mb-1 font-medium">Language Name</label>
                    <input placeholder="e.g. German" className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue" />
                  </div>
                  <div>
                    <label className="text-xs text-text-4 block mb-1 font-medium">Native Name</label>
                    <input placeholder="e.g. Deutsch" className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue" />
                  </div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-sm text-text-2">Right-to-Left (RTL)</span>
                  </label>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="px-4 py-2 bg-blue text-white text-sm font-medium rounded-lg hover:bg-blue-600">Add Language</button>
                  <button onClick={() => setShowAddLang(false)} className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "keys" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="relative max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search keys..." className="w-full h-10 pl-9 pr-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue" />
            </div>
            <button onClick={() => setShowAddKey(true)} className="flex items-center gap-2 px-4 py-2 bg-blue text-white text-sm font-medium rounded-lg hover:bg-blue-600"><Plus size={14} /> Add Key</button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Key", "Namespace", "Context", ""].map((h) => (
                      <th key={h} className="text-left p-3 text-text-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredKeys.map((k) => (
                    <tr key={k.key} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-3 font-mono text-xs text-blue font-medium">{k.key}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-semibold rounded-full">{k.namespace}</span>
                      </td>
                      <td className="p-3 text-text-3 text-xs">{k.context}</td>
                      <td className="p-3"><button className="text-xs text-blue hover:underline">Edit</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {showAddKey && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowAddKey(false)}>
              <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
                <h3 className="font-bold text-sm mb-4">Add Translation Key</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-text-4 block mb-1 font-medium">Key</label>
                    <input placeholder="e.g. home.banner.title" className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue" />
                  </div>
                  <div>
                    <label className="text-xs text-text-4 block mb-1 font-medium">Namespace</label>
                    <select className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue">
                      <option>homepage</option>
                      <option>navigation</option>
                      <option>product</option>
                      <option>cart</option>
                      <option>checkout</option>
                      <option>account</option>
                      <option>footer</option>
                      <option>search</option>
                      <option>auth</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-text-4 block mb-1 font-medium">Context Description</label>
                    <input placeholder="e.g. Hero banner main title" className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue" />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="px-4 py-2 bg-blue text-white text-sm font-medium rounded-lg hover:bg-blue-600">Add Key</button>
                  <button onClick={() => setShowAddKey(false)} className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "translations" && (
        <div className="space-y-4">
          {/* Language Selector */}
          <div className="flex gap-2 flex-wrap">
            {seedLanguages.filter((l) => l.enabled).map((lang) => (
              <button key={lang.code} onClick={() => setSelectedLang(selectedLang === lang.code ? null : lang.code)} className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${selectedLang === lang.code ? "bg-blue text-white border-blue" : "border-gray-200 text-text-3 hover:bg-gray-50"}`}>
                {lang.native_name} ({lang.code})
              </button>
            ))}
            {!selectedLang && <span className="text-xs text-text-4 self-center">Select a language to view translations</span>}
          </div>

          {selectedLang && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-sm">Translations for {seedLanguages.find((l) => l.code === selectedLang)?.name}</h3>
                <span className="text-xs text-text-4">{getTranslatedCount(selectedLang)} / {totalKeys} keys</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["Key", "Value", "Status", ""].map((h) => (
                        <th key={h} className="text-left p-3 text-text-4 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {seedKeys.map((k) => {
                      const t = seedTranslations[selectedLang]?.[k.key];
                      const isMissing = !t;
                      return (
                        <tr key={k.key} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="p-3 font-mono text-xs text-blue font-medium">{k.key}</td>
                          <td className="p-3">
                            {editingKey === k.key ? (
                              <div className="flex items-center gap-2">
                                <input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1 h-8 px-2 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue" autoFocus />
                                <button onClick={() => { setEditingKey(null); }} className="text-green-600"><Check size={14} /></button>
                                <button onClick={() => setEditingKey(null)} className="text-text-4"><X size={14} /></button>
                              </div>
                            ) : (
                              <span className={`text-xs ${isMissing ? "text-text-4 italic" : "text-text-2"}`}>
                                {isMissing ? "— Not translated" : t.value}
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            {isMissing ? (
                              <span className="px-2 py-0.5 bg-red/10 text-red text-[10px] font-semibold rounded-full">Missing</span>
                            ) : t.auto ? (
                              <span className="px-2 py-0.5 bg-blue/10 text-blue text-[10px] font-semibold rounded-full">Auto</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-semibold rounded-full">Manual</span>
                            )}
                          </td>
                          <td className="p-3">
                            <button onClick={() => { setEditingKey(k.key); setEditValue(t?.value || ""); }} className="text-xs text-blue hover:underline">
                              {isMissing ? "Translate" : "Edit"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}
