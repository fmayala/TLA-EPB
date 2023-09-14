import { superValidate } from "sveltekit-superforms/server";
import { formSchema } from "../../forms/schema";
import type { Actions, ServerLoad } from "@sveltejs/kit";
import { fail, redirect } from "@sveltejs/kit";

export const load: ServerLoad = () => {
  return {
    form: superValidate(formSchema)
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

    if (form.valid) {
      throw redirect(300, "/dashboard");
    }
    
    return {
      form
    };
  }
};