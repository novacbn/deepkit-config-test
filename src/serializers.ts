import { Serializer } from "@deepkit/type";
import { Temporal } from "@js-temporal/polyfill";

export class Instant extends Temporal.Instant {}

export class SIMSerializer extends Serializer {
  constructor(name: string = "SIM_SERIALIZER") {
    super(name);

    console.log("SIMSerializer::constuctor");

    this.registerTemporal();
  }

  protected registerTemporal() {
    const { deserializeRegistry, serializeRegistry } = this;

    console.log("SIMSerializer::registerTemporal");

    deserializeRegistry.registerClass(Instant, (type, state) => {
      console.log("deserializeRegistry::Instant", { type, state });

      state.setContext({ Instant });
      state.addSetter(`Instant.from(${state.accessor})`);
    });

    serializeRegistry.registerClass(Instant, (type, state) => {
      console.log("serializeRegistry::Instant", { type, state });

      state.addSetter(`${state.accessor}.toJSON()`);
    });
  }
}

export const SIM_SERIALIZER = new SIMSerializer();
