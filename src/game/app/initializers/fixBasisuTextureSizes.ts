import { LoaderResource } from "@pixi/loaders";
import { Dict } from "@pixi/utils";

export function fixBasisuTextureSizes(resources: Dict<LoaderResource>): void {
  console.log({ resources });

  //// POPOUTS by Rarity -> Levels (.../station-popups/[rarity]-[level].basis)
  {
    const RESOURCE_KEYS = [
      "assets/images/station-popups/common.basis",
      "assets/images/station-popups/uncommon.basis",
      "assets/images/station-popups/rare.basis",
      "assets/images/station-popups/epic.basis",
      "assets/images/station-popups/legendary.basis",
      "assets/images/station-popups/mythic.basis",
    ];

    const SCALE_FACTOR = 573 / 512;

    const TEXTURE_SIZES = {
      1: [512 * SCALE_FACTOR, 342 * SCALE_FACTOR, SCALE_FACTOR],
      2: [512 * SCALE_FACTOR, 519 * SCALE_FACTOR, SCALE_FACTOR],
      3: [512 * SCALE_FACTOR, 519 * SCALE_FACTOR, SCALE_FACTOR],
      4: [512 * SCALE_FACTOR, 781 * SCALE_FACTOR, SCALE_FACTOR],
      5: [512 * SCALE_FACTOR, 910 * SCALE_FACTOR, SCALE_FACTOR],
      6: [512 * SCALE_FACTOR, 915 * SCALE_FACTOR, SCALE_FACTOR],
      7: [512 * SCALE_FACTOR, 832 * SCALE_FACTOR, SCALE_FACTOR],
      8: [512 * SCALE_FACTOR, 817 * SCALE_FACTOR, SCALE_FACTOR],

      9: [1484, 930, 1484 / 800],
      // 1484 x 930
      // 800 x 503
    };

    for (const reourceKey of RESOURCE_KEYS) {
      for (const [i, [frameWidth, frameHeight, scaleFactor]] of Object.entries(TEXTURE_SIZES)) {
        const textureName = `${reourceKey}-${i}`;
        const texture = resources[reourceKey].textures?.[textureName];
        if (!texture) throw new Error(`No texture @ ${textureName}`);
        texture.baseTexture.setResolution(1 / scaleFactor);
        texture.baseTexture.update();
        texture.frame.x = 0.5 * (texture.baseTexture.width - frameWidth);
        texture.frame.y = 0.5 * (texture.baseTexture.height - frameHeight);
        texture.frame.width = frameWidth;
        texture.frame.height = frameHeight;
        texture.noFrame = false;
        // texture.baseTexture.resolution = 512 / 573;
        // texture.baseTexture.resolution = 512 / 573;
        texture.updateUvs();
      }
    }
  }

  //// EMPTY CARDS by Rarity
  {
    const resource = resources["assets/images/empty-cards.basis"];
    const [frameWidth, frameHeight] = [512, 717];
    for (const textureName in resource.textures) {
      const texture = resource.textures[textureName];
      if (!texture) throw new Error(`No texture @ ${textureName}`);
      texture.frame.x = 0.5 * (texture.baseTexture.width - frameWidth);
      texture.frame.y = 0.5 * (texture.baseTexture.height - frameHeight);
      texture.frame.width = frameWidth;
      texture.frame.height = frameHeight;
      texture.noFrame = false;
      texture.updateUvs();
    }
  }
}
