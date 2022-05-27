import type PrototypeGameModule from "@/studio/core/PrototypeGameModule";

const DRAG_MODULE_DATA_ID_KEY = "text/plain";

export function useGameModuleDrag() {
  function DragStart(
    event: DragEvent,
    prototypeGameModule: PrototypeGameModule
  ) {
    if (!event.dataTransfer) throw "Failed to set game module drag data!";

    event.dataTransfer.dropEffect = "copy";
    event.dataTransfer.setData(DRAG_MODULE_DATA_ID_KEY, prototypeGameModule.id);
  }

  function DragOver(event: DragEvent) {
    event.preventDefault();
  }

  function Drop(
    event: DragEvent,
    callback: (prototypeModuleId: string) => void
  ) {
    event.preventDefault();
    if (!event.dataTransfer) throw "Failed to get game module drag data!";

    const prototypeId = event.dataTransfer.getData(DRAG_MODULE_DATA_ID_KEY);

    callback(prototypeId);
  }

  return {
    DragStart,
    DragOver,
    Drop,
  };
}
