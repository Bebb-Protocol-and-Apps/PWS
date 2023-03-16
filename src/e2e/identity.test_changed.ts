import { expect, test } from "vitest";
import { identity } from "./identity";

test("should run a basic test", async () => {
  expect(true).toBe(true);
});

test("the identity should be the same", async () => {
  const principal = (await identity).getPrincipal();
  expect(principal.toString()).toMatchInlineSnapshot(
    '"cbydt-onhgx-x3fxj-j2xef-dsb4e-o2bqx-5oln4-koufv-wufn6-wsc54-sae"'
  );
});

/*
test("the identity should be the same", async () => {
  const principal = (await identity).getPrincipal();
  expect(principal.toString()).toMatchInlineSnapshot(
    '"wnkwv-wdqb5-7wlzr-azfpw-5e5n5-dyxrf-uug7x-qxb55-mkmpa-5jqik-tqe"'
  );
}); */