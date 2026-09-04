import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // next-env.d.ts lo genera Next y no se edita; sus referencias triple-slash
    // son intencionadas.
    ignores: [
      ".next/**",
      "node_modules/**",
      "design-rules/**",
      ".agents/**",
      "assets/**",
      "public/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
