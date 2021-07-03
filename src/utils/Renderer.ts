/**
 * Constructs a renderer object.
 * @param {WebGLRenderingContext} gl The GL context.
 * @constructor
 */
export class Renderer {
    private gl_: WebGLRenderingContext
    private program_: WebGLProgram
    private vertexShader_: WebGLShader
    private fragmentShader_: WebGLShader
    private uniformLocations_: Record<string, WebGLUniformLocation | null>
    private attribLocations_: Record<string, number>
    private quadVertexBuffer_: WebGLBuffer | null

    constructor(gl: WebGLRenderingContext) {
        this.gl_ = gl;
        this.program_ = gl.createProgram()!;
        this.vertexShader_ = this.compileShader_(
            Renderer.vertexShaderSource_, gl.VERTEX_SHADER);
        this.fragmentShader_ = this.compileShader_(
            Renderer.fragmentShaderSource_, gl.FRAGMENT_SHADER);
        this.uniformLocations_ = {};
        this.attribLocations_ = {};
        this.quadVertexBuffer_ = gl.createBuffer();
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVertexBuffer_);

        const vertices = new Float32Array(
            [-1.0, -1.0, 0.0, 1.0,
            +1.0, -1.0, 1.0, 1.0,
            -1.0, +1.0, 0.0, 0.0,
            1.0, +1.0, 1.0, 0.0
            ]);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);


        // init shaders

        gl.attachShader(this.program_, this.vertexShader_);
        gl.attachShader(this.program_, this.fragmentShader_);
        gl.bindAttribLocation(this.program_, 0, 'vert');
        gl.linkProgram(this.program_);
        gl.useProgram(this.program_);
        gl.enableVertexAttribArray(0);

        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);

        let count = gl.getProgramParameter(this.program_, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < /** @type {number} */(count); i++) {
            const info = gl.getActiveUniform(this.program_, i);

            if (!info) continue;

            const result = gl.getUniformLocation(this.program_, info.name);
            this.uniformLocations_[info.name] = result;
        }

        count = gl.getProgramParameter(this.program_, gl.ACTIVE_ATTRIBUTES);
        for (let i = 0; i < /** @type {number} */(count); i++) {
            const info = gl.getActiveAttrib(this.program_, i);

            if (!info) continue;

            const result = gl.getAttribLocation(this.program_, info.name);
            this.attribLocations_[info.name] = result;
        }

    };

    /**
    * Compiles a GLSL shader and returns a WebGLShader.
    * @param {string} shaderSource The shader source code string.
    * @param {number} type Either VERTEX_SHADER or FRAGMENT_SHADER.
    * @return {WebGLShader} The new WebGLShader.
    * @private
    */
    compileShader_ = (shaderSource: string, type: number) => {
        const gl = this.gl_;
        const shader = gl.createShader(type)!;
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);
        return shader;
    };

    /**
    * @type {string}
    * @private '  gl_FragColor = texture2D(texSampler, v_texCoord);',
    */
    static fragmentShaderSource_ = [
        'precision highp float;',
        'uniform sampler2D texSampler;',
        'uniform vec4 control;',
        'varying vec2 v_texCoord;',
        'void main() {',
        '  vec4 c;',
        '  c = texture2D(texSampler, v_texCoord);',
        '  if (control.x > 0.0)',
        '  {',
        '   	c.w = 1.0;',
        '  }',
        '	 else if (control.y > 0.0)',
        '	 {',
        '   	c.rgb = c.aaa; c.w = 1.0;',
        '  }',
        '  gl_FragColor = c;',
        '}'
    ].join('\n');

    /**
    * @type {string}
    * @private
    */
    static vertexShaderSource_ = [
        'attribute vec4 vert;',
        'varying vec2 v_texCoord;',
        'void main() {',
        '  gl_Position = vec4(vert.xy, 0.0, 1.0);',
        '  v_texCoord = vert.zw;',
        '}'
    ].join('\n');

    createDxtTexture = (
        dxtData: ArrayBufferView,
        width: number,
        height: number,
        format: number
    ) => {
        const gl = this.gl_;
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.compressedTexImage2D(
            gl.TEXTURE_2D,
            0,
            format,
            width,
            height,
            0,
            dxtData
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //gl.generateMipmap(gl.TEXTURE_2D)
        gl.bindTexture(gl.TEXTURE_2D, null);
        return tex;
    };

    createCompressedTexture = (
        data: ArrayBufferView,
        width: number,
        height: number,
        format: number
    ) => {
        const gl = this.gl_;
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.compressedTexImage2D(
            gl.TEXTURE_2D,
            0,
            format,
            width,
            height,
            0,
            data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //gl.generateMipmap(gl.TEXTURE_2D)
        gl.bindTexture(gl.TEXTURE_2D, null);
        return tex;
    };


    createRgb565Texture = (rgb565Data: ArrayBufferView, width: number, height: number) => {
        const gl = this.gl_;
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGB,
            width,
            height,
            0,
            gl.RGB,
            gl.UNSIGNED_SHORT_5_6_5,
            rgb565Data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //gl.generateMipmap(gl.TEXTURE_2D)
        gl.bindTexture(gl.TEXTURE_2D, null);
        return tex;
    };

    drawTexture = (
        texture: WebGLTexture | null,
        width: number,
        height: number,
        mode: number
    ) => {
        const gl = this.gl_;
        // draw scene
        gl.clearColor(0, 0, 0, 1);
        gl.clearDepth(1.0);
        gl.viewport(0, 0, width, height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(this.uniformLocations_.texSampler, 0);

        let x = 0.0;
        let y = 0.0;
        if (mode === 1) x = 1.0;
        else if (mode === 2) y = 1.0;

        gl.uniform4f(this.uniformLocations_.control, x, y, 0.0, 0.0);

        gl.enableVertexAttribArray(this.attribLocations_.vert);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVertexBuffer_);
        gl.vertexAttribPointer(this.attribLocations_.vert, 4, gl.FLOAT,
            false, 0, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    
    waitUntilDrawCallFinished = () => {
        const gl = this.gl_;
        gl.finish();
    }

    takeSnapshotWithCanvas2D = () => {
        const gl = this.gl_;

        const pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
        gl.readPixels(
            0, 
            0, 
            gl.drawingBufferWidth, 
            gl.drawingBufferHeight, 
            gl.RGBA, 
            gl.UNSIGNED_BYTE, 
            pixels
        );

        const canvas = document.createElement('CANVAS') as HTMLCanvasElement;
        canvas.width = gl.drawingBufferWidth;
        canvas.height = gl.drawingBufferHeight;

        const imageData = new ImageData(gl.drawingBufferWidth, gl.drawingBufferHeight);
        imageData.data.set(pixels, 0);

        const ctx = canvas.getContext('2d')!;
        ctx.putImageData(imageData, 0, 0);

        return new Promise((resolve) => {
            canvas.toBlob((blob) => resolve(blob), 'image/png')
        })
    }
}