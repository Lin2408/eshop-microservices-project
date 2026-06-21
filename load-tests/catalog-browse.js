import http from "k6/http";
import { check, sleep } from "k6";

// Run: k6 run catalog-browse.js -e BASE_URL=http://localhost:5222

export const options = {
  stages: [
    { duration: "2m", target: 10 },   // Ramp to 10 users over 2 minutes (smoke test)
    { duration: "5m", target: 50 },   // Ramp to 50 users over 5 minutes (baseline)
    { duration: "10m", target: 50 },  // Stay at 50 users for 10 minutes (load test)
    { duration: "5m", target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ["p(95)<800", "p(99)<2000"],  // p95 must be < 800ms, p99 < 2000ms
    http_req_failed: ["rate<0.01"],                   // Error rate < 1%
    checks: ["rate>0.99"],                            // Check pass rate > 99%
  },
};

export default function () {
  const baseUrl = __ENV.BASE_URL || "http://localhost:5222";
  
  // Scenario: Browse first few pages (page index 0-2)
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
