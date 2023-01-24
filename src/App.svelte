<script>

  import { onMount } from 'svelte';

  import { fromEvent, concat, tap, animationFrames, debounceTime} from 'rxjs'

  import * as twgl from "twgl.js";
  
  // @ts-ignore
  import vs from './lib/glsl/vert.glsl';
  // @ts-ignore
  import fs from './lib/glsl/frag.glsl';
    // @ts-ignore
  import draw from './lib/glsl/draw.glsl'; 
  // @ts-ignore
  import blend from './lib/glsl/blend.glsl';  

  let canvasRef;
  let rafId;
  let gl, programInfo, blendProgram, drawProgram
  let positionBufferInfo;

  let fb0, fb1, fb2, tmp;

  function init(canvasRef){
    
    gl = twgl.getContext(canvasRef, { depth: false })

    fb0 = twgl.createFramebufferInfo(gl, null, 512, 512),
    fb1 = twgl.createFramebufferInfo(gl, null, 512, 512)
    //fb2 = twgl.createFramebufferInfo(gl, null, 512, 512) 

    programInfo = twgl.createProgramInfo(gl, [vs, fs]);
    blendProgram = twgl.createProgramInfo(gl, [vs, draw])
    drawProgram = twgl.createProgramInfo(gl, [vs, draw])

    positionBufferInfo = twgl.createBufferInfoFromArrays(gl, {
      position: {
        data: [
          -1, -1,
          -1, 3,
          3, -1
        ],
        numComponents: 2
      }
    })
    
    resize()

    // add a debounced resize listener
    fromEvent(window, 'resize')
      .pipe(debounceTime(100))
      .subscribe(() => resize());
  }

  function dispose(){
    if(rafId){
      cancelAnimationFrame(rafId)
    }
  }

  function raf(timeStamp = 0){
    rafId = requestAnimationFrame(raf); 
    render( timeStamp )
  }

  function render(timeStamp) {

    //twgl.resizeCanvasToDisplaySize(gl.canvas);
//gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.disable(gl.CULL_FACE)
    gl.disable(gl.DEPTH_TEST)
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const time = timeStamp * 1e-3;
    const resolution = [gl.canvas.width, gl.canvas.height];

    // www.youtube.com/watch?v=rfQ8rKGTVlg#t=31m42s THXX GREGGMANN!!!
    // draw new frame in fb0
    gl.useProgram(programInfo.program)
    twgl.setBuffersAndAttributes(gl, programInfo, positionBufferInfo);
    twgl.setUniforms(programInfo, {
      time,
      resolution
    });
    twgl.bindFramebufferInfo(gl, fb0)
    twgl.drawBufferInfo(gl, positionBufferInfo);

    // blend new frame with fb1 in fb2
   /*  gl.useProgram(blendProgram.program)
    twgl.setBuffersAndAttributes(gl, blendProgram, positionBufferInfo)
    twgl.setUniforms(blendProgram, {
      time: time * 0.001,
      resolution: [gl.canvas.width, gl.canvas.height],
      persistence: 0.7,
      texture: fb0.attachments[0],
      oldTexture: fb1.attachments[0]
    })
    twgl.bindFramebufferInfo(gl, null)
    twgl.drawBufferInfo(gl, positionBufferInfo) */
  
    // draw fb1 in canvas
    gl.useProgram(drawProgram.program)
    twgl.setBuffersAndAttributes(gl, drawProgram, positionBufferInfo)
    twgl.setUniforms(drawProgram, {
      time,
      resolution,
      uTexture: fb1.attachments[0]
    })
    twgl.bindFramebufferInfo(gl, null)
    twgl.drawBufferInfo(gl, positionBufferInfo) 

    // swap fb1, fb2
   /*  tmp = fb1
    fb1 = fb2
    fb2 = tmp */
    tmp = fb1
    fb1 = fb0
    fb0 = tmp
  }

  function resize(){
    const needsResize = twgl.resizeCanvasToDisplaySize(gl.canvas);
    if (needsResize) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }
  }
  
  onMount(() => {
    init(canvasRef);
    raf();
    return () => {
      dispose();
		};
  })
</script>

<canvas id="c" bind:this={canvasRef} />

<style>
  body {
    margin: 0;
    padding: 0;
    font-family: monospace;
  }
  canvas {
    display: block;
    width: 100vw;
    height: 100vh;
  }
</style>
