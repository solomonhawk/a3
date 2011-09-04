varying vec3 vVertexColor;
					
#ifdef USE_TEXTURE 
	varying vec2 vVertexUV;
#endif 

void main() {

	#ifdef USE_TEXTURE 
		vVertexUV = aVertUV;
	#endif 
	
	vVertexColor	= aVertColor;
	gl_Position		= uProjectionMatrix * uModelViewMatrix * vec4(aVertPosition, 1.0);
}