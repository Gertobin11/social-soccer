import { getNumberFromFormData, getStringFromFormData } from '$lib/server/utils';
import {  describe, expect, it} from 'vitest';

describe("getNumberFromFormData", () => {
    it("should return a number", () => {
        const formData = new FormData()
        formData.append("quantity", "5")

        const result = getNumberFromFormData(formData, "quantity")

        expect(result).toBe(5)
    })

    it("should throw an error if the name is not in the form", () => {
        const formData = new FormData()
        formData.append("quantity", "5")

        expect(() => getNumberFromFormData(formData, "bad key")).toThrowError("bad key is not in the request data")

    })

     it("should throw an error if the conversion from string to number did not result in a number", () => {
        const formData = new FormData()
        formData.append("quantity", "bad value")

        expect(() => getNumberFromFormData(formData, "quantity")).toThrowError("quantity is not a valid number")

    })
})

describe("getStringFromFormData", () => {
    it("should return a string", () => {
        const formData = new FormData()
        formData.append("name", "Gigi")

        const result = getStringFromFormData(formData, "name")

        expect(result).toBe('Gigi')
    })

    it("should throw an error if the name is not in the form", () => {
        const formData = new FormData()
        formData.append("name", "Gigi")

        expect(() => getStringFromFormData(formData, "bad key")).toThrowError("bad key is not in the request data")

    })

  
})