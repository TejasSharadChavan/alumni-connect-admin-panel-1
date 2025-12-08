/// <reference types="next" />
/// <reference types="next/types/global" />

declare module "next/link" {
  import { default as NextLink } from "next/dist/client/link";
  export default NextLink;
}

declare module "next/navigation" {
  export * from "next/dist/client/components/navigation";
}

declare module "next/image" {
  export * from "next/dist/client/image";
}
