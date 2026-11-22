"use client";
import { useState } from "react";

const TELEFONO_PRUEBA = "34634467345"; // 634467345 para pruebas
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
  const [diurno, setDiurno] = useState(true);
  const [guardia, setGuardia] = useState(false);
  const [festivo, setFestivo] = useState(false);
  const [texto, setTexto] = useState("");
  const [productos, setProductos] = useState<string[]>([]);
  const [enviado, setEnviado] = useState(false);
  const [respuestas, setRespuestas] = useState<{[key:number]:string}>({});

  const localidades = Array.from(new Set(FARMACIAS.map(f=>f[1]))).sort();
  const horario = [diurno?"Diurno":"", guardia?"De guardia":"", festivo?"Festivo":""].filter(Boolean).join(", ") || "Diurno";
  const filtradas = FARMACIAS.filter(f => !localidad || f[1] === localidad);
  const tres = filtradas.slice(0, 3);

  const enviar = () => {
    if(!localidad){ alert("Elige primero tu ciudad o pedanía"); return; }
    if(texto.trim()){ setProductos([...productos, texto.trim()]); setTexto(""); }
    setEnviado(true);
    const lista = texto.trim() ? [...productos, texto.trim()] : productos;
    const textoPlano = `Hola, soy FarmaCerca 24h. Cliente en ${localidad} (${horario}) pregunta:\n` + (lista.length ? lista.map(p=>`- ${p}`).join("\n") : `- Consulta general`) + `\nContesta con: TENGO / NO TENGO / BAJO PEDIDO`;
    window.open(`https://wa.me/${TELEFONO_PRUEBA}?text=${encodeURIComponent(textoPlano)}`, "_blank");
  };

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: 12, fontFamily: "sans-serif", background: "#fff" }}>
      {/* HEADER - LOGO GRANDE COMO EN LA FOTO */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <img src="/logo.png" alt="Farmacerca 24h - A un mensaje de ti" style={{ height: "80px", width: "auto", display: "block" }} />
        <button onClick={()=>alert("Para descargar el acceso directo: en tu móvil pulsa Compartir y luego Añadir a pantalla de inicio.")} style={{ background: "#0090ff", color: "#fff", border: "none", padding: "10px 12px", borderRadius: 10, fontWeight: "bold", fontSize: 14, whiteSpace: "nowrap" }}>⬇ Descargar acceso directo</button>
      </div>

      <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        <button onClick={()=>setVista("cliente")} style={{ flex: 1, padding: 10, borderRadius: 10, background: vista==="cliente" ? "#16a34a" : "#eee", color: vista==="cliente" ? "#fff" : "#000", border: "none", fontWeight: "bold" }}>👤 Soy CLIENTE</button>
        <button onClick={()=>setVista("farmacia")} style={{ flex: 1, padding: 10, borderRadius: 10, background: vista==="farmacia" ? "#0ea5e9" : "#eee", color: vista==="farmacia" ? "#fff" : "#000", border: "none", fontWeight: "bold" }}>🏪 Soy FARMACIA (Prueba)</button>
      </div>

      {vista === "cliente" && (
        <>
          <p style={{ fontWeight: "bold", margin: "8px 0 4px", fontSize: 18 }}>Elige:</p>
          <select value={localidad} onChange={(e)=>{setLocalidad(e.target.value); setEnviado(false);}} style={{ width: "100%", padding: 14, borderRadius: 12, border: "2px solid #16a34a", fontSize: 16, background: "#f0fdf4" }}>
            <option value="">📍 Ciudad o pedanía...</option>
            {localidades.map(l=><option key={l} value={l}>{l} ({FARMACIAS.filter(f=>f[1]===l).length})</option>)}
          </select>

          <p style={{ fontWeight: "bold", margin: "12px 0 6px", fontSize: 17 }}>Para el Chat, marcar si estamos en horario:</p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 17, fontWeight: "bold" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}><input type="checkbox" checked={diurno} onChange={()=>setDiurno(!diurno)} style={{ width: 22, height: 22 }} /> ☀️ Diurno</label>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}><input type="checkbox" checked={guardia} onChange={()=>setGuardia(!guardia)} style={{ width: 22, height: 22 }} /> 🌙 De guardia</label>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}><input type="checkbox" checked={festivo} onChange={()=>setFestivo(!festivo)} style={{ width: 22, height: 22 }} /> 📅 Festivo</label>
          </div>

          <h3 style={{ color: "#16a34a", fontSize: 22, margin: "14px 0 8px" }}>💬 Chat de consulta</h3>
          <div style={{ display: "flex", border: "2px solid #16a34a", borderRadius: 12, overflow: "hidden", background: "#f0fdf4" }}>
            <input value={texto} onChange={(e)=>setTexto(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter") enviar();}} placeholder="🔍 ¿Qué necesitas? Escribe el producto..." style={{ flex: 1, padding: 14, border: "none", background: "transparent", fontSize: 16 }} />
            <button onClick={enviar} style={{ background: "#16a34a", color: "#fff", border: "none", padding: "0 22px", fontWeight: "bold", fontSize: 18 }}>Enviar</button>
          </div>

          {productos.map((p,i)=>(
            <div key={i} style={{ display: "flex", justifyContent: "space-between", background: "#f0fdf4", padding: 10, borderRadius: 10, marginTop: 8, border: "1px solid #bbf7d0" }}>
              <span>💊 {p}</span><button onClick={()=>setProductos(productos.filter((_,x)=>x!==i))} style={{ border: "none", background: "none", fontSize: 16 }}>❌</button>
            </div>
          ))}

          {/* DESDE AQUÍ TODO MÁS PEQUEÑO Y COMPACTO, COMO EN TU FOTO */}
          <p style={{ fontWeight: "bold", fontSize: 14, margin: "10px 0 2px" }}>✓ en stock &nbsp; <span style={{ color: "#dc2626" }}>✗</span> Sin stock &nbsp; 👁 otro &nbsp; ✏️ Bajo pedido</p>
          <h3 style={{ color: "#16a34a", fontSize: 18, margin: "4px 0 6px" }}>💬 Obteniendo respuestas...</h3>

          {tres.map((f, idx)=>(
            <div key={idx} style={{ border: "1.5px solid #16a34a", borderRadius: 10, padding: 8, marginBottom: 8, display: "flex", gap: 8 }}>
              <div style={{ background: "#16a34a", color: "#fff", width: 32, height: 32, minWidth: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 18 }}>{idx+1}</div>
              <div style={{ flex: 1 }}>
                <b style={{ fontSize: 15 }}>{f[0]}</b><br /><span style={{ fontSize: 13 }}>📍 {f[2]} - {f[1]}</span><br />
                <button onClick={()=>window.open(`https://wa.me/${TELEFONO_PRUEBA}?text=${encodeURIComponent(`Hola ${f[0]}, soy cliente de FarmaCerca 24h de ${localidad || f[1]}. Horario: ${horario}. Necesito: ${productos.join(", ") || "Consulta general"}. ¿Lo tenéis en stock? Gracias`)}`, "_blank")} style={{ background: "#16a34a", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 8, fontWeight: "bold", marginTop: 6, fontSize: 13 }}>💬 Chat</button>
              </div>
              <div style={{ borderLeft: "1.5px solid #ccc", paddingLeft: 6, fontSize: 12, minWidth: 86 }}>
                <div>{productos[0] || "Ibuprofeno 600mg"}</div>
                <div>{productos[1] || "Paracetamol 1g"}</div>
                <div>{productos[2] || "Crema"}</div>
                <button onClick={()=>window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Farmacia "+f[0]+" "+f[2])}`, "_blank")} style={{ background: "#0090ff", color: "#fff", border: "none", padding: "6px 6px", borderRadius: 8, marginTop: 6, fontWeight: "bold", width: "100%", fontSize: 12 }}>✈ Cómo llegar</button>
              </div>
              <div style={{ fontSize: 16, lineHeight: 1.5, textAlign: "center" }}>✓<br />✏️<br />👁</div>
            </div>
          ))}

          <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
            <button onClick={()=>{setGuardia(true); setDiurno(false);}} style={{ flex: 1, padding: 8, borderRadius: 10, fontWeight: "bold", background: "#dbeafe", border: "1.5px solid #0090ff", fontSize: 13 }}>🌙 Farmacias de guardia →<br /><span style={{ fontWeight: "normal", fontSize: 11 }}>Guardias de hoy</span></button>
            <button onClick={()=>{setGuardia(false); setDiurno(true);}} style={{ flex: 1, padding: 8, borderRadius: 10, fontWeight: "bold", background: "#e6f7ee", border: "1.5px solid #16a34a", fontSize: 13 }}>📍 Farmacias cercanas →<br /><span style={{ fontWeight: "normal", fontSize: 11 }}>Por proximidad</span></button>
          </div>

          <div style={{ background: "#e6f7ee", border: "1.5px solid #16a34a", borderRadius: 10, padding: 8, marginTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 13 }}><b>Contacto FarmaCerca 24 h</b><br /><span style={{ fontSize: 12 }}>¿Dudas o ayuda? Pulsa para escribirnos.</span></div>
              <button onClick={()=>window.open(`https://wa.me/${TELEFONO_PRUEBA}?text=${encodeURIComponent("Hola FarmaCerca 24h, tengo una duda, ¿me ayudáis?")}`, "_blank")} style={{ background: "#fff", color: "#16a34a", border: "1.5px solid #16a34a", padding: "6px 10px", borderRadius: 8, fontWeight: "bold", fontSize: 13 }}>💬 Chat →</button>
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
