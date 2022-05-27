import { BaseTexture, Resource, Texture } from "@pixi/core";
import { LoaderResource, Loader } from "@pixi/loaders";
import { Sprite } from "@pixi/sprite";
import { TextureCache } from "@pixi/utils";
import { LiteralUnion } from "type-fest/source/literal-union";

function isTasksMapAndNotArray(tasks: any): tasks is Record<string, string> {
  return typeof tasks === "object" && !Array.isArray(tasks);
}

export class AssetsManager {
  public readonly textures = { white: Texture.WHITE } as {
    [key: string]: Texture;
  };
  public readonly resources = {} as { [name: string]: LoaderResource };

  private __alreadyLoaded__ = new Set<string>();

  load(tasks: Record<string, string> | string[], loader: Loader = new Loader()) {
    return new Promise<Loader["resources"]>(resolve => {
      const addTask = isTasksMapAndNotArray(tasks)
        ? (assetName: keyof typeof tasks) => loader.add(assetName, tasks[assetName])
        : (index: any) => loader.add(tasks[index]);

      for (const key in tasks) {
        const path = tasks[key as keyof typeof tasks] as string;
        if (this.__alreadyLoaded__.has(path)) continue;
        addTask(key);
        this.__alreadyLoaded__.add(path);
      }

      loader.load(async () => {
        Object.assign(this.resources, loader.resources);
        //// Update asset maps with references loaded textures
        for (const [key, resource] of Object.entries(loader.resources)) {
          if (resource.textures) {
            Object.assign(this.textures, resource.textures);
          } else if (resource.texture) {
            this.textures[key] = resource.texture;
          }
        }
        resolve(this.resources);
      });
    });
  }

  async assureTextureLoaded(nameAndPath: string | [string, string], options: Partial<BaseTexture> = {}) {
    const [name, path] = typeof nameAndPath === "string" ? [nameAndPath, nameAndPath] : nameAndPath;

    const texture = this.textures[name] ?? TextureCache[path] ?? (await Texture.fromURL(path));
    this.textures[name] = texture;
    Object.assign(texture.baseTexture, options);
    return texture;
  }

  async assureTexturesLoaded(tasks: string[]): Promise<Texture[]>;
  async assureTexturesLoaded(tasks: Record<string, string>): Promise<Record<string, Texture>>;
  async assureTexturesLoaded(tasks: Record<string, string> | string[]) {
    if (Array.isArray(tasks)) {
      return Promise.all(tasks.map(task => this.assureTextureLoaded(task)));
    } else {
      const pairs = await Promise.all(
        Object.entries(tasks).map(([name, path]) => [name, this.assureTextureLoaded([name, path])] as const)
      );
      const result = {} as { [key: string]: Texture };
      for (const [key, texturePromise] of pairs) {
        result[key] = await texturePromise;
      }
      return result;
    }
  }

  getTextures(names: string[]) {
    return names.map(name => this.getTexture(name));
  }

  getTexture(name: string) {
    return this.textures[name] ?? Texture.from(name) ?? Texture.from("assets/images/" + name);
  }

  mapTextures<T extends Record<string, string>>(map: T) {
    const result = {} as { [key: string]: Texture };
    for (const [key, name] of Object.entries(map)) {
      result[key] = this.getTexture(name);
    }
    return result as Record<LiteralUnion<keyof T, string>, Texture>;
  }

  makeSprite<T extends {}>(textureName: string, mods?: T): Sprite & T {
    return Object.assign(new Sprite(this.getTexture(textureName)), mods);
  }
}
