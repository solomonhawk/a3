varying vec3 vVertexColor;
					
#ifdef USE_TEXTURE 
	varying vec2 vVertexUV;
#endif

#ifdef USE_ENVMAP
	varying vec3 vVertexRef;
#endif
					
CHUNK[Lighting]

void main() {

	vec3 aVertEyeNormal			= normalize(uNormalMatrix * aVertNormal);
	vec3 lightDiffuseColor		= uAmbientLightColor;
	vec3 lightSpecularColor		= vec3(0.0);
	vec4 aWorldVertexPosition	= uModelViewMatrix * vec4(aVertPosition, 1.0);
	
	#ifdef USE_TEXTURE 
		vVertexUV = aVertUV;
	#endif 
	#ifdef USE_ENVMAP
		vVertexRef = reflect(normalize(aWorldVertexPosition.xyz - uEyePosition), aVertEyeNormal);
	#endif
	
	CHUNK[LightingCalls]
	
	vVertexColor	= lightSpecularColor + (aVertColor * lightDiffuseColor);
	gl_Position		= uProjectionMatrix * aWorldVertexPosition;
}