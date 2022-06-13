import { readFile, writeFile } from "fs/promises";

import { MaxLength, MinLength, UUID } from "@deepkit/type";
import { cast, is, resolveReceiveType, serialize, uuid } from "@deepkit/type";
import { Temporal } from "@js-temporal/polyfill";

import { SIM_SERIALIZER, Instant } from "./serializers";

export interface IDataClassParseOptions {}

export interface IDataClassStringifyOptions {
  is_formatted?: boolean;
}

export class DataClass {
  static from<B extends typeof DataClass, I = InstanceType<B>>(
    this: B,
    properties: any
  ): I | never {
    const data = cast<I>(
      properties,
      undefined,
      SIM_SERIALIZER,
      undefined,
      resolveReceiveType(this)
    );

    return data;
  }

  static is<B extends typeof DataClass, I = InstanceType<B>>(
    this: B,
    value: any
  ): value is I {
    return is<I>(value, SIM_SERIALIZER, undefined, resolveReceiveType(this));
  }

  static parse<B extends typeof DataClass, I = InstanceType<B>>(
    this: B,
    text: string,
    // @ts-expect-error - TODO: reserving argument
    options: IDataClassParseOptions = {}
  ): I | never {
    const properties = JSON.parse(text);

    return this.from(properties);
  }

  static stringify<B extends typeof DataClass, I = InstanceType<B>>(
    this: B,
    properties: any,
    options: IDataClassStringifyOptions = {}
  ): string {
    const { is_formatted = false } = options;

    const serialized = serialize<I>(
      properties,
      undefined,
      SIM_SERIALIZER,
      undefined,
      resolveReceiveType(this)
    );

    return JSON.stringify(serialized, null, is_formatted ? 4 : undefined);
  }

  clone(): this {
    return (this.constructor as typeof DataClass).from(this);
  }

  stringify(options?: IDataClassStringifyOptions): string {
    return (this.constructor as typeof DataClass).stringify(this, options);
  }
}

export class Configuration extends DataClass {
  static async read<B extends typeof DataClass, I = InstanceType<B>>(
    this: B,
    path: string,
    options: IDataClassParseOptions = {}
  ): Promise<I> | never {
    const buffer = await readFile(path);
    const text = buffer.toString();

    return this.parse(text, options);
  }

  write(
    path: string,
    options?: IDataClassStringifyOptions
  ): Promise<void> | never {
    const text = this.stringify(options);

    return writeFile(path, text);
  }
}

export class Project extends Configuration {
  identifier: UUID = uuid();

  title!: string & MinLength<3> & MaxLength<16>;

  metadata: ProjectMetadata = new ProjectMetadata();
}

export class ProjectMetadata extends DataClass {
  accessed_at: Instant = Temporal.Now.instant();

  created_at: Instant = Temporal.Now.instant();
}
