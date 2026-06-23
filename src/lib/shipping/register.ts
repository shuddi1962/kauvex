import { registerCarrier } from "./index";
import { dhlCarrier } from "./dhl";
import { fedexCarrier } from "./fedex";
import { aramexCarrier } from "./aramex";
import { localCarrier } from "./local";
import { dhlInternationalCarrier } from "./dhl-express-international";
import { fedexInternationalCarrier } from "./fedex-international";
import { aramexInternationalCarrier } from "./aramex-international";
import { freightForwarderCarrier } from "./freight-forwarder";
import { gigCarrier } from "./gig";
import { kwikCarrier } from "./kwik";

export async function registerAllCarriers() {
  await registerCarrier(dhlCarrier);
  await registerCarrier(fedexCarrier);
  await registerCarrier(aramexCarrier);
  await registerCarrier(localCarrier);
  await registerCarrier(dhlInternationalCarrier);
  await registerCarrier(fedexInternationalCarrier);
  await registerCarrier(aramexInternationalCarrier);
  await registerCarrier(freightForwarderCarrier);
  await registerCarrier(gigCarrier);
  await registerCarrier(kwikCarrier);
  console.log("[Shipping] All carriers registered:", [
    "dhl", "fedex", "aramex", "local",
    "dhl-international", "fedex-international", "aramex-international",
    "freight-forwarder", "gig", "kwik",
  ].join(", "));
}
