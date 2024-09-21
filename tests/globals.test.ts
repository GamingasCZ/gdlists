import axios from "axios";
import { describe, expect, expectTypeOf, test } from "vitest";

const base = "http://localhost:8000/gdlists/api/tests.php"

test('Generate different Private IDs', async () => {
    expect(new Set(await axios.get(base, {params: {test: 1}}).then(res => res.data)).size).toBe(3)
})

test('Sanitize element and text', async () => {
    expect(await axios.get(base, {params: {test: 2}}).then(res => res.data)).toStrictEqual(["", "test"])
})
test('Do requests', async () => {
    expectTypeOf(await axios.get(base, {params: {test: 3}}).then(res => res.data)).items.toBeString
})

test('Encrypt/decrypt text', async () => {
    expect(await axios.get(base, {params: {test: 4}}).then(res => res.data)).toBe("test")
})