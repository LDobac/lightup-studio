import { ref } from "vue";

export function useMovable(inverse = false) {
  const hold = ref(false);

  const lastPosition = ref({ x: 0, y: 0 });
  const curPosition = ref({ x: 0, y: 0 });

  const HandleMouseDown = (e: MouseEvent) => {
    e.preventDefault();

    if (e.button === 0) {
      HandleClick(e.x, e.y);
    }
  };

  const HandleMouseMove = (e: MouseEvent) => {
    e.preventDefault();

    HandleMove(e.x, e.y);
  };

  const HandleMouseUp = (e: MouseEvent) => {
    e.preventDefault();

    HandleRelease();
  };

  const HandleTouchStart = (e: TouchEvent) => {
    e.preventDefault();

    HandleClick(e.touches[0].clientX, e.touches[0].clientY);
  };

  const HandleTouchMove = (e: TouchEvent) => {
    e.preventDefault();

    HandleClick(e.touches[0].clientX, e.touches[0].clientY);
  };

  const HandleTouchEnd = (e: TouchEvent) => {
    e.preventDefault();

    HandleRelease();
  };

  const HandleClick = (x: number, y: number) => {
    hold.value = true;

    lastPosition.value = { x, y };
  };

  const HandleMove = (x: number, y: number) => {
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
