/**
 * Function that extracts the error message from 
 * a thrown error
 * @param error a caught error
 * @returns string error message
 */
export function getErrorMessage(error: any) {
    if (error.message) {
        return error.message
    }
    else return error
}