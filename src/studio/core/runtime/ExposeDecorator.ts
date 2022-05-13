import "reflect-metadata";

export const KEY_EXPOSE_META = Symbol("LS_KEY_EXPOSE_META");

export interface IExposeMetadataItem {
  type: unknown;
  paramtypes?: Array<unknown>;
  returntype?: unknown;
}

export interface IExposeMetadata {
  [key: string]: IExposeMetadataItem;
}

export function Expose() {
  return function (
    target: Record<string, unknown> /** Same as 'any' */,
    propertyKey: string
  ) {
    const metadata = (Reflect.getMetadata(KEY_EXPOSE_META, target) ??
      {}) as IExposeMetadata;

    const type = Reflect.getMetadata("design:type", target, propertyKey);
    const paramtypes = Reflect.getMetadata(
      "design:paramtypes",
      target,
      propertyKey
    );
    const returntype = Reflect.getMetadata(
      "design:returntype",
      target,
      propertyKey
    );

    const newItem: IExposeMetadataItem = {
      type,
      paramtypes,
      returntype,
    };

    metadata[propertyKey] = newItem;

    Reflect.defineMetadata(KEY_EXPOSE_META, metadata, target);
  };
}
