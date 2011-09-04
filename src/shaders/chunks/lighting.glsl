/**
 * Adds the diffuse component of the light
 */
void addLight(	inout vec3 aDiffuseColor,
				inout vec3 aSpecularColor,
				sLight light,
				vec4 aWorldVertexPosition,
				vec3 aVertEyeNormal,
				vec3 uEyeDirection,
				float diffuseReflection,
				float specularReflection,
				float specularShininess, 
				vec3 specularColor) {
	
	// if it has no type, discard it
	if(light.type == 0) {
		
		return;
		
	} else if(light.type >= 2) {
		
		vec3 lightLocation = light.location;
		vec3 reflectLightDirection = reflect(lightLocation, aVertEyeNormal);
		
		float attenuation = 1.0;
		float specularPower = 1.0;
		
		if(light.type == 4) {
			vec3 lightToVertex = light.location - aWorldVertexPosition.xyz;
			float distance = length(lightToVertex);
			attenuation = max(1.0 - (distance / light.falloff), 0.0);
			
			lightLocation = normalize(lightToVertex);
			reflectLightDirection = reflect(lightLocation, aVertEyeNormal);
		}
		
		specularPower = pow(max(dot(uEyeDirection, reflectLightDirection), 0.0), specularShininess);
		
		// diffuse
		aDiffuseColor += max(dot(aVertEyeNormal, lightLocation), 0.0) * diffuseReflection * light.color * attenuation;
		aSpecularColor += specularColor * specularPower * specularReflection * attenuation;
	}
}