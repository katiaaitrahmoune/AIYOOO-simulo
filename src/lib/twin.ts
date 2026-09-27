export type TwinProfile = {
  industry: string;
  company: string;
  email: string;
  employees: string;
  revenue: string;
  erp: string;
  website: string;
  locations: string;
  costDriver: string;
  goal: string;
};

export const defaultProfile: TwinProfile = {
  industry: "Manufacturing",
  company: "Northbay Manufacturing",
  email: "ops@northbay.com",
  employees: "2,400",
  revenue: "$640M",
  erp: "SAP S/4HANA",
  website: "northbay.com",
  locations: "7",
  costDriver: "Raw material logistics",
  goal: "Cut unplanned downtime by a third",
};

const KEY = "simulo:twin";

export function saveProfile(p: TwinProfile) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function loadProfile(): TwinProfile {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) return { ...defaultProfile, ...(JSON.parse(raw) as Partial<TwinProfile>) };
  } catch {
    /* ignore */
  }
  return defaultProfile;
}
