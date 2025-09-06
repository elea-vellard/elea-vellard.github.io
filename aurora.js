// assets/aurora-site.js
import { Renderer, Program, Mesh, Color, Triangle } from 'https://esm.sh/ogl';

const opts = {
    colorStops: ['#85359b', '#603d8e', '#922e9b'],
    blend: 0.6,
    amplitude: 1.2,
    speed: 0.6
};

const VERT2 = `#version 300 es
in vec2 position;
void main(){ gl_Position = vec4(position, 0.0, 1.0); }`;

const FRAG2 = `#version 300 es
precision highp float;
uniform float uTime, uAmplitude, uBlend;
uniform vec3  uColorStops[3];
uniform vec2  uResolution;
out vec4 fragColor;
vec3 permute(vec3 x){ return mod(((x*34.0)+1.0)*x,289.0); }
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy)); vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
  vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1; i=mod(i,289.);
  vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.); m*=m; m*=m;
  vec3 x=2.*fract(p*0.0243902439)-1.; vec3 h=abs(x)-0.5; vec3 ox=floor(x+0.5); vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.*dot(m,g);
}
void main(){
  vec2 uv=gl_FragCoord.xy/uResolution;
  float f=clamp(uv.x,0.,1.);
  vec3 c0=uColorStops[0], c1=uColorStops[1], c2=uColorStops[2];
  vec3 left=mix(c0,c1,min(f*2.,1.));
  vec3 right=mix(c1,c2,max((f-0.5)*2.,0.));
  vec3 rampColor=mix(left,right,step(0.5,f));
  float h=snoise(vec2(uv.x*2.+uTime*0.1,uTime*0.25))*0.5*uAmplitude;
  h=exp(h); h=(uv.y*2.-h+0.2);
  float intensity=0.6*h;
  float mid=0.20;
  float alpha=smoothstep(mid-uBlend*0.5, mid+uBlend*0.5, intensity);
  vec3 aurora=intensity*rampColor;
  fragColor=vec4(aurora*alpha,alpha);
}`;

// Fallback WebGL1
const VERT1 = `
attribute vec2 position;
void main(){ gl_Position = vec4(position, 0.0, 1.0); }`;

const FRAG1 = `
precision highp float;
uniform float uTime, uAmplitude, uBlend;
uniform vec3  uColorStops[3];
uniform vec2  uResolution;
vec3 permute(vec3 x){ return mod(((x*34.0)+1.0)*x,289.0); }
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy)); vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
  vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1; i=mod(i,289.);
  vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.); m*=m; m*=m;
  vec3 x=2.*fract(p*0.0243902439)-1.; vec3 h=abs(x)-0.5; vec3 ox=floor(x+0.5); vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec2 uv=gl_FragCoord.xy/uResolution;
  float f=clamp(uv.x,0.,1.);
  vec3 c0=uColorStops[0], c1=uColorStops[1], c2=uColorStops[2];
  vec3 left=mix(c0,c1,min(f*2.,1.));
  vec3 right=mix(c1,c2,max((f-0.5)*2.,0.));
  vec3 rampColor=mix(left,right,step(0.5,f));
  float hh=snoise(vec2(uv.x*2.+uTime*0.1,uTime*0.25))*0.5*uAmplitude;
  hh=exp(hh); hh=(uv.y*2.-hh+0.2);
  float intensity=0.6*hh;
  float mid=0.20;
  float alpha=smoothstep(mid-uBlend*0.5, mid+uBlend*0.5, intensity);
  vec3 aurora=intensity*rampColor;
  gl_FragColor=vec4(aurora*alpha,alpha);
`;

function createAurora(container, cfg = {}) {
    const o = { ...opts, ...cfg };
    if (!container) return;

    const test = document.createElement('canvas');
    let ctx = test.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: true });
    if (!ctx) ctx = test.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: true });

    const renderer = new Renderer({ context: ctx });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.backgroundColor = 'transparent';
    container.appendChild(gl.canvas);

    const isGL2 = (gl.getParameter(gl.VERSION) + '').includes('WebGL 2.0');

    const tri = new Triangle(gl);
    if (tri.attributes.uv) delete tri.attributes.uv;

    const stops = o.colorStops.map(hex => {
        const c = new Color(hex); return [c.r, c.g, c.b];
    });

    const program = new Program(gl, {
        vertex: isGL2 ? VERT2 : VERT1,
        fragment: isGL2 ? FRAG2 : FRAG1,
        uniforms: {
            uTime: { value: 0 },
            uAmplitude: { value: o.amplitude },
            uColorStops: { value: stops },
            uResolution: { value: [container.offsetWidth || 1, container.offsetHeight || 1] },
            uBlend: { value: o.blend }
        },
        transparent: true
    });

    const mesh = new Mesh(gl, { geometry: tri, program });

    const ro = new ResizeObserver(() => {
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        renderer.setSize(w, h);
        program.uniforms.uResolution.value = [w, h];
    });
    ro.observe(container);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const speed = prefersReduced ? 0.2 : o.speed;

    let raf = 0;
    function loop(t) {
        raf = requestAnimationFrame(loop);
        program.uniforms.uTime.value = (t * 0.001) * speed;
        renderer.render({ scene: mesh });
    }
    raf = requestAnimationFrame(loop);

    window.addEventListener('pagehide', () => {
        cancelAnimationFrame(raf);
        ro.disconnect?.();
        gl.getExtension('WEBGL_lose_context')?.loseContext();
    }, { once: true });
}

const el = document.getElementById('site-bg');
if (el) {
    createAurora(el, {
        colorStops: ['#85359b', '#603d8e', '#922e9b'],
        blend: 0.6,
        amplitude: 1.2,
        speed: 0.6
    });
} else {
    console.warn('[Aurora] #site-bg introuvable');
}