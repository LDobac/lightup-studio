import { Serializer } from "./ISerializable";
import type {
  ISerializedGameModuleRegistry,
  ISerializedGameObject,
  ISerializedGameObjectManager,
  ISerializedInstantiableProtoGM,
  ISerializedPrototype,
  ISerializedPrototypeGameModule,
  ISerializedScene,
  ISerializedSceneManager,
} from "./SerializedStructures";
import type Prototype from "@/studio/core/Prototype";
import type { ISceneObject } from "@/studio/core/SceneManager";
import type GameObject from "@/studio/core/runtime/GameObject";
import type { InstantiableProtoGM } from "@/studio/core/runtime/GameObject";
import type GameObjectManager from "@/studio/core/GameObjectManager";
import type PrototypeGameModule from "@/studio/core/PrototypeGameModule";

export default class PrototypeSerializer extends Serializer<ISerializedPrototype> {
  private prototype: Prototype;

  constructor(prototype: Prototype) {
    super();

    this.prototype = prototype;
  }

  public Serialize(): string {
    const sceneManager = this.prototype.sceneManager;
    const gameModuleRegistry = this.prototype.gameModuleRegistry;

    const serializedSceneManager: ISerializedSceneManager = {
      defaultSceneId: sceneManager.defaultScene
        ? sceneManager.defaultScene.id
        : null,
      scenes: sceneManager.scenes.map((scene: ISceneObject) =>
        this.SerializeScene(scene)
      ),
    };

    const serializedRegistry: ISerializedGameModuleRegistry = {
      modules: gameModuleRegistry.prototypeGameModules.map((module) =>
        this.SerializePrototypeGameModule(module)
      ),
    };

    const serializedPrototype: ISerializedPrototype = {
      id: this.prototype.id,
      name: this.prototype.name,
      sceneManager: serializedSceneManager,
      gameModuleRegistry: serializedRegistry,
    };

    return JSON.stringify(serializedPrototype);
  }

  public Deserialize(serialized: string): ISerializedPrototype {
    return JSON.parse(serialized) as ISerializedPrototype;
  }

  private SerializeInstantiableProtoGM(
    module: InstantiableProtoGM
  ): ISerializedInstantiableProtoGM {
    return {
      uid: module.uid,
      moduleId: module.module.id,
    };
  }

  private SerializeGameObject(gameObject: GameObject): ISerializedGameObject {
    return {
      id: gameObject.id,
      name: gameObject.name,
      instantiableProtoGMs: gameObject.prototypeGameModule.map((module) =>
        this.SerializeInstantiableProtoGM(module)
      ),
    };
  }

  private SerializeGameObjectManager(
    gameObjectManager: GameObjectManager
  ): ISerializedGameObjectManager {
    return {
      gameObjects: gameObjectManager.gameObjects.map((gameObject: GameObject) =>
        this.SerializeGameObject(gameObject)
      ),
    };
  }

  private SerializeScene(scene: ISceneObject): ISerializedScene {
    return {
      id: scene.id,
      name: scene.name,
      gameObjectManager: this.SerializeGameObjectManager(
        scene.gameObjectManager
      ),
    };
  }

  private SerializePrototypeGameModule(
    module: PrototypeGameModule
  ): ISerializedPrototypeGameModule {
    return {
      id: module.id,
      name: module.name,
      source: module.originSource,
    };
  }
}
