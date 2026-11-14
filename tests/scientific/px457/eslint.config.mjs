// Explicit, module-owned fallback while the shared root config is unavailable.
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
const config = [...nextVitals, ...nextTypescript];
export default config;
