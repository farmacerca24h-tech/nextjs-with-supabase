"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type GuardiaRow = {
  id: number;
  fecha: string;
  localidad: string;
  sector: string;
  direccion: string;
  tipo_guardia: string;
  horario: string;
  titular: string;
  telefono: string;
};

function getFechaGuardiaActivaMadrid(): string {
  const ahora = new Date();
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(ahora);

  const getPart = (t: string) => partes.find((p) => p.type === t)?.value || "00";
  const horaMin = Number(getPart("hour")) * 60 + Number(getPart("minute"));

  // In Málaga, 24h guardias rotate at 09:30; before 09:30 the active shift is yesterday's date
  const refDate = horaMin < 9 * 60 + 30 ? new Date(ahora.getTime() - 86400000) : ahora;
  return refDate.toLocaleDateString("en-CA", { timeZone: "Europe/Madrid" });
}

const TELEFONO_PRUEBA = "34634467345"; // 634467345 para pruebas

// FESTIVOS LOCALES 2026 - BOJA 6/10/2025 + corrección 18/12/2025 (Coín 4/5)
const FESTIVOS_LOCALES: {[key:string]: string[]} = {
  "Málaga": ["19/8", "8/9"],
  "Coín": ["4/5", "1/6"],
  "Guaro": ["18/5", "31/8"],
  "Alhaurín de la Torre": ["20/1", "24/6"],
  "Alhaurín el Grande": ["29/5", "1/6"],
  "Comares": ["12/1", "25/5"],
  "Antequera": ["21/8", "8/9"],
  "Villanueva de Algaidas": ["15/5", "8/9"],
  "Campillos": ["10/7", "17/8"],
  "Jimera de Líbar": ["7/8", "10/8"],
  "Ronda": ["24/1", "3/9"],
  "Yunquera": ["4/6", "7/10"],
  "Montecorto": ["16/7", "16/10"],
  "Pujerra": ["13/6", "3/11"],
  "Faraján": ["10/8", "9/12"],
  "Júzcar": ["19/3", "6/4"],
  "Benadalid": ["27/4", "7/10"],
  "Carratraca": ["17/8", "7/9"],
  "Marbella": ["11/6", "19/10"],
  "Torremolinos": ["16/7", "29/9"],
  "Benalmádena": ["24/6", "16/7"],
  "Benalmádena Costa": ["24/6", "16/7"],
  "Arroyo de la Miel": ["24/6", "16/7"],
  "Fuengirola": ["16/7", "7/10"],
  "Mijas": ["8/9", "15/10"],
  "Mijas Costa": ["8/9", "15/10"],
  "Las Lagunas": ["8/9", "15/10"],
  "Vélez-Málaga": ["24/6", "29/9"],
  "Torre del Mar": ["24/6", "29/9"],
  "Caleta de Vélez": ["24/6", "29/9"],
  "Almayate": ["24/6", "29/9"],
  "Benajarafe": ["24/6", "29/9"],
  "Torre de Benagalbón": ["24/6", "29/9"],
  "Almáchar": ["4/5", "27/7"],
  "Torrox": ["5/8", "2/10"],
  "Nerja": ["15/5", "24/6"],
  "Rincón de la Victoria": ["2/2", "16/7"],
  "Cuevas del Becerro": ["7/1", "31/8"],
  "Pizarra": ["15/5", "19/8"],
  "Campanillas": ["19/8", "8/9"],
  "Álora": ["7/8", "8/9"],
  "Estepona": ["15/5", "16/7"],
  "San Pedro Alcántara": ["11/6", "19/10"],
  "Benahavís": ["17/8", "7/10"],
  "El Burgo": ["6/4", "28/8"],
};
const FESTIVOS_GENERALES = ["1/1","6/1","28/2","2/4","3/4","1/5","15/8","12/10","2/11","7/12","8/12","25/12"];

