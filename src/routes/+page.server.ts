import { superValidate } from "sveltekit-superforms/server";
import { formSchema, formSchemaAddProfile, formSchemaSearch } from "../forms/schema";
import type { Actions, ServerLoad } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import db from "$lib/server/db";
// import { env } from '$env/dynamic/private';

export const load: ServerLoad = async () => {
  return {
    generate: superValidate(formSchema),
    search: superValidate(formSchemaSearch),
    profiles: superValidate(formSchemaAddProfile),
  };
};

export const actions: Actions = {
  generate: async (event) => {
    const form = await superValidate(event, formSchema);
    if (!form.valid) {
      return fail(400, {
        form
      });
    }
    
    return {
      form,
    };
  },
  search: async (event) => {
    console.log('search');

    const form = await superValidate(event, formSchemaSearch);
    if (!form.valid) {
      return fail(400, {
        form
      });
    }
    
    return {
      form,
    };
  },
  profiles: async (event) => {
    const form = await superValidate(event, formSchemaAddProfile);
    if (!form.valid) {
      return fail(400, {
        form
      });
    }

    // Add profile to database
    await db.xfmrDriverProfile.create({
      data: {
        NAME: form.data.name,
        MILES_DRIVEN: form.data.milesdriven,
        KVA_EXPENDITURE: form.data.expenditure,
      }
    })
    
    return {
      form,
    };
  }
};