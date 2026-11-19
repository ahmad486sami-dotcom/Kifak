import Constants from "expo-constants";
import Purchases, { PurchasesPackage, LOG_LEVEL } from "react-native-purchases";

/**
 * One subscription covers both partners: the payer's profile gets premium_until
 * via the billing webhook, and `has_access()` checks both members of the couple.
 * The 7-day free trial is set as the introductory offer on the monthly product
 * in App Store Connect.
 */
export const ENTITLEMENT = "couple";
const key = (Constants.expoConfig?.extra as any)?.billingIosKey as string | undefined;
let configured = false;

export async function initBilling(userId: string) {
  if (!key) return;
  try {
    if (!configured) {
      Purchases.setLogLevel(LOG_LEVEL.WARN);
      Purchases.configure({ apiKey: key, appUserID: userId });
      configured = true;
    } else {
      await Purchases.logIn(userId);
    }
  } catch {}
}

export async function hasLocalEntitlement(): Promise<boolean> {
  if (!configured) return false;
  try {
    const info = await Purchases.getCustomerInfo();
    return !!info.entitlements.active[ENTITLEMENT];
  } catch {
    return false;
  }
}

export async function getMonthlyPackage(): Promise<PurchasesPackage | null> {
  if (!configured) return null;
  try {
    const o = await Purchases.getOfferings();
    return o.current?.monthly ?? o.current?.availablePackages[0] ?? null;
  } catch {
    return null;
  }
}

export async function buy(pkg: PurchasesPackage): Promise<boolean> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return !!customerInfo.entitlements.active[ENTITLEMENT];
  } catch (e: any) {
    if (e?.userCancelled) return false;
    throw e;
  }
}

export async function restore(): Promise<boolean> {
  if (!configured) return false;
  const info = await Purchases.restorePurchases();
  return !!info.entitlements.active[ENTITLEMENT];
}

export async function logOutBilling() {
  if (!configured) return;
  try { await Purchases.logOut(); } catch {}
}