const FARMACIAS: string[][] = [
["AGUILAR HURTADO FELISA - HURTADO AGUILAR INMACULADA","Málaga","C/. TOMÁS HEREDIA, 23 - 29001"],
["LEDRO CARABAÑO BLANCA","Málaga","PASEO MARÍTIMO ANTONIO MACHADO, 60 - 29002"],
["MUÑOZ ESTRADA CARMEN","Málaga","AVDA. SOR TERESA PRAT, 54 - 29003"],
["CASTRO NOGALES MANUEL DE","Málaga","CARRIL DEL PATO, 21 EDIFICIO LAS PIRAMIDES - 29004"],
["FAJARDO PAREDES PALOMA CRISTINA","Málaga","C/. PICO DE LAS PALOMAS, 14-16 - 29004"],
["RICO NESTARES MARIA CRISTINA","Málaga","PUERTA DEL MAR NUM. 5 Y 7 - 29005"],
["ABAURRE LABRADOR MARÍA STELA","Málaga","AVDA. ORTEGA Y GASSET, 90 - 29006"],
["JURADO RUIZ ELVIRA PATRICIA - RUIZ LOBATO Mª ÁNGELES","Málaga","C/. HORACIO LENGO, 19 - 29006"],
["GARCÍA DELGADO PILAR","Málaga","AV. JOSE ORTEGA Y GASSET, 109 - 29006"],
["CHACÓN AGUILAR ISABEL","Málaga","CAPITÁN HUELIN, 40 - 29007"],
["RODRÍGUEZ SIERRAS FRANCISCO JOSÉ","Málaga","C/. DON JUAN DE AUSTRIA, 22 - 29009"],
["ARTACHO REINOSO Mª PRESENTACION Y Mª ELENA","Málaga","C/. NAVARRO LEDESMA Nº 156 (ESQ. AURORA ALBORNOZ) - 29010"],
["RUBIO RUIZ EMILIO - GONZALEZ BALBOA ÁGUEDA","Málaga","C/ ORSON WELLES, 8 - 29010"],
["ZAMORANO TORO MARÍA INMACULADA","Málaga","C/. POETA XIMÉNEZ MOLINA, 1 BDA. SAN MARTIN - 29010"],
["SÁNCHEZ COBOS CONCEPCIÓN","Málaga","AV. JOSÉ RIBERA 16, COLONIA STA. INES - 29010"],
["GALLARDO DE LA CUEVA MATILDE","Málaga","AVENIDA CARLOS HAYA, 105 - 29010"],
["ROMERO SÁNCHEZ JAVIER MANUEL","Málaga","CAMINO DE SUAREZ, 33 - 29010"],
["MUÑOZ FERNÁNDEZ ELISA","Málaga","C/. MESONERO ROMANOS, 2 - 29010"],
["RICO NESTARES MARIA CONCEPCIÓN","Málaga","C/. ANTÍGONA Nº 1 LCAL. 18 Y 19 - 29010"],
["CAPITÁN CAÑADAS IGNACIO PLAZA DE LOS VERDIALES, 6","Málaga","CAPITÁN CAÑADAS IGNACIO PLAZA DE LOS VERDIALES, 6 - 29011"],
["AVILA SAEZ MARIA TERESA","Málaga","C/. MARTINEZ BARRIONUEVO Nº 2 - 29013"],
["TUDELA VON SCHMITERLOW JAVIER","Málaga","C/. EMILIO THUILLER, 68 - 29014"],
["MOLINA SÁNCHEZ Mª JOSEFA - MOLIZ MOLINA Mª JOSEFA","Málaga","AVENIDA DE PRIES, 2 - 29016"],
["JIMENEZ SOTO MARTA","Málaga","AV. JUAN SEBASTIÁN ELCANO Nº 2 - 29017"],
["VELASCO LASARTE GUILLERMO","Málaga","AV. JUAN SEBASTIAN ELCANO, 127 - 29017"],
["ESPINOSA GONZALEZ LUIS Y MARTA","Málaga","C/. VILLAFUERTE NUM. 35 - 29017"],
["HERNANDEZ RAMIREZ MANUEL","Málaga","C/. ORTEGA MUNILLA NUM. 13 - 29017"],
["MERIDA AGUILERA IRENE CARLOTA","Málaga","AVDA. JUAN SEBASTIAN ELCANO, 145 - 29017"],
["VILLAFRANCA DE PORRAS Mª CARMEN - RUIZ VILLAFRANCA Mª CARMEN","Málaga","CARRETERA DE ALMERIA, 62 - 29018"],
["CASTRO NOGALES Mª DEL CARMEN DE","Málaga","AV. HERNÁN NÚÑEZ DE TOLEDO Nº 2 - 29018"],
["MUÑOZ JIMÉNEZ JOSÉ LUIS","Coín","C/. BARTOLOMÉ ABELENDA, 57 - 29100"],
["GARCÍA VÁZQUEZ RAFAEL - GARCÍA MALDONADO RAFAEL","Coín","C/. FERIA, 6 - 29100"],
["BARRIS BLUNDELL DAMIÁN","Coín","AVENIDA REINA SOFÍA EDIFICIO LAS PALMERAS I - 29100"],
["CORDOBES MONTES MARIA VICTORIA","Guaro","AV. ANDALUCIA Nº 67 - 29108"],
["MARTÍNEZ SASTRE FELICIDAD ARACELI","Alhaurín el Grande","CAMINO DE MÁLAGA, 105 - 29120"],
["RECIO LLAMAS ANTONIO","Alhaurín de la Torre","AVENIDA DEL MAR, 5 - URB. RETAMAR 1ª FASE - 29130"],
["OLIVA PONCE MARÍA JOSÉ","Alhaurín de la Torre","C/ CIGÜEÑA, 51 - URB. EL ROMERAL - 29130"],
["CANTERO ANGULO JUAN JOSÉ","Alhaurín de la Torre","URBANIZACIÓN EL ALAMILLO, LOCAL 2 - 29130"],
["RODULFO FLORES IRENE A. - RODULFO FLORES JUAN DIEGO","Málaga","C/ LOPE DE RUEDA, 175 - 29190"],
["RAYA GARCIA SUSANA","Comares","C/ ALCALDE BAEZ RANEA NUM. 6 - 29195"],
["PÉREZ FALCON JOSE","Antequera","C/. CAMPILLO BAJO S/N. - 29200"],
["MOLINA PÉREZ MARÍA JOSÉ","Villanueva de Algaidas","C/ GRANADA, 7 - 29310"],
["LORA SERRANO SOFIA","Campillos","AV. DE LA CONSTITUCION ED. LOS RUEDOS - 29320"],
["GONZÁLEZ CARO Mª CARMEN","Campillos","C/. ALTA, 30 - 29320"],
["PALACIO LÓPEZ JUAN MANUEL","Jimera de Líbar","C/. SAN BARTOLOMÉ, 3 - 29392"],
["SANTOS ZAFRA FERNANDA","Ronda","PLAZA DE ESPAÑA, 5 - 29400"],
["ORDÓÑEZ JIMÉNEZ MANUEL","Ronda","C/. SEVILLA, 34-36 - 29400"],
["LOPEZ JIMENEZ Mª NIEVES - ARIAS PEREZ JULIO","Yunquera","C/ ALFAGUARA NUM. 8. - 29410"],
["MEDINA GONZALEZ J MANUEL","Montecorto","AVDA DE LA CONSTITUCION NUM 1 - 29430"],
["CUADRADO BORREGO LEOPOLDO","Pujerra","C/. MARÍA MATEO S/N - 29450"],
["SANTOS DEL RÍO JUAN MIGUEL","Faraján","C/ CORCHUELO, 19 - 29461"],
["TABUYO ENRÍQUEZ PILAR","Júzcar","C/ CARAILA, 5 - 29462"],
["SANCHEZ ASTORGA MANUEL","Benadalid","C/ PUENTE Nº 1 - 29493"],
["FLORIDO ALBA FRANCISCO JAVIER","Carratraca","C/. ANTONIO RIOBOO, 20 - 29551"],
["TERNERO CARO MACARENA","Marbella","AV. ANTONIO BELÓN, 3 ESQ. C/ PADRE JOSÉ VERA - 29600"],
["MARCO PARRAS TOMÁS","Marbella","C/. PINSAPO, 8 - 29600"],
["JIMÉNEZ GÓMEZ FRANCISCO JAVIER - JIMENEZ RODRIGUEZ FRANCISCO JAVIER","Marbella","PLAZA PUENTE DE MALAGA - 29600"],
["MINGORANCE GUTIÉRREZ ANTONIO","Marbella","AVDA. RICARDO SORIANO, 44 - 29600"],
["GARCÍA LÓPEZ ANTONIO CÉSAR","Torremolinos","C/ DOCTORES UBALDO DELGADO, 4 - 29620"],
["HERMOSO MESA GUADALUPE","Torremolinos","C/ BELICE, 1 - 29620"],
["BUHIGAS AGUILERA MARTA","Torremolinos","C/ MADAME BOVARY Nº 25 EL PINILLO - 29620"],
["MARTÍN JIMÉNEZ MARÍA TERESA","Torremolinos","C/. SALVADOR ALLENDE, 27 - 29620"],
["ROMERO MUÑOZ JUAN MANUEL","Benalmádena","AVDA. JUAN LUIS PERALTA, 4 - 29630"],
["HUELIN BEJARANO MARÍA DOLORES","Benalmádena Costa","AVENIDA EUROPA - ED.CASINOMAR LOCAL 14 - 29630"],
["FERNÁNDEZ ÁLVAREZ PABLO","Benalmádena Costa","C/ SAGITARIO, 3 RES. GAMONAL LOCAL 7 - 29630"],
["RUBIO RUBIO VICTORIA EUGENIA","Arroyo de la Miel","AVENIDA DE LA CONSTITUCIÓN, 24 RES. ALMUDENA - 29631"],
["REVERTE BOSQUET ANTONIO","Arroyo de la Miel","C/ LOPE DE VEGA, 62 - 29631"],
["RODRÍGUEZ ZARZUELO Mª CARMEN","Arroyo de la Miel","AVENIDA CIUDAD DE MELILLA CONJ.PLAZA MAYOR 20- 21 - 29631"],
["FERNANDEZ PARDO LUIS ENRIQUE","Arroyo de la Miel","AV. MARE NOSTRUM Nº 3 URB. BELLAVISTA - 29631"],
["GÓMEZ MONTERO LUCÍA","Arroyo de la Miel","JARDINES ALHAMBRA ED. 2, ESQ. C/ ALHAMBRA - 29631"],
["LEON BURGOS MARIA DOLORES","Fuengirola","CAMINO DE COIN NUM. 49 - 29640"],
["QUERO ARCA Mª INMACULADA","Fuengirola","C/ ANTONIO CHENEL ANTOÑETE, 13 - 29640"],
["DOMÍNGUEZ LÓPEZ JOSÉ MANUEL","Fuengirola","C/ TORREMOLINOS, 1 ED. SALINAS HOMES LOCAL 1 - 29640"],
["BALBUENA RUIZ JOSÉ BERNARDO","Mijas Costa","CAMINO CAMPANALES S/N, ESQ.C/. ANCHA - 29650"],
["DATO ANIORTE MARIA DOLORES","Mijas","SAN BARTOLOME, 7 (LAS LAGUNAS) - 29650"],
["JIMÉNEZ BOOTELLO ELVIRA LETICIA","Mijas","PLAZA DE LA CONSTITUCIÓN, 13 - 29650"],
["NIEVES MORENO ANTONIO","Mijas","AVDA. MÉXICO Nº 12 - EDIF. MONTEMIJAS BQ. B LOCAL. 3 - 29650"],
["MIRÓN COMAS OLGA - ALBA MOSCOSO JOAQUÍN","Mijas","AVENIDA DE MÉJICO, 37 - 29650"],
["MENA ESCOBAR ROSARIO","Mijas","C/ SAN VALENTÍN, 11 - EDIFICIO PIRAGUA - 29651"],
["SEGURA BELMONTE MARÍA DEL CARMEN","Mijas","C/. LA UNIÓN, 17 (LAS LAGUNAS) - 29651"],
["DIEZ RODRIGUEZ MONICA","San Pedro Alcántara","AV. DE LA CONSTITUCION Nº 7 - 29670"],
["GUIRADO SÁNCHEZ ENRIQUE","Vélez-Málaga","C/ LOPE DE VEGA, 5 - 29700"],
["SEOANE AMADO MARÍA DE LA SIERRA","Vélez-Málaga","C/ MOLINO DE VELASCO, 7 - 29700"],
["TÉLLEZ GÁMEZ JOSÉ FRANCISCO","Almáchar","PASEO DE LA AXARQUIA, 9 - 29718"],
["DIAZ VERDEJO ROSA MARIA","Almayate","MAESTRANZA, 17 (CONJ. EL LLANO) - 29749"],
["FERNÁNDEZ CASTRO CELESTINO IGNACIO","Torrox","C/. BALTASAR MÁRQUEZ, 2 - 29770"],
["PALLARÉS VALDÉS ISABEL","Nerja","C/ ANTONIO FERRANDIS, 3 LOCAL 2 - 29780"],
["GONZÁLEZ ESPINOSA MARÍA JOSÉ","Benajarafe","CARRETERA MÁLAGA-ALMERÍA, 124 - 29790"],
["Perez Garcia","Antequera","Calle Peñuelas, 13 - 29200"],
["Rosa María Maeso Ortega Rosario María Luque Moreno","Arroyo de la Miel","Avenida Cerro del Viento, 1 - 29631"],
["Francisco Avila Cortes","Rincón de la Victoria","Calle Geranio, 10 BAJO - 29730"],
["Dr. Smoke","Benalmádena Costa","Avenida Antonio Machado, 18 - 29630"],
["Farmacia Norte","Marbella","Avenida Pablo Ruiz Picasso, 66 - 29601"],
["Farmacia María Belén Hernández Carmona","Estepona","Calle Josefina Samper, S/N - 29680"],
["Farmacia Paredes","Málaga","Calle Frigiliana, 35 - 29003"],
["Benjamin Mezcua Guzman Sl","Málaga","Calle Marqués de Larios, 38 - 29005"],
["Farmacia Estrella Del Mar","Benalmádena Costa","Avenida Estrella del Mar, 18 BENALMADENA, MALAGA - 29630"],
["Farmacia Costa Lago","Torremolinos","Calle Ob. Juan Alonso, 3 TORREMOLINOS, MALAGA - 29620"],
["Farmacia Santa María","Rincón de la Victoria","Avenida de Málaga, 36 BAJO;ED. SANTAMARIA - 29720"],
["Pharmafirmas Sl","Torre de Benagalbón","Calle Ceuta, 8 BAJO - 29738"],
["Mercedes Manrique Ortiz","Torremolinos","Calle Casablanca, 11 BAJO;FARMACIA - 29620"],
["Farmacia Soliva Teatinos 365 Días","Málaga","Avenida Escritor Antonio Soler, 19 - 29010"],
["Farmacia Encarnación Carrión","Málaga","Calle Virgen de la Fuensanta, 17 - 29006"],
["Farmacia Amiga Puerto De La Torre","Málaga","Calle Pirita, 12 MALAGA, MALAGA - 29190"],
["Farmacia Martinez Y Nieto S.C.","Málaga","Calle La Defensa, 15 - 29011"],
["MARÍA CONCEPCIÓN RICO NESTARES","Málaga","Antígona, 1 BAJO - 29010"],
["Farmacia Mª Teresa Guerrero","Cuevas del Becerro","Avenida de las Escuelas BAJO - 29470"],
["Farmacia Mata","Málaga","Calle Marqués de Larios, 8 - 29005"],
["Farmacia Del Sagrario","Málaga","Calle Santa María, 29 - 29015"],
["Farmacia Central","Torre del Mar","Mar, 24 BAJO - 29740"],
["La Farmacia De La Plaza","Pizarra","Pl. Ayuntamiento, 7 - 29560"],
["Farmacia Hervás C.B.","Málaga","Avenida Guindos, 29 - 29004"],
["Farmacia Fuente Olletas","Málaga","Calle Cristo de la Epidemia, 99 (DISTRITO CTRO) - 29013"],
["Farmacia Vazquez Rubio","Málaga","Calle Marqués de Cádiz, 60 - 29013"],
["ANA GONZÁLEZ RODRÍGUEZ","Málaga","Juan Montes Hoyo, 20 BAJO(LOCAL) - 29014"],
["Farmacia Pinosol","Málaga","Calle San Lázaro, 1 - 29012"],
["Encarnación de la Linde Palomino","Málaga","Blas de Lezo, 25 BAJO - 29011"],
["Loli","Málaga","Calle Almería, 44 - 29017"],
["Farmacia Nueva Gamarra","Málaga","Calle RIVAS FERNÁNDEZ, 16 Bailén-Miraflores - 29010"],
["FARMACIA TORRE DEL CARMEN","Málaga","Canales, 2 BAJO - 29002"],
["Farmacia Gallego Garnica","Málaga","Avenida Paloma, 38 BAJO - 29003"],
["Farmacia María José Del Río Pérez-Piaya","Málaga","Avenida Paloma, 8 BAJO - 29003"],
["Farmacia Garvi","Torremolinos","Calle Cuba, 10 - 29620"],
["Farmacia Montemar Alto C.B.","Torremolinos","Decano Miguel Marengo, 7 BAJO - 29620"],
["Farmacia Entrepinos","Torremolinos","Calle Miguel Fernández Alcauza, 2 - 29620"],
["Farmacia Próxima Portada Alta","Málaga","Calle Castilla, S/N 0 - 29007"],
["Farmacia Laza García","Rincón de la Victoria","Avenida del Mediterráneo, 93 BAJO - 29730"],
["Farmacia Málaga 15","Alhaurín de la Torre","Calle Málaga, 15 - 29130"],
["Farmacia Capellanía","Alhaurín de la Torre","Calle Andrés Segovia, S/N - 29130"],
["Farmacia Store Málaga","Alhaurín el Grande","Plaza Mayor, 6 LOCAL - 29570"],
["Farmacia Canales Garcia","Campanillas","Calle José Calderón, 48 - 29590"],
["FARMACIA COSTA DEL SOL","Benalmádena Costa","Avenida Antonio Machado, 12 BENALMADENA, MALAGA - 29630"],
["Farmacia Tivoli","Arroyo de la Miel","Avenida Cerro del Viento, 1 - 29631"],
["Farmacia Los Lirios","Las Lagunas","Avenida Lirios, 39 - 29651"],
["Farmacia Internacional Fuengirola","Fuengirola","Avenida Acapulco, 9 - 29640"],
["Farmacia Nieves Lopez Y Julio Arias Cb","Yunquera","Calle Alfaguara, 18 - 29410"],
["Farmacia Mª Angeles Bailén","Pizarra","Calle Lealtad, S/N - 29560"],
["Farmacia Cerralba","Pizarra","Ronda Este, 38 BAJO(FARMACIA) - 29569"],
["Farmacia García y Juárez","Álora","Calle del Valle, 1 (BARRIADA DEL PUENTE) - 29510"],
["Mesa Farmacia","Álora","Avenida Cervantes, 13 - 29500"],
["Farmacia Cáliz Caracuel","Álora","Plaza Fuente Arriba, 21 - 29500"],
["Farmacia Pérez Banderas","Álora","Calle Feria s/n - 29500"],
["FARMACIA CALETA DE VÉLEZ PALOMA LUQUE","Caleta de Vélez","Avenida Andalucía, 112 BAJO - 29751"],
["Farmacia Dr. Buruaga C.B.","Nerja","Plaza Balcón de Europa, 1 - 29780"],
["Farmacia Jorge Rojo","Torre del Mar","Avenida Dr. Marañón, 8 BAJO - 29740"],
["Farmacia Béjar","Arroyo de la Miel","Urbanización Béjar II, S/N LOCAL 15 - 29631"],
["Farmacia El Higuerón ( 365 Días, 13 Horas)","Benalmádena","Avenida Retamar C.C. Altos del Higuerón - 29639"],
["Farmacia Zarzuelo","Benalmádena Costa","Avenida Ciudad de Melilla, 20 - 29630"],
["Farmacia Las Castañetas","Campanillas","Calle Redoble, 13, Bajo (Las Castañetas) - 29590"],
["Farmacia Castro Jaén","Málaga","Calle Navarro Ledesma, S/N - 29010"],
["Farmacia Mesa","Campillos","Calle Real, 13 BAJO - 29320"],
["Farmacia Sánchez Gavilán C.B.","Riogordo","Calle Pozo, 24 - 29180"],
["Farmacia Ángeles Rivera","Marbella","Calle San Bernabé, 1 BAJO - 29603"],
["Farmacia Homeopharma Cb","Marbella","Avenida Ricardo Soriano, 27 BAJO;EDI.ALTAMIRA II - 29601"],
["Farmacia Berdaguer C.B.","Marbella","Avenida Ricardo Soriano, 4 EDIF. ZELIM - 29601"],
["Farmacia Mingorance Gutiérrez","Marbella","Avenida Ricardo Soriano, 44 - 29601"],
["Farmacia Ldo. Aurelio Gonzalez","San Pedro de Alcántara","Avenida Pablo Ruiz Picasso, 27 BAJO - 29670"],
["Farmacia Terraza","Estepona","Calle Terraza, 42 - 29680"],
["Farmacia Puerto Banús","Marbella","Avenida de las Naciones Unidas, 1 (JUNTO HIPERCOR) - 29660"],
["Farmacia Franquelo Cb","Antequera","Calle Infante Don Fernando, 62 - 29200"],
["Farmacia Próxima Parquesol","Antequera","Urbanización Parquesol, 33 - 29200"],
["Farmacia Antequera","Antequera","Calle Lucena, 15 - 29200"],
["Farmacia De La Salud Y Las Aguas","Antequera","Cuesta Real, 53 - 29200"],
["Farmacia Benahavís Cb","Benahavís","Avenida Andalucía, 4 - 29679"],
["Farmacia Raigón Cb","Marbella","Avenida Ricardo Soriano, 64 - 29601"],
["Farmacia Serrano Aznarte Cb","Ronda","Calle Carrera Espinel, 24 - 29400"],
["Farmacia Escalante Bustos Cb","El Burgo","Calle Las Erillas, S/N - 29420"],
["Farmacia Jaboneros","Málaga","AV. HERNÁN NÚÑEZ DE TOLEDO NÚM. 2 (FRENTE A VILLA CRISTINA) - 29018"],
["Farmacia Plaza De La Victoria","Málaga","PZA. DE LA VICTORIA, 11 - 29012"],
["Farmacia Fernández","Ronda","ESPINEL, 38 - 29400"],
];

