/**
 * Fourthwall merch. Every store link lives in this file.
 * SHOP_URL is the storefront; each product URL hangs off it.
 */
export const SHOP_URL = "https://the-shirtless-handyman-shop.fourthwall.com";

export const PRODUCTS = [
  {
    slug: "tattoo-torso-tank",
    name: "Tattoo Torso Muscle Tank",
    price: "$31.99",
    kind: "Muscle tank",
    detail: "For anyone who's had a NOLA shower redone by the shirtless guy, or wants one.",
    image: "/merch/tattoo-torso-tank.webp",
    alt: "Ryan wearing the Tattoo Torso Muscle Tank: a black tank printed with an orange illustrated torso, sacred heart, stars, and wings",
    url: `${SHOP_URL}/products/shirtless-handyman-tattoo-torso-muscle-tank`,
  },
  {
    slug: "chest-logo-tank",
    name: "Chest Logo Muscle Tank",
    price: "$31.99",
    kind: "Muscle tank",
    detail: "The roundel. Drill in one hand, NOLA across the bottom.",
    image: "/merch/chest-logo-tank.webp",
    alt: "Ryan wearing the Chest Logo Muscle Tank: a black tank with the circular Shirtless Handyman NOLA logo",
    url: `${SHOP_URL}/products/shirtless-handyman-chest-logo-muscle-tank`,
  },
  {
    slug: "fake-abs-tank",
    name: "Fake Abs Muscle Tank",
    price: "$31.99",
    kind: "Muscle tank",
    detail: "Abs, illustrated. The real work is still the plaster.",
    image: "/merch/fake-abs-tank.webp",
    alt: "Ryan wearing the Fake Abs Muscle Tank: a black tank with a line-drawn six-pack and a small chest logo",
    url: `${SHOP_URL}/products/shirtless-handyman-fake-abs-muscle-tank`,
  },
  {
    slug: "shirtless-handyman-cap",
    name: "Shirtless Handyman Snapback",
    price: "$31.99",
    kind: "Snapback cap",
    detail: "The mascot up front. Seen at walkthroughs, pour days, and Mardi Gras.",
    image: "/merch/shirtless-handyman-cap.webp",
    alt: "Ryan wearing the white Shirtless Handyman snapback cap, mascot on the front panel",
    url: `${SHOP_URL}/products/shirtless-handyman-fitted-cap`,
  },
];
