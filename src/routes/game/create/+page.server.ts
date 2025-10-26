import { redirect } from "sveltekit-flash-message/server"
import type { PageServerLoad } from "./$types"
import { superValidate } from "sveltekit-superforms"
import { zod4 } from "sveltekit-superforms/adapters"
import { createGameSchema } from '$lib/validation/game'

export const load: PageServerLoad = async (event) => {
    // redirect to the homepage if the user is not signed in
    if (!event.locals.session) {
        return redirect("/", {type: "error", message: "Tou must be signed in to view this page"}, event)
    }
    const form = await superValidate(zod4(createGameSchema))

    return {form}
}