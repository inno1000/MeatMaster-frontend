import type { AppIcon } from "@/lib/icon-types";
import { iconKey, iconSearch, iconScale } from "@/lib/icons";
import { materialIcon } from "@/lib/material-icon";

const iconMail = materialIcon("mail");
const iconCalendar = materialIcon("calendar_today");
const iconPhone = materialIcon("call");
const iconPerson = materialIcon("person");
const iconNotes = materialIcon("notes");
const iconLabel = materialIcon("label");
const iconTag = materialIcon("tag");
const iconLocation = materialIcon("location_on");
const iconCity = materialIcon("location_city");
const iconNumbers = materialIcon("numbers");
const iconPayments = materialIcon("payments");
const iconInventory = materialIcon("inventory_2");
const iconDescription = materialIcon("description");
const iconStore = materialIcon("storefront");
const iconEdit = materialIcon("edit");
const iconList = materialIcon("list");
const iconRole = materialIcon("badge");
const iconSupplier = materialIcon("local_shipping");
const iconFilter = materialIcon("tune");
const iconPeriod = materialIcon("date_range");
const iconStatus = materialIcon("flag");

function fieldKey(id?: string, name?: string): string {
  return `${id ?? ""} ${name ?? ""}`.toLowerCase();
}

export type FieldIconContext = {
  id?: string;
  name?: string;
  prefixIcon?: AppIcon | null;
  showPrefixIcon?: boolean;
};

export function resolveInputIcon(
  ctx: FieldIconContext & { type?: string },
): AppIcon | null {
  if (ctx.showPrefixIcon === false) return null;
  if (ctx.prefixIcon) return ctx.prefixIcon;

  const hay = fieldKey(ctx.id, ctx.name);
  const type = (ctx.type ?? "text").toLowerCase();

  if (type === "search" || hay.includes("search")) return iconSearch;
  if (type === "email" || hay.includes("email")) return iconMail;
  if (type === "password") return iconKey;
  if (type === "date" || hay.includes("date")) return iconCalendar;
  if (
    type === "tel" ||
    hay.includes("tel") ||
    hay.includes("phone") ||
    hay.includes("telephone")
  ) {
    return iconPhone;
  }
  if (
    hay.includes("notes") ||
    hay.includes("reason") ||
    hay.includes("motif") ||
    hay.includes("comment")
  ) {
    return iconNotes;
  }
  if (hay.includes("tag") || hay.includes("numero")) return iconLabel;
  if (hay.includes("reference")) return iconTag;
  if (
    hay.includes("adresse") ||
    hay.includes("address") ||
    hay.includes("delivery")
  ) {
    return iconLocation;
  }
  if (hay.includes("ville") || hay.includes("city")) return iconCity;
  if (
    hay.includes("montant") ||
    hay.includes("amount") ||
    hay.includes("prix") ||
    hay.includes("versement")
  ) {
    return iconPayments;
  }
  if (
    hay.includes("quantite") ||
    hay.includes("qty") ||
    hay.includes("poids") ||
    hay.includes("weight")
  ) {
    return iconScale;
  }
  if (
    hay.includes("stock") ||
    hay.includes("produit") ||
    hay.includes("product") ||
    hay.includes("meat") ||
    hay.includes("viande")
  ) {
    return iconInventory;
  }
  if (
    hay.includes("boucherie") ||
    hay.includes("butchery") ||
    hay.includes("boutique")
  ) {
    return iconStore;
  }
  if (
    hay.includes("nom") ||
    hay.includes("name") ||
    hay.includes("contact") ||
    hay.includes("firstname") ||
    hay.includes("lastname")
  ) {
    return iconPerson;
  }
  if (type === "number" || hay.includes("number")) return iconNumbers;

  return iconEdit;
}

export function resolveSelectIcon(ctx: FieldIconContext): AppIcon | null {
  if (ctx.showPrefixIcon === false) return null;
  if (ctx.prefixIcon) return ctx.prefixIcon;

  const hay = fieldKey(ctx.id, ctx.name);

  if (hay.includes("role")) return iconRole;
  if (hay.includes("fournisseur") || hay.includes("supplier")) return iconSupplier;
  if (hay.includes("boucherie") || hay.includes("butchery")) return iconStore;
  if (
    hay.includes("stock") ||
    hay.includes("produit") ||
    hay.includes("product") ||
    hay.includes("viande") ||
    hay.includes("meat")
  ) {
    return iconInventory;
  }
  if (hay.includes("periode") || hay.includes("period")) return iconPeriod;
  if (
    hay.includes("statut") ||
    hay.includes("status") ||
    hay.includes("type") && !hay.includes("meat")
  ) {
    return iconStatus;
  }
  if (hay.includes("mov") || hay.includes("mode") || hay.includes("paiement")) {
    return iconFilter;
  }

  return iconList;
}
