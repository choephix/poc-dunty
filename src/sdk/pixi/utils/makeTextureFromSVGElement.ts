import { Texture } from "@pixi/core";

export function makeTextureFromSVGElement(svg: SVGSVGElement) {
  if (!svg.hasAttribute("xmlns")) {
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }

  const imageURL = convertSVGElementToUrlViaBlob(svg);
  // const imageURL = convertSVGElementToUrlViaBase64(svg);

  const texture = Texture.from(imageURL);
  return texture;
}

/**
 * An async version of the above method.
 *
 * Use this if you need to make sure the image is loaded before you use it.
 *
 * Otherwise, because the image is loaded from a url (even if it is a fake, data type url),
 * you won't immediately have correct values for the texture's width and height, etc.
 */
export async function makeTextureFromSVGElementAsync(svg: SVGSVGElement) {
  if (!svg.hasAttribute("xmlns")) {
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }

  const imageURL = convertSVGElementToUrlViaBlob(svg);
  // const imageURL = convertSVGElementToUrlViaBase64(svg);

  const texture = await Texture.fromURL(imageURL);
  return texture;
}

function convertElementToHtmlString(element: Element) {
  if (element.outerHTML) {
    return element.outerHTML;
  }
  const serializer = new XMLSerializer();
  return serializer.serializeToString(element);
}

function convertSVGElementToUrlViaBlob(svg: SVGElement) {
  const htmlSource = convertElementToHtmlString(svg);
  const blob = new Blob([htmlSource], { type: "image/svg+xml;charset=utf-8" });
  const blobURL = URL.createObjectURL(blob);
  return blobURL;
}

function convertSVGElementToUrlViaBase64(svg: SVGElement) {
  const htmlSource = convertElementToHtmlString(svg);
  const htmlSource_Base64Encoded = btoa(htmlSource);
  const imageDataURL = "data:image/svg+xml;base64," + htmlSource_Base64Encoded;
  return imageDataURL;
}
