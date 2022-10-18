const config = {
  "src/**/*.{js,ts}": "eslint --cache --fix",
  "src/**": "prettier --write",
  "src/**/*.ts": () => "tsc --skipLibCheck --noEmit",
};

export default config;
