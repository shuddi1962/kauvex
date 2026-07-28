import { prisma } from "@/lib/prisma";

const SEED_COURSES = [
  {
    title: "Setting Up Your Store",
    slug: "setting-up-your-store",
    description: "Learn how to create and configure your Kauvex store from scratch, including account setup, branding, and store policies.",
    category: "Getting Started",
    level: "beginner",
    thumbnailUrl: "🏪",
    durationMinutes: 45,
    sortOrder: 1,
    lessons: [
      { title: "Creating Your Seller Account", slug: "creating-your-seller-account", content: "Walk through the seller registration process. You'll need your business details, tax information, and bank account ready. The approval process typically takes 24-48 hours.", contentType: "article", durationMinutes: 10, sortOrder: 1 },
      { title: "Store Profile & Branding", slug: "store-profile-and-branding", content: "Set up your store logo, banner, description, and social links. A complete profile increases buyer trust by 40%. Use high-resolution images that match your brand identity.", contentType: "article", durationMinutes: 12, sortOrder: 2 },
      { title: "Configuring Shipping Settings", slug: "configuring-shipping-settings", content: "Set up your shipping zones, rates, and delivery timelines. Kauvex supports both merchant-fulfilled and FBK fulfillment. Configure your domestic and international shipping preferences.", contentType: "video", videoUrl: "https://youtube.com/watch?v=ship01", durationMinutes: 15, sortOrder: 3 },
      { title: "Setting Up Payment Methods", slug: "setting-up-payment-methods", content: "Configure your payout preferences. Kauvex supports bank transfers, mobile money, and virtual accounts. Set your payout schedule to daily, weekly, or monthly.", contentType: "article", durationMinutes: 8, sortOrder: 4 },
    ],
  },
  {
    title: "Product Photography",
    slug: "product-photography",
    description: "Master product photography techniques to create compelling listing images that drive conversions and build buyer confidence.",
    category: "Catalog Management",
    level: "beginner",
    thumbnailUrl: "📸",
    durationMinutes: 55,
    sortOrder: 2,
    lessons: [
      { title: "Essential Photography Equipment", slug: "essential-photography-equipment", content: "You don't need a professional studio. A smartphone with 12MP+ camera, a lightbox ($30-50), and a tripod are sufficient for most products. White background works best for listings.", contentType: "article", durationMinutes: 10, sortOrder: 1 },
      { title: "Lighting Techniques for Products", slug: "lighting-techniques-for-products", content: "Natural diffused light from a north-facing window is ideal. For consistent results, use a lightbox with LED panels. Avoid direct flash which creates harsh shadows. Position lights at 45-degree angles.", contentType: "video", videoUrl: "https://youtube.com/watch?v=photo01", durationMinutes: 15, sortOrder: 2 },
      { title: "Composition & Styling Tips", slug: "composition-and-styling-tips", content: "Follow the rule of thirds. Show the product from multiple angles (front, back, side, detail). Include a scale reference for size. Lifestyle shots showing the product in use increase conversion by 30%.", contentType: "article", durationMinutes: 12, sortOrder: 3 },
      { title: "Editing & Optimizing Images", slug: "editing-and-optimizing-images", content: "Crop to square (1:1 ratio) for best display. Adjust brightness/contrast. Remove backgrounds with tools like Remove.bg. Compress to under 500KB without visible quality loss for fast loading.", contentType: "article", durationMinutes: 10, sortOrder: 4 },
    ],
  },
  {
    title: "Writing Product Titles",
    slug: "writing-product-titles",
    description: "Craft search-optimized product titles that rank well in search results and compel buyers to click on your listings.",
    category: "Catalog Management",
    level: "beginner",
    thumbnailUrl: "✏️",
    durationMinutes: 35,
    sortOrder: 3,
    lessons: [
      { title: "Title Structure Formula", slug: "title-structure-formula", content: "Use this proven formula: Brand + Product Type + Key Features + Size/Quantity + Color. Example: 'Apple iPhone 14 Pro Max 256GB - Deep Purple - Unlocked'. Keep under 150 characters.", contentType: "article", durationMinutes: 10, sortOrder: 1 },
      { title: "Keyword Research for Titles", slug: "keyword-research-for-titles", content: "Use Kauvex search autocomplete to find popular terms. Include one primary keyword and 2-3 secondary keywords. Avoid keyword stuffing - titles must read naturally. Analyze top competitor titles for inspiration.", contentType: "article", durationMinutes: 8, sortOrder: 2 },
      { title: "Common Title Mistakes to Avoid", slug: "common-title-mistakes-to-avoid", content: "Avoid ALL CAPS, excessive punctuation (!!!), and irrelevant keywords. Don't include pricing or promotional text in titles. Never use misleading information - it leads to returns and negative reviews.", contentType: "article", durationMinutes: 7, sortOrder: 3 },
    ],
  },
  {
    title: "Descriptions That Sell",
    slug: "descriptions-that-sell",
    description: "Write persuasive product descriptions that highlight benefits, overcome objections, and drive purchasing decisions.",
    category: "Catalog Management",
    level: "beginner",
    thumbnailUrl: "📝",
    durationMinutes: 40,
    sortOrder: 4,
    lessons: [
      { title: "Features vs Benefits", slug: "features-vs-benefits", content: "Features describe what a product IS. Benefits describe what it DOES for the customer. Always lead with benefits. Example: Feature - '10,000mAh battery'. Benefit - 'Charge your phone 3 times on a single charge.'", contentType: "article", durationMinutes: 12, sortOrder: 1 },
      { title: "The AIDA Framework", slug: "the-aida-framework", content: "Attention: Grab with a strong opening. Interest: Build with compelling details. Desire: Create emotional connection with benefits. Action: Clear call-to-action. Use short paragraphs and bullet points for scannability.", contentType: "article", durationMinutes: 15, sortOrder: 2 },
      { title: "Using Social Proof", slug: "using-social-proof", content: "Include customer testimonials, ratings, and usage statistics. Mention number of units sold. Highlight awards or certifications. Social proof reduces purchase anxiety and increases conversion rates.", contentType: "video", videoUrl: "https://youtube.com/watch?v=desc01", durationMinutes: 13, sortOrder: 3 },
    ],
  },
  {
    title: "Pricing Strategies",
    slug: "pricing-strategies",
    description: "Develop effective pricing strategies that maximize profits while remaining competitive in the Kauvex marketplace.",
    category: "Catalog Management",
    level: "beginner",
    thumbnailUrl: "💰",
    durationMinutes: 50,
    sortOrder: 5,
    lessons: [
      { title: "Cost-Based Pricing", slug: "cost-based-pricing", content: "Calculate your total costs: product cost + shipping + Kauvex fees + packaging + marketing. Add your desired profit margin (typically 20-40%). Use the Kauvex fee calculator to estimate total selling costs.", contentType: "article", durationMinutes: 12, sortOrder: 1 },
      { title: "Competitive Analysis", slug: "competitive-analysis", content: "Research competitor pricing for similar products. Consider your unique value proposition. Don't engage in race-to-the-bottom pricing. Differentiate on quality, service, or packaging instead.", contentType: "article", durationMinutes: 10, sortOrder: 2 },
      { title: "Psychological Pricing Tactics", slug: "psychological-pricing-tactics", content: "Use charm pricing ($19.99 vs $20). Bundle products for perceived value. Anchor with a higher-priced option. Limited-time discounts create urgency. Test different price points to find the sweet spot.", contentType: "video", videoUrl: "https://youtube.com/watch?v=price01", durationMinutes: 15, sortOrder: 3 },
      { title: "Promotional Pricing & Sales", slug: "promotional-pricing-and-sales", content: "Plan seasonal sales around major holidays. Use coupon codes for email marketing. Lightning deals create urgency. Loss leaders can drive traffic to higher-margin items. Track promotion ROI carefully.", contentType: "article", durationMinutes: 13, sortOrder: 4 },
    ],
  },
  {
    title: "Kauvex Ads Guide",
    slug: "kauvex-ads-guide",
    description: "Master Kauvex advertising to drive targeted traffic to your listings and maximize your return on ad spend.",
    category: "Advertising",
    level: "intermediate",
    thumbnailUrl: "📢",
    durationMinutes: 80,
    sortOrder: 6,
    lessons: [
      { title: "Campaign Types Overview", slug: "campaign-types-overview", content: "Sponsored Products: Pay-per-click ads in search results. Sponsored Brands: Brand awareness ads with multiple products. Sponsored Display: Retargeting ads for previous visitors. Start with Sponsored Products for direct ROI.", contentType: "article", durationMinutes: 18, sortOrder: 1 },
      { title: "Keyword Targeting Strategies", slug: "keyword-targeting-strategies", content: "Use broad match for discovery, phrase match for relevance, exact match for high-intent. Negative keywords prevent wasted spend. Run automatic campaigns to discover converting keywords, then move them to manual.", contentType: "video", videoUrl: "https://youtube.com/watch?v=ads01", durationMinutes: 22, sortOrder: 2 },
      { title: "Bid Optimization", slug: "bid-optimization", content: "Start with suggested bids. Use dynamic bidding (down only) for new campaigns. Adjust bids based on placement (top of search bid higher). Set daily budgets at 2x your target cost-per-click.", contentType: "article", durationMinutes: 15, sortOrder: 3 },
      { title: "Campaign Analytics", slug: "campaign-analytics", content: "Monitor ACoS (Advertising Cost of Sale) daily. Target ACoS of 20-30% for established products. ROAS of 3x+ is healthy. Pause keywords with 20+ clicks and zero conversions after 2 weeks.", contentType: "article", durationMinutes: 15, sortOrder: 4 },
      { title: "Retargeting & Display Ads", slug: "retargeting-and-display-ads", content: "Retarget visitors who viewed your product but didn't purchase. Display ads appear on and off Kauvex. Use lifestyle imagery in display creative. Set frequency caps to avoid ad fatigue.", contentType: "article", durationMinutes: 10, sortOrder: 5 },
    ],
  },
  {
    title: "Analytics Deep Dive",
    slug: "analytics-deep-dive",
    description: "Learn to interpret Kauvex analytics dashboards and use data-driven insights to grow your sales and optimize operations.",
    category: "Analytics & Reports",
    level: "intermediate",
    thumbnailUrl: "📊",
    durationMinutes: 70,
    sortOrder: 7,
    lessons: [
      { title: "Dashboard Overview", slug: "dashboard-overview", content: "Understand key metrics: Impressions, Clicks, CTR (Click-Through Rate), Conversion Rate, ACoS, ROAS, and Session Volume. Set up weekly review cadence. Export data for deeper analysis in spreadsheets.", contentType: "article", durationMinutes: 15, sortOrder: 1 },
      { title: "Sales & Revenue Analytics", slug: "sales-and-revenue-analytics", content: "Track revenue by product, category, and time period. Analyze sales velocity - how quickly products sell. Identify seasonal patterns. Use the comparison tool to benchmark against previous periods.", contentType: "article", durationMinutes: 18, sortOrder: 2 },
      { title: "Traffic Sources Analysis", slug: "traffic-sources-analysis", content: "Understand where your traffic comes from: organic search, paid ads, direct visits, social media, and external referrals. Optimize spend toward highest-converting channels. Improve SEO for organic growth.", contentType: "video", videoUrl: "https://youtube.com/watch?v=analytics01", durationMinutes: 20, sortOrder: 3 },
      { title: "Inventory Performance", slug: "inventory-performance", content: "Analyze sell-through rate, excess inventory, and stockout frequency. Use the Inventory Performance Index (IPI) score. Set reorder points based on lead time and sales velocity. Avoid both stockouts and overstock.", contentType: "article", durationMinutes: 17, sortOrder: 4 },
    ],
  },
  {
    title: "Inventory Management",
    slug: "inventory-management",
    description: "Optimize your inventory levels with forecasting, replenishment strategies, and efficient warehouse organization.",
    category: "Order Fulfillment",
    level: "intermediate",
    thumbnailUrl: "📦",
    durationMinutes: 60,
    sortOrder: 8,
    lessons: [
      { title: "Inventory Planning Basics", slug: "inventory-planning-basics", content: "Calculate safety stock using lead time and demand variability. Set reorder points. Use ABC analysis: A-items (20% of SKUs, 80% of revenue) get most attention. Review inventory weekly.", contentType: "article", durationMinutes: 15, sortOrder: 1 },
      { title: "Demand Forecasting", slug: "demand-forecasting", content: "Use historical sales data (90 days minimum). Account for seasonality and trends. Factor in promotions and external events. Start simple with moving averages, then graduate to more sophisticated models.", contentType: "video", videoUrl: "https://youtube.com/watch?v=inventory01", durationMinutes: 18, sortOrder: 2 },
      { title: "FBK Inventory Management", slug: "fbk-inventory-management", content: "Ship inventory to Kauvex fulfillment centers. Monitor inbound receiving status. Set replenishment alerts. Avoid long-term storage fees by managing aging inventory. Use removal orders for unsold stock.", contentType: "article", durationMinutes: 15, sortOrder: 3 },
      { title: "Handling Returns & Unsold Stock", slug: "handling-returns-and-unsold-stock", content: "Establish a returns processing workflow. Grade returned items (like-new, used, damaged). Create liquidation strategies for unsold inventory. Consider outlet deals or donations for tax benefits.", contentType: "article", durationMinutes: 12, sortOrder: 4 },
    ],
  },
  {
    title: "Review Management",
    slug: "review-management",
    description: "Build a positive reputation through proactive review management and exceptional customer service that earns 5-star ratings.",
    category: "Marketing & SEO",
    level: "intermediate",
    thumbnailUrl: "⭐",
    durationMinutes: 45,
    sortOrder: 9,
    lessons: [
      { title: "Requesting Reviews Ethically", slug: "requesting-reviews-ethically", content: "Use the Kauvex Request a Review button (one-time per order). Never offer incentives for positive reviews. Never ask customers to remove negative reviews. Focus on earning reviews through great products and service.", contentType: "article", durationMinutes: 10, sortOrder: 1 },
      { title: "Handling Negative Reviews", slug: "handling-negative-reviews", content: "Respond professionally within 24 hours. Address the specific concern. Offer a solution publicly, then take details offline. Never argue or blame the customer. A well-handled complaint can win loyal customers.", contentType: "video", videoUrl: "https://youtube.com/watch?v=review01", durationMinutes: 15, sortOrder: 2 },
      { title: "Using Feedback to Improve", slug: "using-feedback-to-improve", content: "Analyze review patterns to identify product or service issues. Common complaints about packaging, shipping time, or product quality indicate systemic problems. Implement changes and update listings to address concerns.", contentType: "article", durationMinutes: 12, sortOrder: 3 },
    ],
  },
  {
    title: "International Selling",
    slug: "international-selling",
    description: "Expand your business globally by selling across Kauvex international marketplaces and navigating cross-border commerce.",
    category: "Marketing & SEO",
    level: "advanced",
    thumbnailUrl: "🌍",
    durationMinutes: 75,
    sortOrder: 10,
    lessons: [
      { title: "International Marketplace Overview", slug: "international-marketplace-overview", content: "Kauvex operates in 15 countries including UK, Canada, Australia, UAE, Nigeria, and more. Each marketplace has unique customer preferences, regulations, and competitive landscapes. Start with English-speaking markets.", contentType: "article", durationMinutes: 18, sortOrder: 1 },
      { title: "Cross-Border Logistics", slug: "cross-border-logistics", content: "Use Kauvex Global Logistics for simplified international shipping. Understanding Incoterms (DDP, DAP, FOB). Customs documentation requirements. Calculate landed costs including duties and taxes for each market.", contentType: "video", videoUrl: "https://youtube.com/watch?v=global01", durationMinutes: 22, sortOrder: 2 },
      { title: "Localization Best Practices", slug: "localization-best-practices", content: "Translate listings professionally - never use machine translation alone. Adapt pricing to local purchasing power. Adjust product sizing (US vs EU vs UK sizing). Respect local cultural sensitivities in imagery.", contentType: "article", durationMinutes: 20, sortOrder: 3 },
      { title: "International Pricing & Currency", slug: "international-pricing-and-currency", content: "Set market-specific prices considering exchange rates, local competition, and purchasing power. Use Kauvex's automatic currency conversion or set manual prices per marketplace. Consider VAT/GST implications.", contentType: "article", durationMinutes: 15, sortOrder: 4 },
    ],
  },
  {
    title: "Building Your Brand",
    slug: "building-your-brand",
    description: "Create a distinctive brand identity on Kauvex that builds customer loyalty and justifies premium pricing.",
    category: "Marketing & SEO",
    level: "advanced",
    thumbnailUrl: "🏷️",
    durationMinutes: 65,
    sortOrder: 11,
    lessons: [
      { title: "Brand Identity Fundamentals", slug: "brand-identity-fundamentals", content: "Define your brand mission, values, and personality. Create consistent visual identity (logo, colors, fonts). Your brand should communicate what makes you unique. Every touchpoint should reinforce your brand story.", contentType: "article", durationMinutes: 18, sortOrder: 1 },
      { title: "Brand Registry Program", slug: "brand-registry-program", content: "Enroll in Kauvex Brand Registry to protect your intellectual property. Benefits include A+ Content, Sponsored Brands ads, Brand Analytics, and enhanced control over product listings with your brand name.", contentType: "video", videoUrl: "https://youtube.com/watch?v=brand01", durationMinutes: 22, sortOrder: 2 },
      { title: "A+ Content Creation", slug: "a-plus-content-creation", content: "Use A+ Content modules to create rich product descriptions with enhanced images, comparison charts, and brand storytelling. A+ Content can increase conversion rates by 5-15%. Use the module builder in Seller Central.", contentType: "article", durationMinutes: 15, sortOrder: 3 },
      { title: "Brand Protection & Enforcement", slug: "brand-protection-and-enforcement", content: "Monitor for counterfeit listings and policy violations. Use Project Zero for auto-removals. Report violations through the Brand Registry portal. Build a loyal customer base through consistent quality and service.", contentType: "article", durationMinutes: 10, sortOrder: 4 },
    ],
  },
  {
    title: "B2B Selling",
    slug: "b2b-selling",
    description: "Tap into the B2B market on Kauvex by setting up wholesale pricing, volume tiers, and business customer management.",
    category: "Store Builder",
    level: "advanced",
    thumbnailUrl: "🤝",
    durationMinutes: 60,
    sortOrder: 12,
    lessons: [
      { title: "Setting Up B2B Central", slug: "setting-up-b2b-central", content: "Access B2B Central from your vendor dashboard. Configure business pricing, quantity discounts, and payment terms. Set minimum order quantities. Create a separate B2B catalog from your retail listings.", contentType: "article", durationMinutes: 15, sortOrder: 1 },
      { title: "Volume Tier Pricing", slug: "volume-tier-pricing", content: "Set up tiered pricing based on quantity: e.g., 10+ units = 5% off, 50+ units = 10% off, 100+ units = 15% off. Consider your margin structure. Offer free shipping for B2B orders above a threshold.", contentType: "video", videoUrl: "https://youtube.com/watch?v=b2b01", durationMinutes: 18, sortOrder: 2 },
      { title: "Managing Business Customers", slug: "managing-business-customers", content: "Review business customer applications. Set custom pricing for key accounts. Offer dedicated support. Build long-term relationships through reliable fulfillment and communication.", contentType: "article", durationMinutes: 15, sortOrder: 3 },
      { title: "B2B Quote System", slug: "b2b-quote-system", content: "Respond to quote requests within 24 hours. Provide competitive pricing for bulk orders. Include delivery timelines and payment terms in quotes. Convert quotes to orders seamlessly through the platform.", contentType: "article", durationMinutes: 12, sortOrder: 4 },
    ],
  },
];

