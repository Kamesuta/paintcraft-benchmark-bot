import * as vec3 from "vec3";

type Vec3 = vec3.Vec3;
const Vec3 = vec3.default;

/**
 * パスを作成
 * @param position アンカー
 * @param size サイズ
 */
export function generatePath(position: Vec3, size: Vec3): Vec3[] {
  const path: Vec3[] = [];
  for (let ix = 0; ix <= size.x; ix++) {
    for (let iz = 0; iz < size.z; iz++) {
      const i = ix % 2 === 0 ? iz + 1 : size.z - iz;
      path.push(Vec3([ix, 0, i]).add(position));
    }
  }
  if (size.x % 2 === 0) {
    for (let iz = 0; iz < size.z - 1; iz++) {
      const i = size.z - iz - 1;
      path.push(Vec3([size.x, 0, i]).add(position));
    }
  }
  for (let ix = 0; ix <= size.x; ix++) {
    const i = size.x - ix;
    path.push(Vec3([i, 0, 0]).add(position));
  }
  return path;
}
