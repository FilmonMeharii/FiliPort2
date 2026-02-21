module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  testTimeout: 15000,
  collectCoverageFrom: [
    "app.js",
    "db.js",
    "routers/**/*.js"
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/"
  ]
};
