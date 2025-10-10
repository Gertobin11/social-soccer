import type { LayoutServerLoad, } from "./$types";

export const load: LayoutServerLoad = (event) => {

    // get the stored session and return it to the frontend
    const session = event.locals.session
    
    return {session}
}