import http from "k6/http";
import { check, sleep } from "k6";

// CI smoke scenario: short run to validate performance baseline in pipeline.
// Run: k6 run catalog-ci-smoke.js -e BASE_URL=https://your-env

export const options = {
  vus: 10,
  duration: "45s",
  thresholds: {
    http_req_duration: ["p(95)<1200", "p(99)<2500"],
    http_req_failed: ["rate<0.01"],
    checks: ["rate>0.99"],
  },
};

export default function () {
  const baseUrl = __ENV.BASE_URL;

  if (!baseUrl) {
    throw new Error("BASE_URL is required. Set it with -e BASE_URL=...");
  }

  const pageIndex = Math.floor(Math.random() * 3);
  const res = http.get(
    `${baseUrl}/api/catalog/items?pageIndex=${pageIndex}&pageSize=10&api-version=2.0`
  );

  check(res, {
    "status is 200": (r) => r.status === 200,
    "response has data": (r) => r.body && r.body.includes("data"),
  });

  sleep(1);
}
