import { readFile, writeFile } from "fs/promises";

import { MinLength, MaxLength, UUID } from "@deepkit/type";
import {
  cast,
  deserialize,
  is,
  resolveReceiveType,
  serialize,
  uuid,
} from "@deepkit/type";

export class DataClass {
  static from<B extends typeof DataClass, I = InstanceType<B>>(
    this: B,
    properties: any
  ): I | never {
    const data = cast<I>(
      properties,
      undefined,
      undefined,
      undefined,
      resolveReceiveType(this)
    );

    return data;
  }

  static is<B extends typeof DataClass, I = InstanceType<B>>(
    this: B,
    value: any
  ): value is I {
    return is<I>(value, undefined, undefined, resolveReceiveType(this));
  }

  static parse<B extends typeof DataClass, I = InstanceType<B>>(
    this: B,
    text: string
  ): I | never {
    const properties = JSON.parse(text);

    return this.from(properties);
  }

  clone(): this {
    return deserialize<typeof this>(this);
  }

  stringify(is_pretty: boolean = false): string {
    return JSON.stringify(
      serialize<typeof this>(this),
      null,
      is_pretty ? 4 : undefined
    );
  }
}

export class Configuration extends DataClass {
  static async read<B extends typeof DataClass, I = InstanceType<B>>(
    this: B,
    path: string
  ): Promise<I> | never {
    const buffer = await readFile(path);
    const text = buffer.toString();

    return this.parse(text);
  }

  write(path: string, is_pretty: boolean = false): Promise<void> | never {
    const text = this.stringify(is_pretty);

    return writeFile(path, text);
  }
}

export class Project extends Configuration {
  readonly identifier: UUID = uuid();

  readonly title!: string & MinLength<3> & MaxLength<16>;

  readonly metadata: ProjectMetadata = new ProjectMetadata();
}

export class ProjectMetadata extends DataClass {
  readonly created_at: Date = new Date();
}
