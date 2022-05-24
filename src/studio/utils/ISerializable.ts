export interface ISerializable {
  Serialize(): string;
}

export interface IDeserializable<T> {
  Deserialize(serialized: string): T;
}

export abstract class Serializer<T>
  implements ISerializable, IDeserializable<T>
{
  public abstract Serialize(): string;
  public abstract Deserialize(serialized: string): T;
}
