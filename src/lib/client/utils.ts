/**
 * Function that extracts the error message from 
 * a thrown error
 * @param error Error
 * @returns string 
 */
export function getErrorMessage(error: any) {
    if (error.message) {
        return error.message
    }
    else return error
}

export const daysOfTheWeek = [
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
	'Sunday'
] as const;