const SEED_QUIZZES: Record<string, Array<{ question: string; options: Record<string, string>; correctAnswer: string; sortOrder: number }>> = {
  "title-structure-formula": [
    {
      question: "What is the maximum recommended character length for a product title?",
      options: { A: "100 characters", B: "150 characters", C: "200 characters", D: "250 characters" },
      correctAnswer: "B",
      sortOrder: 1,
    },
    {
      question: "Which of the following is the correct title structure formula?",
      options: { A: "Color + Size + Product Type + Brand", B: "Brand + Product Type + Key Features + Size/Quantity + Color", C: "Product Type + Price + Brand + Color", D: "Brand + Color + Size + Price" },
      correctAnswer: "B",
      sortOrder: 2,
    },
  ],
  "features-vs-benefits": [
    {
      question: "What is a 'benefit' in product descriptions?",
      options: { A: "What the product IS", B: "What the product DOES for the customer", C: "What the product costs", D: "What the product looks like" },
      correctAnswer: "B",
      sortOrder: 1,
    },
  ],
  "campaign-types-overview": [
    {
      question: "Which ad type is recommended for beginners who want direct ROI?",
      options: { A: "Sponsored Brands", B: "Sponsored Display", C: "Sponsored Products", D: "Video Ads" },
      correctAnswer: "C",
      sortOrder: 1,
    },
    {
      question: "What does ACoS stand for?",
      options: { A: "Average Cost of Sales", B: "Advertising Cost of Sale", C: "Actual Cost of Shipping", D: "Ad Conversion Score" },
      correctAnswer: "B",
      sortOrder: 2,
    },
  ],
};

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function seedUniversityData() {
  let coursesCreated = 0;
  let lessonsCreated = 0;
  let quizzesCreated = 0;

  for (const courseData of SEED_COURSES) {
    const existingCourse = await prisma.uniCourse.findUnique({
      where: { slug: courseData.slug },
    });

    if (existingCourse) continue;

    const totalDuration = courseData.lessons.reduce((sum, l) => sum + l.durationMinutes, 0);

    const course = await prisma.uniCourse.create({
      data: {
        title: courseData.title,
        slug: courseData.slug,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        thumbnailUrl: courseData.thumbnailUrl,
        durationMinutes: totalDuration,
        lessonCount: courseData.lessons.length,
        sortOrder: courseData.sortOrder,
      },
    });
    coursesCreated++;

    for (const lessonData of courseData.lessons) {
      const lesson = await prisma.uniLesson.create({
        data: {
          courseId: course.id,
          title: lessonData.title,
          slug: lessonData.slug,
          content: lessonData.content,
          videoUrl: lessonData.videoUrl || null,
          contentType: lessonData.contentType,
          durationMinutes: lessonData.durationMinutes,
          sortOrder: lessonData.sortOrder,
        },
      });
      lessonsCreated++;

      const courseSlug = slugify(lessonData.title);
      const quizzes = SEED_QUIZZES[lessonData.slug] || SEED_QUIZZES[courseSlug];
      if (quizzes) {
        for (const quizData of quizzes) {
          await prisma.uniQuiz.create({
            data: {
              lessonId: lesson.id,
              question: quizData.question,
              options: quizData.options,
              correctAnswer: quizData.correctAnswer,
              sortOrder: quizData.sortOrder,
            },
          });
          quizzesCreated++;
        }
      }
    }
  }

  return { coursesCreated, lessonsCreated, quizzesCreated };
}
