#version 330 core
layout(location = 0) out vec4 FragColour;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_zoom;

// Complex multiply
vec2 cmul(in vec2 c, in vec2 z) {
    return vec2(c.x*z.x-c.y*z.y, c.x*z.y+c.y*z.x);
}

// Brings a complex number to an arbitrary power
vec2 cpow(in vec2 c, in float p) {
    float r = sqrt(c.x*c.x+c.y*c.y);
    float theta = atan(c.y/c.x);
    return pow(r,p)*vec2(cos(p*theta),sin(p*theta));
}

// Determines smooth iteration count for a point in the mandelbrot.
float mandelbrot_smooth_iteration_count(in vec2 c) {
    const float smoothness = 256.0;
    const int max_iteration = 512;
    int iteration = 0;
    vec2 z = vec2(0.0);
    while ( dot(z,z) <= (smoothness*smoothness) && iteration < max_iteration ) {
        z = cpow(z,2)+c; // z = z² + c
        iteration += 1;
    }
    if (iteration == max_iteration) {
        return 0.0;
    }

    float smooth_i = iteration - log2(log2(dot(z,z))) + 4.0;
    return smooth_i;
}

void main() {
    
    const int AA = 2; // Anti-alias
    float aspect_ratio = u_resolution.x/u_resolution.y;
    float detail = 10.0 / (1.0+exp(u_zoom));
    vec2 range = vec2(detail, detail/aspect_ratio);
    vec2 offset = (u_mouse/u_resolution)*2-vec2(1,0);

    vec3 colour = vec3(0.0);
    for (int x = 0; x < AA; x++ ) {
        for (int y = 0; y < AA; y++) {
            vec2 c = (((gl_FragCoord.xy+(vec2(x,y)/AA))/u_resolution.xy))*range - (range/2) + offset;
            float smooth_iter = mandelbrot_smooth_iteration_count(c);
            colour += 0.5 + 0.5*cos(3.0 + smooth_iter*0.15 + vec3(0.0,0.6,1.0));
        }
    }
    colour /= AA*AA;

    
    FragColour = vec4(colour, 1.0);

}
