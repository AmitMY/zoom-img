import { Component, Element, Prop } from '@stencil/core';

export interface ImgZoomSettings {
  step: number;
  min: number;
  max: number;
  initial: number;
}

@Component({
  tag: 'img-zoom',
  styleUrl: 'img-zoom.css',
  shadow: true
})
export class ImgZoom {

  @Prop() src: string = '';
  @Prop() alt: string = '';
  @Prop() settings: ImgZoomSettings = {
    step: 0.2,
    min: 0.125,
    max: 1024,
    initial: 1,
  };

  @Element() host: HTMLElement;

  private container: HTMLElement;
  private img: HTMLElement;

  previousEvent: MouseEvent;
  boundMousemove: any;
  boundMouseup: any;

  rotation = 0;

  constructor() {
    this.boundMousemove = this.mousemove.bind(this);
    this.boundMouseup = this.mouseup.bind(this);
  }

  componentDidLoad() {
    this.reset();

    this.img.addEventListener('wheel', this.onWheel.bind(this));
    this.img.addEventListener('mousedown', this.mousedown.bind(this));
  }

  // Property getters
  getRect() {
    return this.container.getBoundingClientRect();
  }

  getZoom() {
    return Number(this.img.style.zoom);
  }

  setZoom(zoom: number) {
    this.img.style.zoom = String(Math.min(this.settings.max, Math.max(this.settings.min, zoom)));
  }

  zoom(zoomIn: boolean) {
    this.setZoom(this.getZoom() * (1 + this.settings.step * (zoomIn ? 1 : -1)));
  }

  rotate(clockwise: boolean) {
    this.rotation += 90 * (clockwise ? 1 : -1);
    const offset = this.getOffset();
    this.setOffset(offset[0], offset[1]);
  }

  getOffset() {
    const transform = this.container.style.transform;
    if (transform) {
      const match = /translate\((.*?)px\,(.*?)px\) rotate\((.*?)deg\)/.exec(transform);
      if (match && match.length === 4) {
        return [match[1], match[2]].map(Number);
      }
    }

    return [0, 0];
  }

  setOffset(left: number, top: number) {
    this.container.style.transform = 'translate(' + left + 'px,' + top + 'px) rotate(' + this.rotation + 'deg)';
  }

  reset() {
    this.setZoom(this.settings.initial);
    this.rotation = 0;
    this.setOffset(0, 0);
    this.img.style.width = String(this.host.getBoundingClientRect().width * 0.9) + "px";
  }

  onWheel(e: MouseWheelEvent) {
    e.preventDefault();

    const deltaY = e.deltaY ? e.deltaY : -e.wheelDelta;

    // Cursor relative to img
    const rect = this.getRect();
    const relOffset = {
      x: (e.pageX - rect.left - window.pageXOffset) / rect.width,
      y: (e.pageY - rect.top - window.pageYOffset) / rect.height
    };

    if (relOffset.x > 1 || relOffset.x < 0 || relOffset.y > 1 || relOffset.y < 0) {
      return;
    }


    // Update the zoom level
    this.zoom(deltaY < 0);

    // Sample the transformation
    const [transformLeft, transformTop] = this.getOffset();

    // Cursor relative to img
    const newRect = this.getRect();
    const newOffset = {
      x: e.pageX - newRect.left - window.pageXOffset + transformLeft,
      y: e.pageY - newRect.top - window.pageYOffset + transformTop
    };

    const left = newOffset.x - newRect.width * relOffset.x;
    const top = newOffset.y - newRect.height * relOffset.y;
    this.setOffset(left, top);
  }

  mousedown(e: MouseEvent) {
    e.preventDefault();
    this.previousEvent = e;
    window.addEventListener('mousemove', this.boundMousemove);
    window.addEventListener('mouseup', this.boundMouseup);
  }

  mouseup(e: MouseEvent) {
    e.preventDefault();
    window.removeEventListener('mouseup', this.boundMouseup);
    window.removeEventListener('mousemove', this.boundMousemove);
  }

  mousemove(e: DragEvent) {
    e.preventDefault();
    let [left, top] = this.getOffset();
    left += e.pageX - this.previousEvent.pageX;
    top += e.pageY - this.previousEvent.pageY;
    this.previousEvent = e;
    this.setOffset(left, top);
  }

  render() {
    return (
      <div ref={(r) => this.container = r}>
        <img src={this.src} alt={this.alt} ref={(r) => this.img = r}/>
      </div>
    );
  }
}
