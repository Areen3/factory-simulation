export function getRandomInt(from: number, to: number): number {
  const min = Math.ceil(from);
  const max = Math.floor(to);
  return Math.floor(Math.random() * (min - max + 1)) + min;
}

export function toRadians(angle: number): number {
  return angle * (Math.PI / 180);
}
export function getRandomRange(min: number, max: number): number {
  const random = Math.random();
  return random * (max - min) + min;
}
export function getPerecent(value: number, max: number): number {
  return Math.floor((value / max) * 100);
}
