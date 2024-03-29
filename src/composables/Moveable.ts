import { ref } from "vue";

interface Position {
  x: number;
  y: number;
}

export function useMovable(inverse = false) {
  const hold = ref(false);

  const lastPosition = ref<Position>({ x: 0, y: 0 });
  const curPosition = ref<Position>({ x: 0, y: 0 });
  const mousePosition = ref<Position>({ x: 0, y: 0 });

  const HandleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.button === 0) {
      HandleClick(e.x, e.y);
    }
  };

  const HandleMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    HandleMove(e.x, e.y);
  };

  const HandleMouseUp = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    HandleRelease();
  };

  const HandleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    HandleClick(e.touches[0].clientX, e.touches[0].clientY);
  };

  const HandleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    HandleClick(e.touches[0].clientX, e.touches[0].clientY);
  };

  const HandleTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    HandleRelease();
  };

  const HandleClick = (x: number, y: number) => {
    hold.value = true;

    lastPosition.value = { x, y };
  };

  const HandleMove = (x: number, y: number) => {
    mousePosition.value.x = x;
    mousePosition.value.y = y;

    if (hold.value) {
      const deltaX = x - lastPosition.value.x;
      const deltaY = y - lastPosition.value.y;

      if (inverse) {
        curPosition.value.x -= deltaX;
        curPosition.value.y -= deltaY;
      } else {
        curPosition.value.x += deltaX;
        curPosition.value.y += deltaY;
      }

      lastPosition.value = { x, y };
    }
  };

  const HandleRelease = () => {
    hold.value = false;

    lastPosition.value = { x: 0, y: 0 };
  };

  return {
    hold,
    lastPosition,
    curPosition,
    mousePosition,
    HandleClick,
    HandleMove,
    HandleRelease,
    HandleMouseDown,
    HandleMouseMove,
    HandleMouseUp,
    HandleTouchStart,
    HandleTouchMove,
    HandleTouchEnd,
  };
}
