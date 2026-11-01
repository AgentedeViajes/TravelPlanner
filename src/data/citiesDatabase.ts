/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CityPreset {
  cityName: string;
  country: string;
  lat: number;
  lng: number;
  description: string;
  popularExcursions: string[];
}

export const POPULAR_CITIES: CityPreset[] = [
  // Europa
  {
    cityName: "Madrid",
    country: "España",
    lat: 40.4168,
    lng: -3.7038,
    description: "Capital vibrante de España, renombrada por sus bulevares elegantes, amplios parques como El Retiro y ricos repositorios de arte europeo como el Museo del Prado.",
    popularExcursions: ["Visita panorámica y Palacio Real", "Excursión a Toledo", "Museo del Prado y Parque del Retiro"]
  },
  {
    cityName: "Barcelona",
    country: "España",
    lat: 41.3851,
    lng: 2.1734,
    description: "Ciudad cosmopolita en la costa mediterránea, famosa por la deslumbrante arquitectura modernista de Antoni Gaudí, su animada Rambla y su gastronomía catalana.",
    popularExcursions: ["Basílica de la Sagrada Familia y Park Güell", "Paseo por el Barrio Gótico y Born", "Excursión a Montserrat"]
  },
  {
    cityName: "Sevilla",
    country: "España",
    lat: 37.3891,
    lng: -5.9845,
    description: "Cuna del flamenco y corazón de Andalucía, cautiva con el Real Alcázar, la majestuosa Plaza de España y la imponente Catedral con su Giralda.",
    popularExcursions: ["Real Alcázar y Catedral de Sevilla", "Espectáculo flamenco en Triana", "Paseo en barco por el Guadalquivir"]
  },
  {
    cityName: "París",
    country: "Francia",
    lat: 48.8566,
    lng: 2.3522,
    description: "La Ciudad de la Luz, epicentro mundial del arte, la moda y la gastronomía, con icónicos monumentos a lo largo del Río Sena y el encanto bohemio de Montmartre.",
    popularExcursions: ["Torre Eiffel y crucero por el Sena", "Museo del Louvre y Sainte-Chapelle", "Palacio y Jardines de Versalles"]
  },
  {
    cityName: "Niza",
    country: "Francia",
    lat: 43.7102,
    lng: 7.2620,
    description: "Joya resplandeciente de la Costa Azul francesa, célebre por la emblemática Promenade des Anglais, su mar turquesa y su cautivador casco histórico.",
    popularExcursions: ["Paseo por la Promenade des Anglais y Casco Antiguo", "Excursión a Mónaco y Montecarlo", "Visita a Cannes y Èze"]
  },
  {
    cityName: "Roma",
    country: "Italia",
    lat: 41.9028,
    lng: 12.4964,
    description: "La Ciudad Eterna despliega casi tres milenios de historia e influencia artística, desde el Coliseo y los Foros Imperiales hasta la monumental Ciudad del Vaticano.",
    popularExcursions: ["Coliseo, Foro Romano y Palatino", "Museos Vaticanos y Basílica de San Pedro", "Fontana di Trevi y Plazas romanas iluminadas"]
  },
  {
    cityName: "Florencia",
    country: "Italia",
    lat: 43.7696,
    lng: 11.2558,
    description: "Cuna del Renacimiento italiano, hogar de inmortales obras maestras de Miguel Ángel, el Puente Vecchio sobre el río Arno y la cúpula de Brunelleschi.",
    popularExcursions: ["Galería Uffizi y David de Miguel Ángel", "Catedral de Santa María del Fiore", "Excursión a la Toscana (Siena y San Gimignano)"]
  },
  {
    cityName: "Venecia",
    country: "Italia",
    lat: 45.4408,
    lng: 12.3155,
    description: "Única en el mundo, construida sobre más de 100 pequeñas islas en una laguna del Adriático, con sus mágicos canales, góndolas y la suntuosa Plaza San Marcos.",
    popularExcursions: ["Paseo tradicional en góndola por el Gran Canal", "Plaza y Basílica de San Marcos con Palacio Ducal", "Excursión a las islas de Murano y Burano"]
  },
  {
    cityName: "Londres",
    country: "Reino Unido",
    lat: 51.5074,
    lng: -0.1278,
    description: "Metrópolis global cargada de historia imperial, palacios reales, museos de talla internacional, teatros en el West End y los legendarios autobuses de dos pisos.",
    popularExcursions: ["Torre de Londres y Tower Bridge", "Museo Británico y Palacio de Buckingham", "Excursión a Stonehenge y Windsor"]
  },
  {
    cityName: "Ámsterdam",
    country: "Países Bajos",
    lat: 52.3676,
    lng: 4.9041,
    description: "Famosa por su patrimonio artístico, su intrincado sistema de canales clasificados por la UNESCO, sus casas estrechas con fachadas a dos aguas y cultura ciclista.",
    popularExcursions: ["Crucero por los canales y Barrio Jordaan", "Museo Van Gogh y Rijksmuseum", "Excursión a Zaanse Schans (Molinos de viento)"]
  },
  {
    cityName: "Praga",
    country: "República Checa",
    lat: 50.0755,
    lng: 14.4378,
    description: "La Ciudad de las Cien Torres, que deslumbra con su Plaza de la Ciudad Vieja, el histórico Reloj Astronómico, el Puente de Carlos y el inmenso Castillo de Praga.",
    popularExcursions: ["Castillo de Praga y Callejón del Oro", "Caminata histórica por el Puente de Carlos y Malá Strana", "Paseo nocturno con cena en barco"]
  },
  {
    cityName: "Viena",
    country: "Austria",
    lat: 48.2082,
    lng: 16.3738,
    description: "Elegante capital imperial sobre el Danubio, célebre por su tradición de música clásica, sus palacios barrocos como Schönbrunn y sus tradicionales cafés vieneses.",
    popularExcursions: ["Palacio Imperial de Schönbrunn", "Recorrido por la Ringstrasse y Ópera de Viena", "Palacio Belvedere y obras de Klimt"]
  },
  {
    cityName: "Lisboa",
    country: "Portugal",
    lat: 38.7223,
    lng: -9.1393,
    description: "Fascinante ciudad costera asentada sobre siete colinas, famosa por sus tranvías amarillos, los barrios de Alfama y Chiado, los pastéis de Belém y su melancólico fado.",
    popularExcursions: ["Torre de Belém y Monasterio de los Jerónimos", "Recorrido en tranvía 28 por Alfama", "Excursión a Sintra y Palacio da Pena"]
  },
  {
    cityName: "Atenas",
    country: "Grecia",
    lat: 37.9838,
    lng: 23.7275,
    description: "Corazón de la antigua Grecia, una poderosa civilización e imperio, dominada por monumentos del siglo V a.C. como la Acrópolis y el Partenón.",
    popularExcursions: ["Acrópolis, Partenón y Nuevo Museo de la Acrópolis", "Paseo por el pintoresco barrio de Plaka", "Crucero de un día por las islas de Hydra, Poros y Egina"]
  },
  {
    cityName: "Estambul",
    country: "Turquía",
    lat: 41.0082,
    lng: 28.9784,
    description: "Puente fascinante entre Europa y Asia que cruza el Estrecho del Bósforo, fusionando mezquitas imperiales, el Gran Bazar y palacios de sultanes otomanos.",
    popularExcursions: ["Santa Sofía, Mezquita Azul y Palacio Topkapi", "Crucero por el Bósforo", "Compras en el Gran Bazar y Bazar de las Especias"]
  },

  // América del Sur
  {
    cityName: "Buenos Aires",
    country: "Argentina",
    lat: -34.6037,
    lng: -58.3816,
    description: "La París de Sudamérica, cautivante capital del tango y la cultura, con barrios llenos de personalidad como San Telmo, Recoleta y Puerto Madero.",
    popularExcursions: ["City tour histórico y Barrios Porteños", "Noche de Cena & Show de Tango en San Telmo", "Día de campo en estancia gaucha y navegación en Tigre"]
  },
  {
    cityName: "El Calafate",
    country: "Argentina",
    lat: -50.3379,
    lng: -72.2648,
    description: "Puerta de entrada al majestuoso Parque Nacional Los Glaciares en la Patagonia, hogar del imponente y estruendoso Glaciar Perito Moreno.",
    popularExcursions: ["Glaciar Perito Moreno con pasarelas y safari náutico", "Navegación Ríos de Hielo (Glaciares Upsala y Spegazzini)", "Minitrekking sobre el hielo del Perito Moreno"]
  },
  {
    cityName: "Ushuaia",
    country: "Argentina",
    lat: -54.8019,
    lng: -68.3030,
    description: "La Ciudad del Fin del Mundo, en el extremo austral de la Tierra del Fuego, rodeada por los montes Martial y las aguas del mítico Canal Beagle.",
    popularExcursions: ["Parque Nacional Tierra del Fuego y Tren del Fin del Mundo", "Navegación Canal Beagle e Isla de los Lobos", "Excursión en 4x4 a Lagos Fagnano y Escondido"]
  },
  {
    cityName: "Bariloche",
    country: "Argentina",
    lat: -41.1335,
    lng: -71.3103,
    description: "Paraíso de lagos cristalinos y montañas de los Andes, famoso por su arquitectura alpina de madera, exquisitos chocolates y el Parque Nacional Nahuel Huapi.",
    popularExcursions: ["Circuito Chico y Cerro Campanario", "Navegación a Isla Victoria y Bosque de Arrayanes", "Excursión a San Martín de los Andes por el Camino de los 7 Lagos"]
  },
  {
    cityName: "Iguazú",
    country: "Argentina",
    lat: -25.5985,
    lng: -54.5755,
    description: "Una de las Siete Maravillas Naturales del Mundo, un conjunto descomunal de 275 saltos de agua en plena selva subtropical, culminando en la Garganta del Diablo.",
    popularExcursions: ["Cataratas del Iguazú lado argentino y Garganta del Diablo", "Cataratas lado brasileño y Parque de las Aves", "Gran Aventura: paseo náutico bajo los saltos"]
  },
  {
    cityName: "Mendoza",
    country: "Argentina",
    lat: -32.8895,
    lng: -68.8458,
    description: "Capital internacional del vino Malbec, emplazada al pie de la Cordillera de los Andes, destacada por sus bodegas de vanguardia y gastronomía de autor.",
    popularExcursions: ["Tour de bodegas en Valle de Uco con almuerzo maridado", "Excursión de Alta Montaña al Aconcagua y Puente del Inca", "Termas de Cacheuta"]
  },
  {
    cityName: "Salta",
    country: "Argentina",
    lat: -24.7821,
    lng: -65.4232,
    description: "La Linda, cautivadora provincia colonial en el Noroeste Argentino, distinguida por sus peñas folclóricas, cerros multicolor y gastronomía regional.",
    popularExcursions: ["Quebrada de Humahuaca y Cerro de los Siete Colores", "Excursión a Cachi por la Cuesta del Obispo", "Cafayate y Quebrada de las Conchas"]
  },
  {
    cityName: "Río de Janeiro",
    country: "Brasil",
    lat: -22.9068,
    lng: -43.1729,
    description: "La Ciudad Maravillosa, bendecida por playas legendarias como Copacabana e Ipanema, el Cristo Redentor en el cerro Corcovado y el Pan de Azúcar.",
    popularExcursions: ["Cristo Redentor en Corcovado y Pan de Azúcar", "Tour por las playas de Ipanema, Copacabana y Leblon", "Paseo por Santa Teresa y Escalera de Selarón"]
  },
  {
    cityName: "Santiago de Chile",
    country: "Chile",
    lat: -33.4489,
    lng: -70.6693,
    description: "Moderna metrópolis enmarcada por los picos nevados de los Andes, con vibrantes distritos gastronómicos, viñedos de renombre y museos vanguardistas.",
    popularExcursions: ["City tour panorámico y Cerro San Cristóbal", "Excursión a Valparaíso y Viña del Mar", "Tour y degustación en Viña Concha y Toro"]
  },
  {
    cityName: "Lima",
    country: "Perú",
    lat: -12.0464,
    lng: -77.0428,
    description: "Capital gastronómica de América, que combina su monumental centro colonial declarado Patrimonio de la Humanidad con los acantilados de Miraflores frente al Pacífico.",
    popularExcursions: ["City tour colonial y Museo Larco", "Tour gastronómico y cata de Pisco en Barranco", "Circuito Mágico del Agua y espectáculo de luces"]
  },
  {
    cityName: "Cusco",
    country: "Perú",
    lat: -13.5319,
    lng: -71.9675,
    description: "Antigua capital del Imperio Incaico, una deslumbrante armonía de muros incas milenarios, templos barrocos españoles y coloridos mercados andinos.",
    popularExcursions: ["Excursión de día completo a Machu Picchu en tren", "Valle Sagrado de los Incas (Pisac y Ollantaytambo)", "City Tour Cusco y ruinas de Sacsayhuamán"]
  },

  // Norteamérica y Caribe
  {
    cityName: "Nueva York",
    country: "Estados Unidos",
    lat: 40.7128,
    lng: -74.0060,
    description: "La Gran Manzana, la ciudad que nunca duerme, hogar de Times Square, Central Park, Broadway y los miradores más espectaculares del planeta.",
    popularExcursions: ["Estatua de la Libertad y Ellis Island", "Mirador SUMMIT One Vanderbilt o Empire State", "Paseo por Central Park, 5ta Avenida y show de Broadway"]
  },
  {
    cityName: "Miami",
    country: "Estados Unidos",
    lat: 25.7617,
    lng: -80.1918,
    description: "Vibrante centro de sol, mar, compras y entretenimiento, célebre por su arquitectura Art Decó en South Beach y su contagiosa cultura latina.",
    popularExcursions: ["Paseo en lancha por las mansiones de Biscayne Bay", "Distrito Art Decó de South Beach y Wynwood Walls", "Excursión a los Everglades con avistaje de caimanes"]
  },
  {
    cityName: "Cancún",
    country: "México",
    lat: 21.1619,
    lng: -86.8515,
    description: "El paraíso del Caribe Mexicano, con aguas turquesas y arenas blancas, rodeado de misteriosas ruinas mayas y enigmáticos cenotes en la jungla.",
    popularExcursions: ["Excursión a Chichén Itzá y cenote sagrado", "Parque eco-arqueológico Xcaret", "Catamarán a Isla Mujeres con snorkel"]
  },

  // Asia y otros
  {
    cityName: "Tokio",
    country: "Japón",
    lat: 35.6762,
    lng: 139.6503,
    description: "Asombroso contraste entre rascacielos ultramodernos iluminados con neón y templos ancestrales preservados con serenidad y respeto por las tradiciones.",
    popularExcursions: ["Templo Senso-ji en Asakusa y cruce de Shibuya", "Excursión al Monte Fuji y lago Kawaguchi", "Distrito de Akihabara y Jardines del Palacio Imperial"]
  },
  {
    cityName: "Dubái",
    country: "Emiratos Árabes Unidos",
    lat: 25.2048,
    lng: 55.2708,
    description: "Ciudad de lujo futurista en el desierto, afamada por sus rascacielos descomunales como el Burj Khalifa, islas artificiales y centros comerciales monumentales.",
    popularExcursions: ["Mirador At The Top en Burj Khalifa y fuentes de Dubái", "Safari por las dunas del desierto con cena beduina", "Crucero por Dubai Marina en dhow tradicional"]
  }
];

export function findCityPreset(cityName: string): CityPreset | undefined {
  if (!cityName) return undefined;
  const clean = cityName.trim().toLowerCase();
  return POPULAR_CITIES.find(
    c => c.cityName.toLowerCase() === clean || c.cityName.toLowerCase().includes(clean)
  );
}
