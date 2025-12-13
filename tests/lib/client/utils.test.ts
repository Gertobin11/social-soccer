import { getErrorMessage } from "$lib/client/utils";
import { describe, expect, it } from "vitest";

describe("getErrorMessage", () => {
    it("should extract the message string if the input is an Error object", () => {
        const error = new Error("Something went wrong");
        const result = getErrorMessage(error);
        expect(result).toBe("Something went wrong");
    });

    it("should return the input itself if it is not an object with a message property", () => {
        const errorString = "Just a string error";
        const result = getErrorMessage(errorString);
        expect(result).toBe("Just a string error");
    });
});