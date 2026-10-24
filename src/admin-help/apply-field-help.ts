import type { Core } from "@strapi/strapi";
import { FIELD_HELP } from "./field-help";

/**
 * Writes the help texts of ./field-help.ts into the Content Manager view
 * configuration (stored in strapi_core_store_settings). Only `description`
 * and `placeholder` are touched; labels, layouts and everything else editors
 * may have configured stay as they are.
 *
 * Disable with ADMIN_FIELD_HELP=false.
 */
export async function applyFieldHelp(strapi: Core.Strapi) {
  if (process.env.ADMIN_FIELD_HELP === "false") return;

  const store = strapi.store({ type: "plugin", name: "content_manager" });
  let updated = 0;

  for (const [uid, fields] of Object.entries(FIELD_HELP)) {
    const kind = uid.startsWith("api::") ? "content_types" : "components";
    const key = `configuration_${kind}::${uid}`;
    try {
      const conf: any = await store.get({ key });
      if (!conf?.metadatas) continue;

      let changed = false;
      for (const [field, help] of Object.entries(fields)) {
        const edit = conf.metadatas[field]?.edit;
        if (!edit) continue;
        for (const prop of ["description", "placeholder"] as const) {
          if (help[prop] !== undefined && edit[prop] !== help[prop]) {
            edit[prop] = help[prop];
            changed = true;
          }
        }
      }
      if (changed) {
        await store.set({ key, value: conf });
        updated++;
      }
    } catch (e) {
      strapi.log.warn(`[field-help] could not update ${uid}: ${(e as Error).message}`);
    }
  }

  if (updated) strapi.log.info(`[field-help] admin help texts updated for ${updated} types/components`);
}
