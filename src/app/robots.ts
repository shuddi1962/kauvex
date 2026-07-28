import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/shop", "/deals", "/brands", "/blog", "/stores", "/product/", "/category/"],
        disallow: ["/admin/", "/vendor/", "/api/", "/account/", "/checkout/", "/cart/", "/warehouse/", "/logistics/", "/partners/", "/manufacturers/dashboard/", "/wholesale/dashboard/", "/supplier/", "/express/dashboard/"],
      },
    ],
    sitemap: "https://kauvex.com/sitemap.xml",
  };
}