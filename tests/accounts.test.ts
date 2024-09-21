import axios, { AxiosError } from "axios";
import { describe, expect, test } from "vitest";

const base = "http://localhost:8000/gdlists/api/accounts.php"


describe('URL parameters', () => {  
    test('None provided', async () => {
        expect(await axios.get(base).catch((res: AxiosError) => res.response?.request._redirectable._redirectCount)).toBe(1)
    })
    test('Invalid parameter provided', async () => {
        expect(await axios.get(base, {params: {invalid: 1}}).then(res => res.data)).toBe(-2)
    })
    test('Multiple invalid parameters provided', async () => {
        expect(await axios.get(base, {params: {invalid: 1, another: 1}}).then(res => res.data)).toBe(-2)
    })
    test('Invalid OAuth code provided', async () => {
        expect(await axios.get(base, {params: {code: "invalid"}}).catch((res: AxiosError) => res.response?.request._redirectable._currentUrl)).toContain("loginerr")
    })
    test('Cancel Discord OAuth', async () => {
        expect(await axios.get(base, {params: {code: "invalid"}}).catch((res: AxiosError) => res.response?.request._redirectable._currentUrl)).toContain("loginerr")
    })
    // test('Update profile picture cutout without parameters', async () => {
    //     expect(await axios.patch(base, undefined, {withCredentials: true}).catch((res: AxiosError) => res.response?.request._redirectable._currentUrl)).toContain("loginerr")
    // })
    test('Check login while logged out', async () => {
        expect(await axios.get(base, {params: {check: 1}}).then(res => res.data?.status)).toBeDefined()
    })
})