import http from "k6/http";
import { check, sleep } from "k6";

// Realistic mixed scenario: Simulates real user behavior
// Traffic mix: 70% browse list, 20% search, 10% get single item
// Run: k6 run catalog-realistic.js -e BASE_URL=http://localhost:5222

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
    { duration: "1m", target: 5 },    // 1min smoke: 5 users
    { duration: "2m", target: 20 },   // 2min ramp to 20 users
    { duration: "5m", target: 50 },   // 5min ramp to 50 users (baseline)
    { duration: "10m", target: 50 },  // 10min stay at 50 users
    { duration: "5m", target: 100 },  // 5min ramp to 100 users (stress test)
    { duration: "5m", target: 100 },  // 5min stay at 100 users
    { duration: "3m", target: 0 },    // 3min ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<800", "p(99)<2000"],
    http_req_failed: ["rate<0.01"],
    checks: ["rate>0.99"],
    "http_req_duration{staticAsset:yes}": ["p(99)<1000"],
  },
};

export default function () {
  const baseUrl = __ENV.BASE_URL || "http://localhost:5222";
  
  const action = Math.random();
  
  if (action < 0.7) {
    // 70%: browse list
    browseItems(baseUrl);
  } else if (action < 0.9) {
    // 20%: search
    searchItems(baseUrl);
  } else {
    // 10%: get single item
    getItemById(baseUrl);
  }
  
  sleep(Math.random() * 2 + 0.5); // Random delay between 0.5 and 2.5 seconds
}

function browseItems(baseUrl) {
  const pageIndex = Math.floor(Math.random() * 5);
  const res = http.get(
    `${baseUrl}/api/catalog/items?pageIndex=${pageIndex}&pageSize=10&api-version=2.0`
  );
  
  check(res, {
    "browse: status 200": (r) => r.status === 200,
    "browse: has data": (r) => r.body && r.body.includes("data"),
    "browse: response time < 500ms": (r) => r.timings.duration < 500,
  });
}

function searchItems(baseUrl) {
  const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
  const res = http.get(
    `${baseUrl}/api/catalog/items?name=${term}&pageIndex=0&pageSize=10&api-version=2.0`
  );
  
  check(res, {
    "search: status 200": (r) => r.status === 200,
    "search: has data": (r) => r.body && r.body.includes("data"),
  });
}

function getItemById(baseUrl) {
  const itemId = Math.floor(Math.random() * 20) + 1; // IDs 1-20
  const res = http.get(
    `${baseUrl}/api/catalog/items/${itemId}?api-version=2.0`
  );
  
  check(res, {
    "item: status 200": (r) => r.status === 200,
    "item: has name": (r) => r.body && r.body.includes("name"),
  });
}