export default function Page() {
  const [vista, setVista] = useState<"cliente" | "farmacia">("cliente");
  const [localidad, setLocalidad] = useState("");
  const [busquedaCiudad, setBusquedaCiudad] = useState("");
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [diurno, setDiurno] = useState(true);
  const [guardia, setGuardia] = useState(false);
  const [festivo, setFestivo] = useState(false);
  const [texto, setTexto] = useState("");
  const [productos, setProductos] = useState<string[]>([]);
  const [enviado, setEnviado] = useState(false);
  const [respuestas, setRespuestas] = useState<{[key:number]:string}>({});

  const [guardiasReales, setGuardiasReales] = useState<GuardiaRow[]>([]);
  const [cargandoGuardias, setCargandoGuardias] = useState(true);

  useEffect(() => {
    const cargarGuardias = async () => {
      setCargandoGuardias(true);
      const fechaActiva = getFechaGuardiaActivaMadrid();
      const { data, error } = await supabase
        .from("guardias_malaga")
        .select("*")
        .eq("fecha", fechaActiva)
        .order("tipo_guardia", { ascending: true });

      if (!error && data) {
        setGuardiasReales(data as GuardiaRow[]);
      }
      setCargandoGuardias(false);
    };
    cargarGuardias();
  }, []);

  // AUTOMÁTICO: HORA + FESTIVO GENERAL + FESTIVO LOCAL DE LA CIUDAD ELEGIDA
  useEffect(() => {
    const ahora = new Date();
    const hora = ahora.getHours() + ahora.getMinutes() / 60;
    const dia = ahora.getDate() + "/" + (ahora.getMonth() + 1);
    const festivosDeEsaCiudad = FESTIVOS_LOCALES[localidad] || [];
    const esFestivo = FESTIVOS_GENERALES.includes(dia) || festivosDeEsaCiudad.includes(dia);
    if (esFestivo) {
      setFestivo(true); setDiurno(false); setGuardia(true);
    } else if (hora >= 9 && hora < 21.5) {
      setDiurno(true); setGuardia(false); setFestivo(false);
    } else {
      setDiurno(false); setGuardia(true); setFestivo(false);
    }
  }, [localidad]);

  const modoSoloGuardia = guardia && !diurno;

  const localidades = Array.from(
    new Set([
      ...FARMACIAS.map((f) => f[1]),
      ...guardiasReales.map((g) => g.localidad),
    ])
  ).sort();

  const horario =
    [diurno ? "Diurno" : "", guardia ? "De guardia" : "", festivo ? "Festivo" : ""]
      .filter(Boolean)
      .join(", ") || "Diurno";

  const guardiasFiltradas: string[][] = guardiasReales
    .filter((g) => !localidad || g.localidad === localidad)
    .map((g) => [
      g.titular || (g.tipo_guardia === "24H" ? "Farmacia de Guardia 24H" : "Farmacia Horario Ampliado"),
      g.localidad,
      `${g.direccion}${g.sector ? ` (${g.sector})` : ""} • ${g.horario}${g.telefono ? ` • Tel: ${g.telefono}` : ""}`,
    ]);

  const filtradas = modoSoloGuardia
    ? guardiasFiltradas
    : FARMACIAS.filter((f) => !localidad || f[1] === localidad);

  const tres = modoSoloGuardia ? filtradas.slice(0, 10) : filtradas.slice(0, 3);

  // SUGERENCIAS DE CIUDAD MIENTRAS ESCRIBES - sin tildes, no importa mayúsculas
  const normalizar = (s:string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const sugerencias = busquedaCiudad.trim() === ""
    ? localidades
    : localidades.filter(l => normalizar(l).includes(normalizar(busquedaCiudad)));
  const elegirCiudad = (ciudad:string) => {
    setLocalidad(ciudad);
    setBusquedaCiudad(ciudad);
    setMostrarSugerencias(false);
    setEnviado(false);
  };

  const enviar = () => {
    if(!localidad){ alert("Elige primero tu ciudad o pedanía"); return; }
    if(texto.trim()){ setProductos([...productos, texto.trim()]); setTexto(""); }
    setEnviado(true);
    const lista = texto.trim() ? [...productos, texto.trim()] : productos;
    const textoPlano = `Hola, soy FarmaCerca 24h. Cliente en ${localidad} (${horario}) pregunta:\n` + (lista.length ? lista.map(p=>`- ${p}`).join("\n") : `- Consulta general`) + `\nContesta con: TENGO / NO TENGO / BAJO PEDIDO`;
    window.open(`https://wa.me/${TELEFONO_PRUEBA}?text=${encodeURIComponent(textoPlano)}`, "_blank");
  };

  // FARMACIAS CERCANAS - USA LA UBICACIÓN DE GOOGLE MAPS, NO PIDE PERMISO EN TU WEB
  const buscarCercanas = () => {
    setGuardia(false); setDiurno(true);
    if (localidad) {
      // Si has elegido ciudad, busca en esa ciudad
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("farmacias en " + localidad)}`, "_blank");
    } else {
      // Si NO has elegido ciudad, Google Maps usa tu ubicación real "cerca de mí"
      // Así no sale el aviso de Chrome ni te manda a Málaga por defecto
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("farmacias cerca de mi")}`, "_blank");
    }
  };

  // FARMACIAS DE GUARDIA - TAMBIÉN ABRE GOOGLE MAPS
  const buscarGuardia = () => {
    setGuardia(true); setDiurno(false);
    if (localidad) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("farmacia de guardia en " + localidad)}`, "_blank");
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("farmacia de guardia cerca de mi")}`, "_blank");
    }
  };

  return (
    <main style={{ maxWidth: 480, width: "100%", margin: "0 auto", padding: 12, fontFamily: "sans-serif", background: "#fff", boxSizing: "border-box", overflowX: "hidden" }}>
      {/* HEADER - ARREGLADO PARA MÓVIL, YA NO SE SALE */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%", boxSizing: "border-box" }}>
        <img src="/logo.png" alt="Farmacerca 24h - A un mensaje de ti" style={{ height: "80px", width: "auto", maxWidth: "100%", display: "block" }} />
        <button onClick={()=>alert("Para descargar el acceso directo: en tu móvil pulsa Compartir y luego Añadir a pantalla de inicio.")} style={{ background: "#0090ff", color: "#fff", border: "none", padding: "12px 12px", borderRadius: 10, fontWeight: "bold", fontSize: 14, width: "100%", boxSizing: "border-box", whiteSpace: "normal", textAlign: "center" }}>⬇ Descargar acceso directo</button>
      </div>

      <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        <button onClick={()=>setVista("cliente")} style={{ flex: 1, padding: 10, borderRadius: 10, background: vista==="cliente" ? "#16a34a" : "#eee", color: vista==="cliente" ? "#fff" : "#000", border: "none", fontWeight: "bold" }}>👤 Soy CLIENTE</button>
        <button onClick={()=>setVista("farmacia")} style={{ flex: 1, padding: 10, borderRadius: 10, background: vista==="farmacia" ? "#0ea5e9" : "#eee", color: vista==="farmacia" ? "#fff" : "#000", border: "none", fontWeight: "bold" }}>🏪 Soy FARMACIA (Prueba)</button>
      </div>

      {vista === "cliente" && (
        <>
          <p style={{ fontWeight: "bold", margin: "8px 0 4px", fontSize: 18 }}>Elige:</p>
          {/* BUSCADOR DE CIUDAD CON SUGERENCIAS */}
          <div style={{ position: "relative", width: "100%" }}>
            <input
              value={busquedaCiudad}
              onChange={(e)=>{ setBusquedaCiudad(e.target.value); setMostrarSugerencias(true); if(e.target.value===""){ setLocalidad(""); } }}
              onFocus={()=>setMostrarSugerencias(true)}
              placeholder="🔍 Escribe tu ciudad... ej: Marbella"
              style={{ width: "100%", padding: 14, borderRadius: 12, border: "2px solid #16a34a", fontSize: 16, background: "#f0fdf4", boxSizing: "border-box" }}
            />
            {localidad && <button onClick={()=>{ setLocalidad(""); setBusquedaCiudad(""); }} style={{ position: "absolute", right: 10, top: 10, background: "#eee", border: "none", borderRadius: "50%", width: 28, height: 28, fontSize: 14 }}>❌</button>}
            {mostrarSugerencias && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "2px solid #16a34a", borderTop: "none", borderRadius: "0 0 12px 12px", maxHeight: 220, overflowY: "auto", zIndex: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                {sugerencias.length === 0 && <div style={{ padding: 12, fontSize: 14, color: "#666" }}>No hay ninguna ciudad con ese nombre. Prueba con otra.</div>}
                {sugerencias.map(l=>(
                  <div key={l} onClick={()=>elegirCiudad(l)} style={{ padding: "12px 14px", borderBottom: "1px solid #eee", fontSize: 16, cursor: "pointer", background: localidad===l ? "#f0fdf4" : "#fff", fontWeight: localidad===l ? "bold" : "normal" }}>
                    📍 {l} <span style={{ color: "#16a34a", fontSize: 13 }}>({FARMACIAS.filter(f=>f[1]===l).length})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {localidad && <p style={{ fontSize: 13, color: "#16a34a", fontWeight: "bold", margin: "6px 0 0" }}>✅ Has elegido: {localidad} ({FARMACIAS.filter(f=>f[1]===localidad).length} farmacias)</p>}

          <p style={{ fontWeight: "bold", margin: "12px 0 6px", fontSize: 17 }}>Para el Chat, marcar si estamos en horario:</p>
          {guardia && !festivo && <p style={{ background: "#fef3c7", border: "1px solid #f59e0b", padding: 8, borderRadius: 8, fontSize: 13, margin: "6px 0" }}>🌙 Es de noche: las farmacias diurnas ya han cerrado. Se marcará solo <b>De guardia</b> para que solo escribas a las de guardia.</p>}
          {festivo && <p style={{ background: "#fee2e2", border: "1px solid #ef4444", padding: 8, borderRadius: 8, fontSize: 13, margin: "6px 0" }}>📅 Hoy es <b>Festivo en {localidad || "tu ciudad"}</b>: las farmacias diurnas están cerradas. Solo quedan las de guardia.</p>}

          {/* DIURNO / GUARDIA / FESTIVO - LOS 3 EN 1 LÍNEA, SIN SALIRSE */}
          <div style={{ display: "flex", flexWrap: "nowrap", justifyContent: "space-between", alignItems: "center", gap: 4, width: "100%", boxSizing: "border-box", fontSize: 13, fontWeight: "bold" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap", flexShrink: 0 }}><input type="checkbox" checked={diurno} onChange={()=>setDiurno(!diurno)} style={{ width: 18, height: 18, margin: 0 }} /> ☀️ Diurno</label>
            <label style={{ display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap", flexShrink: 0 }}><input type="checkbox" checked={guardia} onChange={()=>setGuardia(!guardia)} style={{ width: 18, height: 18, margin: 0 }} /> 🌙 Guardia</label>
            <label style={{ display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap", flexShrink: 0 }}><input type="checkbox" checked={festivo} onChange={()=>setFestivo(!festivo)} style={{ width: 18, height: 18, margin: 0 }} /> 📅 Festivo</label>
          </div>

          <h3 style={{ color: "#16a34a", fontSize: 22, margin: "14px 0 8px" }}>💬 Chat de consulta</h3>
          <div style={{ display: "flex", border: "2px solid #16a34a", borderRadius: 12, overflow: "hidden", background: "#f0fdf4", width: "100%", boxSizing: "border-box" }}>
            <input value={texto} onChange={(e)=>setTexto(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter") enviar();}} placeholder="🔍 ¿Qué necesitas? Escribe el producto..." style={{ flex: 1, minWidth: 0, padding: 14, border: "none", background: "transparent", fontSize: 16 }} />
            <button onClick={enviar} style={{ background: "#16a34a", color: "#fff", border: "none", padding: "0 22px", fontWeight: "bold", fontSize: 18, whiteSpace: "nowrap" }}>Enviar</button>
          </div>

          {productos.map((p,i)=>(
            <div key={i} style={{ display: "flex", justifyContent: "space-between", background: "#f0fdf4", padding: 10, borderRadius: 10, marginTop: 8, border: "1px solid #bbf7d0" }}>
              <span>💊 {p}</span><button onClick={()=>setProductos(productos.filter((_,x)=>x!==i))} style={{ border: "none", background: "none", fontSize: 16 }}>❌</button>
            </div>
          ))}

          <p style={{ fontWeight: "bold", fontSize: 14, margin: "10px 0 2px" }}><span style={{ color: "#16a34a" }}>✓</span> en stock &nbsp; <span style={{ color: "#dc2626" }}>✗</span> Sin stock &nbsp; 👁 otro &nbsp; ✏️ Bajo pedido</p>
          <h3 style={{ color: "#16a34a", fontSize: 18, margin: "4px 0 6px" }}>💬 Obteniendo respuestas...</h3>

          {/* RECUADROS DE FARMACIAS - TODOS IGUALES, CADA PRODUCTO CON SU SÍMBOLO AL LADO, ✓ VERDE */}
          {tres.map((f, idx)=>(
            <div key={idx} style={{ border: "1.5px solid #16a34a", borderRadius: 10, padding: 8, marginBottom: 8, display: "flex", gap: 8, boxSizing: "border-box", minHeight: 132, alignItems: "stretch" }}>
              <div style={{ background: "#16a34a", color: "#fff", width: 32, height: 32, minWidth: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 18, alignSelf: "flex-start" }}>{idx+1}</div>

              {/* COLUMNA IZQUIERDA - NOMBRE + CHAT ABAJO */}
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <b style={{ fontSize: 14, lineHeight: 1.2, display: "block" }}>{f[0]}</b>
                  <span style={{ fontSize: 12, lineHeight: 1.3, display: "block", marginTop: 3 }}>📍 {f[2]} - {f[1]}</span>
                </div>
                <button onClick={()=>window.open(`https://wa.me/${TELEFONO_PRUEBA}?text=${encodeURIComponent(`Hola ${f[0]}, soy cliente de FarmaCerca 24h de ${localidad || f[1]}. Horario: ${horario}. Necesito: ${productos.join(", ") || "Consulta general"}. ¿Lo tenéis en stock? Gracias`)}`, "_blank")} style={{ background: "#16a34a", color: "#fff", border: "none", padding: "7px 12px", borderRadius: 8, fontWeight: "bold", marginTop: 8, fontSize: 13, alignSelf: "flex-start" }}>💬 Chat</button>
              </div>

              {/* COLUMNA DERECHA - CADA PRODUCTO CON SU SÍMBOLO ALINEADO, ✓ VERDE */}
              <div style={{ borderLeft: "1.5px solid #ccc", paddingLeft: 8, width: 118, minWidth: 118, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 6, fontSize: 12, lineHeight: 1.3 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
                    <span style={{ flex: 1, textAlign: "left" }}>{productos[0] || "Ibuprofeno 600mg"}</span>
                    <span style={{ color: "#16a34a", fontWeight: "bold", fontSize: 16, minWidth: 18, textAlign: "center" }}>✓</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
                    <span style={{ flex: 1, textAlign: "left" }}>{productos[1] || "Paracetamol 1g"}</span>
                    <span style={{ fontSize: 14, minWidth: 18, textAlign: "center" }}>✏️</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
                    <span style={{ flex: 1, textAlign: "left" }}>{productos[2] || "Crema"}</span>
                    <span style={{ fontSize: 14, minWidth: 18, textAlign: "center" }}>👁</span>
                  </div>
                </div>
                <button onClick={()=>window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Farmacia "+f[0]+" "+f[2])}`, "_blank")} style={{ background: "#0090ff", color: "#fff", border: "none", padding: "7px 6px", borderRadius: 8, marginTop: 8, fontWeight: "bold", width: "100%", fontSize: 12 }}>✈ Cómo llegar</button>
              </div>
            </div>
          ))}

          <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
            <button onClick={buscarGuardia} style={{ flex: 1, padding: 8, borderRadius: 10, fontWeight: "bold", background: "#dbeafe", border: "1.5px solid #0090ff", fontSize: 13 }}>🌙 Farmacias de guardia →<br /><span style={{ fontWeight: "normal", fontSize: 11 }}>Guardias de hoy en Maps</span></button>
            <button onClick={buscarCercanas} style={{ flex: 1, padding: 8, borderRadius: 10, fontWeight: "bold", background: "#e6f7ee", border: "1.5px solid #16a34a", fontSize: 13 }}>📍 Farmacias cercanas →<br /><span style={{ fontWeight: "normal", fontSize: 11 }}>Cerca de ti en Maps</span></button>
          </div>

          <div style={{ background: "#e6f7ee", border: "1.5px solid #16a34a", borderRadius: 10, padding: 8, marginTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 13 }}><b>Contacto FarmaCerca 24 h</b><br /><span style={{ fontSize: 12 }}>¿Dudas o ayuda? Pulsa para escribirnos.</span></div>
              <button onClick={()=>window.open(`https://wa.me/${TELEFONO_PRUEBA}?text=${encodeURIComponent("Hola FarmaCerca 24h, tengo una duda, ¿me ayudáis?")}`, "_blank")} style={{ background: "#fff", color: "#16a34a", border: "1.5px solid #16a34a", padding: "6px 10px", borderRadius: 8, fontWeight: "bold", fontSize: 13, whiteSpace: "nowrap" }}>💬 Chat →</button>
            </div>
            <div style={{ background: "#fff", border: "1px solid #16a34a", borderRadius: 8, padding: 8, marginTop: 6, display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>✉️ E-mail: contacto@farmacerca24h.es</span><span style={{ color: "#16a34a", fontWeight: "bold" }}>Pulsa →</span></div>
          </div>
        </>
      )}

      {vista === "farmacia" && (
        <div>
          <p style={{ background: "#e0f2fe", padding: 10, borderRadius: 10 }}>🏪 <b>Vista FARMACIA - Prueba</b><br/>Te ha llegado este WhatsApp al 634467345:</p>
          <div style={{ background: "#dcfce7", padding: 12, borderRadius: 12 }}>
            <b>Hola, soy FarmaCerca 24h.</b><br/>Cliente en {localidad || "Málaga"} ({horario}) pregunta:<br/>
            {productos.length===0 ? <i>- (Ejemplo) Ibuprofeno 600mg - escribe un producto como cliente primero</i> : productos.map((p,i)=><div key={i}>- {p}</div>)}
            <p><b>¿Lo tienes? Pulsa una opción:</b></p>
          </div>
          {tres.map((f, idx)=>(
            <div key={idx} style={{ border: "1px solid #ccc", borderRadius: 12, padding: 10, marginTop: 10 }}>
              <b>{idx+1}. {f[0]} - {f[1]}</b>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <button onClick={()=>{setRespuestas({...respuestas, [idx]: "✅ TENGO"}); setVista("cliente");}} style={{ flex: 1, padding: 10, background: "#16a34a", color: "#fff", border: "none", borderRadius: 10, fontWeight: "bold" }}>✅ TENGO</button>
                <button onClick={()=>{setRespuestas({...respuestas, [idx]: "❌ NO TENGO"}); setVista("cliente");}} style={{ flex: 1, padding: 10, background: "#ef4444", color: "#fff", border: "none", borderRadius: 10, fontWeight: "bold" }}>❌ NO TENGO</button>
                <button onClick={()=>{setRespuestas({...respuestas, [idx]: "✏️ BAJO PEDIDO"}); setVista("cliente");}} style={{ flex: 1, padding: 10, background: "#f59e0b", color: "#fff", border: "none", borderRadius: 10, fontWeight: "bold" }}>✏️ PEDIDO</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <footer style={{ textAlign: "center", padding: "12px 0 6px" }}>
        <img src="/logo.png" alt="Farmacerca 24h - A un mensaje de ti" style={{ height: "62px", width: "auto", display: "block", margin: "0 auto" }} />
        <div style={{ background: "#e6f7ee", border: "1.5px solid #16a34a", borderRadius: 16, padding: 8, margin: "8px 0", fontWeight: "bold", fontSize: 13 }}>Aviso Legal &nbsp;•&nbsp; Privacidad &nbsp;•&nbsp; Términos &nbsp;•&nbsp; Cookies</div>
        <p style={{ fontSize: 12 }}>Farmacerca 24 h solo informa de disponibilidad.<br />La venta y dispensación la realiza la farmacia autorizada.</p>
        <p style={{ fontSize: 11, color: "#666" }}>{FARMACIAS.length} farmacias • {localidades.length} ciudades y pedanías</p>
      </footer>
    </main>
  );
}
