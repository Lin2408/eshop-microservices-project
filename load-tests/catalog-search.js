import http from "k6/http";
import { check, sleep } from "k6";

// Search scenario: Simulates users searching by product name
// Goal: Test search performance (queries with WHERE conditions)
// Run: k6 run catalog-search.js -e BASE_URL=http://localhost:5222

const searchTerms = [
  "Alpine",
  "Wanderer",
  "Adventurer",
  "Peak",
  "Mountain",
  "Hiking",
  "Watch",
  "Boots",
];

export const options = {
  stages: [
    { duration: "2m", target: 10 },
    { duration: "5m", target: 50 },
    { duration: "10m", target: 50 },
    { duration: "5m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<1000", "p(99)<2500"],  // Search can be slightly slower
    http_req_failed: ["rate<0.01"],
    checks: ["rate>0.99"],
  },
};

export default function () {
  const baseUrl = __ENV.BASE_URL || "http://localhost:5222";
  
  // Randomly select a search term
  const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
  
  const res = http.get(
    `${baseUrl}/api/catalog/items?name=${term}&pageIndex=0&pageSize=10&api-version=2.0`
  );
  
  check(res, {
    "status is 200": (r) => r.status === 200,
    "response has data": (r) => r.body && r.body.includes("data"),
  });
  
  sleep(1);
}
