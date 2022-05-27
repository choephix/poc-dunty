function greateParent() {
  {
    const parent = document.getElementById("debug-html-bucket");
    if (parent) {
      return parent;
    }
  }

  {
    const parent = document.createElement("div");
    parent.style.background = "rgba(0,0,0,0.75)";
    parent.id = "debug-html-bucket";
    document.body.appendChild(parent);

    parent.style.zIndex = `999999`;
    parent.style.position = "fixed";
    parent.style.right = `0`;
    parent.style.top = `0`;
    parent.style.display = "flex";
    parent.style.flexDirection = "column";
    parent.style.alignItems = "end";
    parent.style.justifyContent = "end";

    return parent;
  }
}

export function debugShowHTMLElement(el: HTMLElement | SVGElement) {
  const parent = greateParent();
  el.style.outline = "1px solid blue";
  el.style.margin = "10px 0";
  parent.appendChild(el);
}
