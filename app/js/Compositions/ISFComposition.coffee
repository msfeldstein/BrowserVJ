sketch = """
/*{
  "CREDIT": "by You",
  "CATEGORIES": [
  ],
  "INPUTS": [

    {
        "NAME": "mouseNorm",
        "TYPE":"point2D"
    }
  ]
}*/
void main() {
    vec2 resolution = RENDERSIZE;
    vec2 mouse = mouseNorm / resolution;
  float resolution_length = length(resolution);
  
  float mouse_length = length(mouse * resolution.xy - gl_FragCoord.xy); 
  float mouse_intensity = sin(128.0 * mouse_length / resolution_length);
  
  float static_length = length((resolution.xy / 2.0) - gl_FragCoord.xy);
  float static_intensity = tan(32.0 * static_length / resolution_length);
  
  float intensity = abs(mouse_intensity + static_intensity);
  
  float omega = gl_FragCoord.y / resolution.y;
  vec3 color = vec3(cos(omega), sin(omega), tan(omega));
    
  gl_FragColor = vec4(intensity * color, 1.0);
}
"""

class @ISFComposition extends GLSLComposition
  constructor: (source) ->
    @isf = new ISFParser
    @isf.parse(sketch)
    @fragmentShader = @isf.fragmentShader
    @vertexShader = @isf.vertexShader
    super()
