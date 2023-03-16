import { expect, test } from "vitest";
import { identity } from "./identity";

test("the identity should be the same", async () => {
  const principal = (await identity).getPrincipal();
  expect(principal.toString()).toMatchInlineSnapshot(
    '"wnkwv-wdqb5-7wlzr-azfpw-5e5n5-dyxrf-uug7x-qxb55-mkmpa-5jqik-tqe"'
  );
});