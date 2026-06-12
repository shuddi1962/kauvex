import { registerCarrier } from "./index";
import { dhlCarrier } from "./dhl";
import { fedexCarrier } from "./fedex";
import { aramexCarrier } from "./aramex";
import { localCarrier } from "./local";

export async function registerAllCarriers() {
  await registerCarrier(dhlCarrier);
  await registerCarrier(fedexCarrier);
  await registerCarrier(aramexCarrier);
  await registerCarrier(localCarrier);
  console.log("[Shipping] All carriers registered:", ["dhl", "fedex", "aramex", "local"].join(", "));
}
