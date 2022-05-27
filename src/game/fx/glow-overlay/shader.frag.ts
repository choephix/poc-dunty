const glsl = (x: TemplateStringsArray) => x.join("");
export const fragmentSrc = glsl`

precision mediump float;

varying vec2 vUvs;

uniform sampler2D tex0;
uniform sampler2D tex1;
uniform vec2 resolution;
uniform float time;
uniform float alpha;
uniform float noiseScale;

uniform vec3 colorLow;
uniform vec3 colorHigh;

float blend(float bg, float fg) {
  return bg < 0.5 ? (2.0 * bg * fg) : (1.0 - 2.0 * (1.0 - bg) * (1.0 - fg));
}

void main() {
  vec2 pos = vUvs;
  vec2 sop = vec2(1. - vUvs.x, 1. - vUvs.y);
  vec2 pa = vec2(noiseScale * pos.x + .00025 * time, noiseScale * pos.y + .0005 *time);
  vec2 pb = vec2(noiseScale * sop.x + .00025 * time, noiseScale * pos.y - .0005 *time);

  vec4 t0 = texture2D(tex0, pos);
  vec4 t1 = texture2D(tex1, pa);
  vec4 t2 = texture2D(tex1, pb);
  
  float mul = t0.r * t1.r * t2.r;
  gl_FragColor.a = mul;
  gl_FragColor.rgb = colorHigh * mul * mul + colorLow * mul;
  gl_FragColor *= alpha;
}
`;
