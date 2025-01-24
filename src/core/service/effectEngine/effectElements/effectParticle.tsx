import { Color } from "../../../dataStruct/Color";
import { Vector } from "../../../dataStruct/Vector";

/**
 * 粒子类
 */
export class EffectParticle {
  constructor(
    public location: Vector,
    public velocity: Vector,
    public acceleration: Vector,
    public color: Color,
    public size: number,
  ) {}

  tick() {
    this.location = this.location.add(this.velocity);
    this.velocity = this.velocity.add(this.acceleration);
  }
}
