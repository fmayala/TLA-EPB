import { superValidate } from "sveltekit-superforms/server";
import { formSchema } from "../forms/schema";
import type { Actions, ServerLoad } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
// import db from "$lib/server/db";
// import { env } from '$env/dynamic/private';

export const load: ServerLoad = async () => {
  // const response = await db.xfmrMaxMeasures.findMany({
  // });

  // console.log(response);

  // // Turn response into json list of measures
  // const measures = response.map((measure) => measure.KVA_MEASURE);

  return {
    form: superValidate(formSchema),
    feed: {
      // Turn response into json list of measures
      test: "",
    }
  };
};

export const actions: Actions = {
  default: async (event) => {
    const form = await superValidate(event, formSchema);
    if (!form.valid) {
      return fail(400, {
        form
      });
    }
    
    return {
      form,
    };
  }
};