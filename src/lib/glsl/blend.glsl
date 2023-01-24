
precision mediump float;

uniform sampler2D texture;
uniform sampler2D oldTexture;

uniform float time;
uniform vec2 resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec4 prevCol =  texture2D(oldTexture, uv);
  vec4 col =  texture2D(texture, uv);

  gl_FragColor = mix(col, prevCol, 0.83);
}
