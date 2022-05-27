import { BaseTexture, Renderer, RenderTexture, Texture } from "@pixi/core";
import { Sprite } from "@pixi/sprite";
import { DisplayObject } from "@pixi/display";
import { Extract } from "@pixi/extract";
import { IDimensions } from "@sdk/core/common.types";
import { Matrix } from "@pixi/math";
Renderer.registerPlugin("extract", Extract);

export function blobbifyString(str: string): Blob {
  return new Blob([str], { type: "text/plain" });
}

export async function blobbifyTexture(
  texture: Texture | BaseTexture,
  renderer = new Renderer(),
  scale: number = texture.resolution
): Promise<Blob | null> {
  return new Promise<Blob | null>(resolve => {
    if (texture instanceof BaseTexture) {
      texture = new Texture(texture);
    }
    const obj = new Sprite(texture);
    obj.scale.set(scale);
    const rt = RenderTexture.create({
      width: obj.width,
      height: obj.height,
      resolution: 1,
    });
    renderer.render(obj, rt);
    renderer.extract.canvas(rt).toBlob(resolve);
    // renderer.extract.canvas(obj).toBlob(resolve);
  });
}

export function downloadTextureAsImage(
  textureOrObject: Texture | (DisplayObject & IDimensions),
  filename: string,
  renderer: Renderer,
  padding: number = 0
) {
  const obj = textureOrObject instanceof Texture ? new Sprite(textureOrObject) : textureOrObject;
  const extract = renderer.plugins.extract as Extract;
  const rt = RenderTexture.create({
    width: obj.width + padding + padding,
    height: obj.height + padding + padding,
  });
  obj.position.set(obj.pivot.x + padding, obj.pivot.y + padding);
  renderer.render(obj, {
    renderTexture: rt,
    clear: false,
  });
  extract.canvas(rt).toBlob(blob => {
    if (blob) {
      var a = document.createElement("a");
      document.body.append(a);
      a.download = filename;
      a.href = URL.createObjectURL(blob);
      a.click();
      a.remove();
    }
  });
}

export function downloadTextFile(text: string, filename: string, type = "text/plain") {
  const a = document.createElement("a");
  const file = new Blob([text], { type: type });
  a.href = URL.createObjectURL(file);
  a.download = filename;
  a.click();
  a.remove();
}
