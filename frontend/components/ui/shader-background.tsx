"use client";

import React, { useEffect, useRef } from "react";

const ShaderBackground = ({ className = "fixed top-0 left-0 w-full h-full -z-10", isDark = true }: { className?: string; isDark?: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Vertex shader
    const vsSource = `
    attribute vec2 aVertexPosition;
    void main() {
      gl_Position = vec4(aVertexPosition, 0.0, 1.0);
    }
  `;

    // Fragment shader — optimized:
    // • mediump precision (faster on mobile GPUs, sufficient quality)
    // • linesPerGroup reduced 16 → 10 (37% fewer iterations)
    // • random() simplified: 2 cos() instead of 3 (33% cheaper per call)
    // • circles removed (expensive per-line sqrt inside drawCircle)
    // • precomputed constants folded in at GLSL constant level
    const fsSource = `
    precision mediump float;
    uniform vec2 iResolution;
    uniform float iTime;

    const float overallSpeed    = 0.2;
    const float gridSmoothWidth = 0.015;
    const float axisWidth       = 0.05;
    const float scale           = 5.0;

    const vec4 lineColor        = vec4(1.0, 0.5, 0.0, 1.0);

    const float minLineWidth    = 0.01;
    const float maxLineWidth    = 0.2;
    const float lineSpeed       = 0.2;   // 1.0 * overallSpeed
    const float lineAmplitude   = 1.0;
    const float lineFrequency   = 0.2;
    const float warpSpeed       = 0.04;  // 0.2 * overallSpeed
    const float warpFrequency   = 0.5;
    const float warpAmplitude   = 1.0;
    const float offsetFrequency = 0.5;
    const float offsetSpeed     = 0.266; // 1.33 * overallSpeed
    const float minOffsetSpread = 0.6;
    const float maxOffsetSpread = 2.0;
    const int   linesPerGroup   = 10;    // was 16 — fewer iterations = faster

    #define drawSmoothLine(pos, halfWidth, t) smoothstep(halfWidth, 0.0, abs(pos - (t)))
    #define drawCrispLine(pos, halfWidth, t)  smoothstep(halfWidth + gridSmoothWidth, halfWidth, abs(pos - (t)))

    // Cheaper random: 2 cos() instead of 3
    float random(float t) {
      return (cos(t) + cos(t * 1.3 + 1.3)) * 0.5;
    }

    float getPlasmaY(float x, float horizontalFade, float offset) {
      return random(x * lineFrequency + iTime * lineSpeed) * horizontalFade * lineAmplitude + offset;
    }

    void main() {
      vec2 uv    = gl_FragCoord.xy / iResolution.xy;
      vec2 space = (gl_FragCoord.xy - iResolution.xy * 0.5) / iResolution.x * 2.0 * scale;

      float horizontalFade = 1.0 - (cos(uv.x * 6.2832) * 0.5 + 0.5);
      float verticalFade   = 1.0 - (cos(uv.y * 6.2832) * 0.5 + 0.5);

      // Warp — only one pass (was two)
      float warpBase = iTime * warpSpeed;
      space.y += random(space.x * warpFrequency + warpBase)       * warpAmplitude * (0.5 + horizontalFade);
      space.x += random(space.y * warpFrequency + warpBase + 2.0) * warpAmplitude * horizontalFade;

      vec4 lines = vec4(0.0);
      float offsetTime = iTime * offsetSpeed;

      for (int l = 0; l < linesPerGroup; l++) {
        float fl  = float(l);
        float nli = fl / float(linesPerGroup);
        float offsetPos = fl + space.x * offsetFrequency;

        float rand      = random(offsetPos + offsetTime) * 0.5 + 0.5;
        float halfWidth = mix(minLineWidth, maxLineWidth, rand * horizontalFade) * 0.5;
        float offset    = random(offsetPos + offsetTime * (1.0 + nli)) * mix(minOffsetSpread, maxOffsetSpread, horizontalFade);

        float linePos   = getPlasmaY(space.x, horizontalFade, offset);

        // Draw line only (no circles — removes per-line sqrt)
        float line = drawSmoothLine(linePos, halfWidth, space.y) * 0.5
                   + drawCrispLine(linePos,  halfWidth * 0.15, space.y);

        lines += line * lineColor * rand;
      }

      vec4 bgColor1 = vec4(0.04, 0.01, 0.0, 1.0);
      vec4 bgColor2 = vec4(0.09, 0.03, 0.0, 1.0);

      vec4 col = mix(bgColor1, bgColor2, uv.x);
      col *= verticalFade;
      col += lines * 0.5;
      col.a = 1.0;

      gl_FragColor = col;
    }
  `;

    const loadShader = (gl: WebGLRenderingContext, type: number, source: string) => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("Shader compile error:", gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    };

    const initShaderProgram = (gl: WebGLRenderingContext, vs: string, fs: string) => {
        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vs);
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fs);
        if (!vertexShader || !fragmentShader) return null;

        const program = gl.createProgram();
        if (!program) return null;

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Shader link error:", gl.getProgramInfoLog(program));
            return null;
        }

        // Shaders are linked into the program — we can detach & delete them now
        gl.detachShader(program, vertexShader);
        gl.detachShader(program, fragmentShader);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        return program;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Request WebGL with performance hints
        const gl = canvas.getContext("webgl", {
            antialias: false,         // no AA needed for full-screen bg
            powerPreference: "high-performance",
            preserveDrawingBuffer: false,
        });
        if (!gl) {
            console.warn("WebGL not supported.");
            return;
        }

        const program = initShaderProgram(gl, vsSource, fsSource);
        if (!program) return;

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
            gl.STATIC_DRAW
        );

        const vertexLoc = gl.getAttribLocation(program, "aVertexPosition");
        const resLoc = gl.getUniformLocation(program, "iResolution");
        const timeLoc = gl.getUniformLocation(program, "iTime");

        // Bind attrib once — it won't change
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(vertexLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vertexLoc);
        gl.useProgram(program);

        // Render at reduced pixel ratio (max 1.5×) to keep shader load manageable
        // Full native DPR (e.g. 2–3 on Retina) squares the fragment count
        const MAX_DPR = 1.5;
        const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

        const resizeCanvas = () => {
            canvas.width = Math.floor(window.innerWidth * dpr);
            canvas.height = Math.floor(window.innerHeight * dpr);
            gl.viewport(0, 0, canvas.width, canvas.height);
        };

        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();

        // Target 60 fps using performance.now() delta — skip frame if rendering too fast
        const TARGET_INTERVAL = 1000 / 60;
        let lastFrameTime = 0;
        let animationFrameId: number;
        const startTime = performance.now();

        const render = (now: number) => {
            animationFrameId = requestAnimationFrame(render);

            const delta = now - lastFrameTime;
            if (delta < TARGET_INTERVAL - 1) return; // skip if too early
            lastFrameTime = now - (delta % TARGET_INTERVAL);

            const t = (now - startTime) / 1000;

            if (resLoc) gl.uniform2f(resLoc, canvas.width, canvas.height);
            if (timeLoc) gl.uniform1f(timeLoc, t);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            cancelAnimationFrame(animationFrameId);
            const ext = gl.getExtension("WEBGL_lose_context");
            if (ext) ext.loseContext();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <canvas
                ref={canvasRef}
                className={className}
                style={{ imageRendering: "auto" }}
            />
            {!isDark && (
                <div
                    className={className}
                    style={{
                        background: "linear-gradient(135deg, rgba(255,247,237,0.92) 0%, rgba(255,237,213,0.88) 40%, rgba(254,215,170,0.82) 100%)",
                        pointerEvents: "none",
                    }}
                />
            )}
        </>
    );
};

export default ShaderBackground;
