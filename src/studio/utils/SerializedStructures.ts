export interface ISerializedInstantiableProtoGM {
  uid: string;
  moduleId: string;
}

export interface ISerializedGameObject {
  id: string;
  name: string;
  instantiableProtoGMs: Array<ISerializedInstantiableProtoGM>;
}

export interface ISerializedGameObjectManager {
  gameObjects: Array<ISerializedGameObject>;
}

export interface ISerializedScene {
  id: string;
  name: string;
  gameObjectManager: ISerializedGameObjectManager;
}

export interface ISerializedSceneManager {
  defaultSceneId: string | null;
  scenes: Array<ISerializedScene>;
}

export interface ISerializedPrototypeGameModule {
  id: string;
  name: string;
  source: string;
}

export interface ISerializedGameModuleRegistry {
  modules: Array<ISerializedPrototypeGameModule>;
}

export interface ISerializedPrototype {
  id: string;
  name: string;
  sceneManager: ISerializedSceneManager;
  gameModuleRegistry: ISerializedGameModuleRegistry;
}
