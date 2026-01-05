import { useState, useEffect } from 'react';
import { Menu, HelpCircle, Calendar, Camera, BarChart3, MessageSquare, Clock, Edit3, RotateCcw, X, Plus, Star, FileText } from 'lucide-react';

export default function AliTrack() {
  const [estado, setEstado] = useState('CON');
  const [tiempoCon, setTiempoCon] = useState(0);
  const [tiempoSin, setTiempoSin] = useState(0);
  const [ultimoCambio, setUltimoCambio] = useState(Date.now());
  const [pantallaActual, setPantallaActual] = useState('principal');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [pantallaConfig, setPantallaConfig] = useState(null);
  
  // Calendario
  const [mesActual, setMesActual] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [mostrarMenuFlotante, setMostrarMenuFlotante] = useState(false);
  const [modalEvento, setModalEvento] = useState(null);
  
  // Temporizador
  const [mostrarTemporizador, setMostrarTemporizador] = useState(false);
  const [tiempoTemporizador, setTiempoTemporizador] = useState(0);
  const [temporizadorActivo, setTemporizadorActivo] = useState(false);
  const [temporizadorRestante, setTemporizadorRestante] = useState(0);
  const [alarmaActiva, setAlarmaActiva] = useState(false);
  
  // Configuración
  const [config, setConfig] = useState({
    nombre: '',
    nick: '',
    alineadorNumero: 1,
    alineadorTipo: 'A',
    patron: 'A-B',
    totalAlineadores: 45,
    diasTipoA: 7,
    diasTipoB: 3,
    diaInicio: new Date().toISOString().split('T')[0],
    diaActual: 1,
    objetivoHoras: 22
  });

  const [misiones, setMisiones] = useState([false, false, false, false, false, false, false]);
  const [misionesActivadas, setMisionesActivadas] = useState(true);

  // Eventos del calendario (simulados por ahora)
  const [eventos, setEventos] = useState([]);

  // Cargar datos
  useEffect(() => {
    const datosGuardados = localStorage.getItem('alitrack-datos');
    if (datosGuardados) {
      try {
        const datos = JSON.parse(datosGuardados);
        if (datos.config) setConfig(datos.config);
        if (datos.tiempoCon) setTiempoCon(datos.tiempoCon);
        if (datos.tiempoSin) setTiempoSin(datos.tiempoSin);
        if (datos.estado) setEstado(datos.estado);
        if (datos.misiones) setMisiones(datos.misiones);
        if (datos.misionesActivadas !== undefined) setMisionesActivadas(datos.misionesActivadas);
        if (datos.eventos) setEventos(datos.eventos);
      } catch (e) {
        console.error('Error:', e);
      }
    }
  }, []);

  // Guardar datos
  useEffect(() => {
    const datos = {
      config,
      tiempoCon,
      tiempoSin,
      estado,
      misiones,
      misionesActivadas,
      eventos,
      ultimaActualizacion: new Date().toISOString()
    };
    localStorage.setItem('alitrack-datos', JSON.stringify(datos));
  }, [config, tiempoCon, tiempoSin, estado, misiones, misionesActivadas, eventos]);

  // Cronómetro principal
  useEffect(() => {
    const intervalo = setInterval(() => {
      if (estado === 'CON') {
        setTiempoCon(prev => prev + 100);
      } else {
        setTiempoSin(prev => prev + 100);
      }
    }, 100);
    return () => clearInterval(intervalo);
  }, [estado]);

  // Temporizador
  useEffect(() => {
    if (temporizadorActivo && temporizadorRestante > 0) {
      const intervalo = setInterval(() => {
        setTemporizadorRestante(prev => {
          if (prev <= 1) {
            setTemporizadorActivo(false);
            setAlarmaActiva(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(intervalo);
    }
  }, [temporizadorActivo, temporizadorRestante]);

  const formatearTiempo = (ms) => {
    const horas = Math.floor(ms / 3600000);
    const minutos = Math.floor((ms % 3600000) / 60000);
    const segundos = Math.floor((ms % 60000) / 1000);
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  };

  const formatearTiempoCorto = (ms) => {
    const horas = Math.floor(ms / 3600000);
    const minutos = Math.floor((ms % 3600000) / 60000);
    return `${horas} h ${minutos} min`;
  };

  const formatearTemporizador = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calcularCambioEn = () => {
    const diasUso = config.patron === 'todos-iguales' 
      ? config.diasTipoA 
      : (config.alineadorTipo === 'A' ? config.diasTipoA : config.diasTipoB);
    
    const horasTotales = (tiempoCon + tiempoSin) / 3600000;
    const diasTranscurridos = Math.floor(horasTotales / 24);
    const horasDelDiaActual = horasTotales % 24;
    
    const diasFaltantes = Math.max(0, diasUso - diasTranscurridos - 1);
    const horasFaltantes = Math.floor(24 - horasDelDiaActual);
    
    return `${diasFaltantes}d ${horasFaltantes}h`;
  };

  const mostrarAlineador = () => {
    if (config.patron === 'todos-iguales') {
      return `Alineador ${config.alineadorNumero}`;
    } else {
      return `${config.alineadorNumero}-${config.alineadorTipo}`;
    }
  };

  const totalDia = 24 * 60 * 60 * 1000;
  const porcentajeCon = (tiempoCon / totalDia) * 100;
  const porcentajeSin = (tiempoSin / totalDia) * 100;
  const porcentajePendiente = Math.max(0, 100 - porcentajeCon - porcentajeSin);

  const cambiarEstado = () => {
    if (estado === 'CON') {
      setMostrarTemporizador(true);
    } else {
      setEstado('CON');
      setUltimoCambio(Date.now());
      setTemporizadorActivo(false);
      setTemporizadorRestante(0);
    }
  };

  const confirmarTiempoSin = () => {
    setEstado('SIN');
    setUltimoCambio(Date.now());
    setMostrarTemporizador(false);
    if (tiempoTemporizador > 0) {
      setTemporizadorRestante(tiempoTemporizador * 60);
      setTemporizadorActivo(true);
    }
  };

  const deshacer = () => {
    const tiempoTranscurrido = Date.now() - ultimoCambio;
    if (tiempoTranscurrido < 60000) {
      if (estado === 'CON') {
        const tiempoADevolver = Math.min(tiempoTranscurrido, tiempoCon);
        setTiempoCon(prev => Math.max(0, prev - tiempoADevolver));
        setTiempoSin(prev => prev + tiempoADevolver);
      } else {
        const tiempoADevolver = Math.min(tiempoTranscurrido, tiempoSin);
        setTiempoSin(prev => Math.max(0, prev - tiempoADevolver));
        setTiempoCon(prev => prev + tiempoADevolver);
      }
      setEstado(estado === 'CON' ? 'SIN' : 'CON');
      setUltimoCambio(Date.now());
      setTemporizadorActivo(false);
      setTemporizadorRestante(0);
    }
  };

  // PANTALLA PRINCIPAL
  const renderPantallaPrincipal = () => {
    const colorFondo = estado === 'CON' ? 'from-green-50 to-green-100' : 'from-red-50 to-red-100';
    const colorRecuadro = estado === 'CON' ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300';
    
    return (
      <div className={`min-h-screen bg-gradient-to-br ${colorFondo} p-4 pb-24`}>
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setMenuAbierto(true)} className="p-2">
            <Menu size={28} />
          </button>
          <HelpCircle size={28} className="text-gray-600" />
        </div>

        <div className="flex justify-between items-center mb-6 px-2">
          <div>
            <p className="text-xl font-bold">{mostrarAlineador()}</p>
            <p className="text-sm text-gray-600">Cambio en: {calcularCambioEn()}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">Día: {config.diaActual}</p>
          </div>
        </div>

        <div 
          onClick={cambiarEstado}
          className={`${colorRecuadro} border-4 rounded-3xl p-8 mb-6 cursor-pointer hover:opacity-90 transition-opacity`}
        >
          <p className="text-center text-2xl font-bold mb-6">
            {estado === 'CON' ? 'CON ALINEADORES' : 'SIN ALINEADORES'}
          </p>

          <div className="space-y-2 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">CON:</span>
              <span className="text-2xl font-mono font-bold">{formatearTiempo(tiempoCon)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">SIN:</span>
              <span className="text-2xl font-mono font-bold">{formatearTiempo(tiempoSin)}</span>
            </div>
          </div>

          <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden flex relative">
            <div className="bg-green-500 h-full transition-all" style={{ width: `${porcentajeCon}%` }} />
            <div className="bg-gray-300 h-full transition-all" style={{ width: `${porcentajePendiente}%` }} />
            <div className="bg-red-500 h-full transition-all" style={{ width: `${porcentajeSin}%` }} />
            <div 
              className="absolute top-0 bottom-0 w-1 bg-green-700 z-10"
              style={{ left: `${(config.objetivoHoras / 24) * 100}%` }}
            />
          </div>
          <div className="flex justify-end mt-2">
            <span className="text-base text-green-700 font-bold">Objetivo: {config.objetivoHoras} h</span>
          </div>

          <p className="text-center text-sm mt-4 text-gray-600">
            Tap aquí para cambiar de estado
          </p>
        </div>

        {temporizadorActivo && (
          <div className="bg-blue-100 border-2 border-blue-300 rounded-xl p-4 mb-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Temporizador activo</p>
            <p className="text-3xl font-mono font-bold text-blue-600">{formatearTemporizador(temporizadorRestante)}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setTemporizadorActivo(false);
                setTemporizadorRestante(0);
              }}
              className="mt-2 px-4 py-1 bg-red-500 text-white text-sm rounded-lg"
            >
              Cancelar
            </button>
          </div>
        )}

        <div className="flex gap-4 justify-center mb-8">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setMostrarTemporizador(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
          >
            <Edit3 size={20} />
            Editar
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              deshacer();
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600"
          >
            <RotateCcw size={20} />
            Deshacer
          </button>
        </div>

        {misionesActivadas && (
          <div className="px-4">
            <p className="text-center text-lg font-semibold mb-4">Misiones</p>
            <div className="flex justify-center gap-3">
              {misiones.map((completada, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    completada ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // PANTALLA CALENDARIO MEJORADO
  const renderCalendario = () => {
    const hoy = new Date();
    const primerDia = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
    const ultimoDia = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const primerDiaSemana = primerDia.getDay();
    const ajustePrimerDia = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;

    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    const mesAnterior = () => {
      setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1));
    };

    const mesSiguiente = () => {
      setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1));
    };

    const getDatosDia = (dia) => {
      const fecha = new Date(mesActual.getFullYear(), mesActual.getMonth(), dia);
      const esHoy = fecha.toDateString() === hoy.toDateString();
      const esFuturo = fecha > hoy;
      
      // Calcular día de cambio de alineador
      const fechaInicio = new Date(config.diaInicio);
      const diasDesdeInicio = Math.floor((fecha - fechaInicio) / (1000 * 60 * 60 * 24));
      const diasPorAlineador = config.patron === 'todos-iguales' ? config.diasTipoA : 
        (config.alineadorTipo === 'A' ? config.diasTipoA : config.diasTipoB);
      const esDiaCambio = diasDesdeInicio > 0 && diasDesdeInicio % diasPorAlineador === 0;
      
      // Datos REALES del día actual (del cronómetro), vacíos para el resto
      const horasConDia = esHoy ? (tiempoCon / 3600000) : 0;
      
      // Iconos de datos del día - SOLO días con datos reales
      const tieneFotos = false; // Por ahora siempre false hasta implementar fotos
      
      // Verificar citas - comparar solo la fecha sin hora
      const tieneCita = eventos.some(e => {
        if (e.tipo !== 'cita') return false;
        const fechaEvento = new Date(e.fecha);
        return fechaEvento.toDateString() === fecha.toDateString();
      });
      
      // Verificar notas - comparar solo la fecha sin hora
      const tieneNotas = eventos.some(e => {
        if (e.tipo !== 'nota') return false;
        const fechaEventoStr = e.fecha; // Formato: "YYYY-MM-DD"
        const fechaBuscarStr = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
        const resultado = fechaEventoStr === fechaBuscarStr;
        if (resultado) {
          console.log(`✓ Nota encontrada para día ${dia}: ${e.fecha} === ${fechaBuscarStr}`);
        }
        return resultado;
      });
      
      if (dia === hoy.getDate()) {
        console.log(`Día ${dia} (HOY): eventos totales=${eventos.length}, tieneNotas=${tieneNotas}`);
        console.log('Todas las notas:', eventos.filter(e => e.tipo === 'nota'));
      }
      
      // Color FIJO basado en datos reales
      let colorFondo = 'bg-gray-200'; // Gris por defecto (sin datos o futuro)
      
      // Solo colorear si el día YA TERMINÓ y hay datos
      if (esHoy) {
        // El día actual NO se colorea hasta que termine el día
        colorFondo = 'bg-gray-200';
      } else if (!esFuturo && horasConDia > 0) {
        // Días pasados con datos
        if (horasConDia >= config.objetivoHoras) {
          colorFondo = 'bg-green-300'; // Verde: ≥22h
        } else if (horasConDia >= config.objetivoHoras - 1) {
          colorFondo = 'bg-yellow-300'; // Amarillo: entre 21-22h
        } else {
          colorFondo = 'bg-red-300'; // Rojo: <21h
        }
      }
      // TODO: Cuando guardemos historial, aquí leeremos los datos de días pasados
      
      return { esHoy, esFuturo, colorFondo, esDiaCambio, horasConDia, tieneFotos, tieneCita, tieneNotas };
    };

    const eventosHoy = eventos.filter(e => {
      const fechaEvento = new Date(e.fecha);
      return fechaEvento.toDateString() === hoy.toDateString();
    });

    const dias = [];
    for (let i = 0; i < ajustePrimerDia; i++) {
      dias.push(<div key={`empty-${i}`} className="h-14"></div>);
    }
    
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const datos = getDatosDia(dia);
      const fecha = new Date(mesActual.getFullYear(), mesActual.getMonth(), dia);
      
      dias.push(
        <div
          key={dia}
          onClick={() => setDiaSeleccionado(fecha)}
          className={`${datos.colorFondo} h-14 rounded-lg flex flex-col items-center justify-center relative cursor-pointer hover:opacity-80 ${
            datos.esHoy ? 'ring-4 ring-blue-400 ring-offset-2' : ''
          } ${datos.esDiaCambio && !datos.esFuturo ? 'border-b-4 border-blue-500' : 'border-2 border-gray-300'}`}
        >
          <span className={`text-lg font-bold ${datos.esHoy ? 'text-blue-600' : ''}`}>
            {dia}
          </span>
          
          {/* Iconos de datos del día - posicionados para no solaparse */}
          {datos.tieneNotas && (
            <span className="absolute top-0 left-1 text-xs">📝</span>
          )}
          {datos.tieneCita && (
            <span className="absolute top-0 right-1 text-xs">🦷</span>
          )}
          {datos.tieneFotos && (
            <span className="absolute bottom-1 right-1 text-xs">📷</span>
          )}
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-24 relative">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setMenuAbierto(true)}>
            <Menu size={28} />
          </button>
          <div className="flex items-center gap-3">
            <button onClick={mesAnterior} className="p-2">
              <span className="text-2xl">◀</span>
            </button>
            <h1 className="text-xl font-bold capitalize min-w-[180px] text-center">
              {meses[mesActual.getMonth()]} {mesActual.getFullYear()}
            </h1>
            <button onClick={mesSiguiente} className="p-2">
              <span className="text-2xl">▶</span>
            </button>
          </div>
          <div className="w-10" />
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(dia => (
            <div key={dia} className="text-center text-sm font-semibold text-gray-600">
              {dia}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 mb-4">
          {dias}
        </div>

        <div className="bg-white rounded-xl p-4 shadow mb-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-lg font-bold">Total: {formatearTiempoCorto(tiempoCon + tiempoSin)}</p>
              <p className="text-sm text-gray-600">Día {config.diaActual} | {mostrarAlineador()}</p>
            </div>
          </div>
        </div>

        {/* Detalle del día seleccionado */}
        {diaSeleccionado && (
          <div className="bg-white rounded-xl p-4 shadow mb-4">
            <h3 className="font-bold text-lg mb-3">
              📅 {diaSeleccionado.getDate()} {meses[diaSeleccionado.getMonth()]} {diaSeleccionado.getFullYear()}
            </h3>
            
            {/* Iconos de datos del día */}
            {(getDatosDia(diaSeleccionado.getDate()).tieneFotos || 
              getDatosDia(diaSeleccionado.getDate()).tieneCita || 
              getDatosDia(diaSeleccionado.getDate()).tieneNotas ||
              eventos.some(e => {
                const fechaDiaStr = `${diaSeleccionado.getFullYear()}-${String(diaSeleccionado.getMonth() + 1).padStart(2, '0')}-${String(diaSeleccionado.getDate()).padStart(2, '0')}`;
                return e.tipo === 'cambio' && e.fecha === fechaDiaStr;
              })) && (
              <div className="space-y-2 mb-4">
                {getDatosDia(diaSeleccionado.getDate()).tieneFotos && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-xl">📷</span>
                    <span className="text-gray-700">11 selfis de dientes</span>
                  </div>
                )}
                
                {/* Cambio de alineador */}
                {(() => {
                  const fechaDiaStr = `${diaSeleccionado.getFullYear()}-${String(diaSeleccionado.getMonth() + 1).padStart(2, '0')}-${String(diaSeleccionado.getDate()).padStart(2, '0')}`;
                  const cambiosDelDia = eventos.filter(e => e.tipo === 'cambio' && e.fecha === fechaDiaStr);
                  
                  const eliminarCambio = (cambioId) => {
                    setEventos(eventos.filter(e => e.id !== cambioId));
                    alert('✅ Cambio eliminado');
                  };
                  
                  return cambiosDelDia.map(cambio => (
                    <div 
                      key={cambio.id} 
                      onClick={() => {
                        if (confirm(`Cambio a ${cambio.numeroAlineador}\n${cambio.hora}\n\n¿Eliminar?`)) {
                          eliminarCambio(cambio.id);
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                      className="flex items-center gap-2 text-sm p-2 hover:bg-blue-50 rounded"
                    >
                      <span className="text-xl">🔄</span>
                      <span className="text-gray-700">Cambio a alineador {cambio.numeroAlineador} - {cambio.hora}</span>
                    </div>
                  ));
                })()}
                {getDatosDia(diaSeleccionado.getDate()).tieneCita && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-xl">🦷</span>
                    <span className="text-gray-700">Cita de ortodoncista - 15:00</span>
                  </div>
                )}
                {getDatosDia(diaSeleccionado.getDate()).tieneNotas && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-xl">📝</span>
                    <span className="text-gray-700">Notas guardadas</span>
                  </div>
                )}
              </div>
            )}

            {/* Resumen de tiempos del día - SOLO para el día actual con datos reales */}
            {diaSeleccionado.toDateString() === hoy.toDateString() && (tiempoCon > 0 || tiempoSin > 0) && (
              <div>
                <p className="text-sm font-semibold mb-3 text-gray-700">Resumen de horas:</p>
                
                {/* BOTÓN DE PRUEBA */}
                <button
                  onClick={() => alert('¡El click funciona!')}
                  className="w-full mb-3 p-3 bg-purple-500 text-white rounded-lg font-bold"
                >
                  🧪 TEST - Haz clic aquí
                </button>
                
                {/* Resumen CON y SIN con tiempos actuales */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-green-700">👍 CON alineadores</span>
                      </div>
                      <p className="text-xs text-gray-600">{formatearTiempo(tiempoCon)}</p>
                    </div>
                    <span className="text-green-600">✓</span>
                  </div>
                  
                  {tiempoSin > 0 && (
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-red-700">🍴 SIN alineadores</span>
                        </div>
                        <p className="text-xs text-gray-600">{formatearTiempo(tiempoSin)}</p>
                      </div>
                      <div className="flex gap-2">
                        {temporizadorActivo && (
                          <span className="text-xs text-blue-600 font-mono">
                            {formatearTemporizador(temporizadorRestante)}
                          </span>
                        )}
                        <span className="text-red-600">⏱️</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Mensaje si no hay datos */}
            {diaSeleccionado.toDateString() !== hoy.toDateString() && (
              <p className="text-sm text-gray-500 italic">
                No hay datos registrados para este día
              </p>
            )}
          </div>
        )}

        {eventosHoy.length > 0 && (
          <div className="space-y-2 mb-4">
            {eventosHoy.map((evento, i) => (
              <div key={i} className="bg-white rounded-lg p-3 shadow flex items-center gap-3">
                <div className="text-2xl">
                  {evento.tipo === 'tiempo' && '🍴'}
                  {evento.tipo === 'cambio' && '🔄'}
                  {evento.tipo === 'cita' && '⭐'}
                  {evento.tipo === 'nota' && '📝'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{evento.titulo}</p>
                  <p className="text-sm text-gray-600">{evento.detalle}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setMostrarMenuFlotante(!mostrarMenuFlotante)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 z-10"
        >
          <Plus size={32} className="text-white" />
        </button>

        {mostrarMenuFlotante && (
          <div className="fixed bottom-40 right-6 bg-white rounded-2xl shadow-xl p-2 space-y-2 z-20 pointer-events-auto">
            <button
              onClick={() => { setModalEvento('tiempo'); setMostrarMenuFlotante(false); }}
              className="flex items-center gap-3 w-full p-3 hover:bg-gray-100 rounded-xl"
            >
              <div className="text-2xl">🍴</div>
              <span className="font-medium">Tiempo</span>
            </button>
            <button
              onClick={() => { setModalEvento('cambio'); setMostrarMenuFlotante(false); }}
              className="flex items-center gap-3 w-full p-3 hover:bg-gray-100 rounded-xl"
            >
              <div className="text-2xl">🔄</div>
              <span className="font-medium">Cambio de alineador</span>
            </button>
            <button
              onClick={() => { setModalEvento('cita'); setMostrarMenuFlotante(false); }}
              className="flex items-center gap-3 w-full p-3 hover:bg-gray-100 rounded-xl"
            >
              <div className="text-2xl">⭐</div>
              <span className="font-medium">Cita de ortodoncista</span>
            </button>
            <button
              onClick={() => { setModalEvento('nota'); setMostrarMenuFlotante(false); }}
              className="flex items-center gap-3 w-full p-3 hover:bg-gray-100 rounded-xl"
            >
              <div className="text-2xl">📝</div>
              <span className="font-medium">Notas</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  // Modal de eventos
  const [notaTexto, setNotaTexto] = useState('');
  const [notaFecha, setNotaFecha] = useState('');
  const [citaFecha, setCitaFecha] = useState('');
  const [citaHora, setCitaHora] = useState('');
  const [citaRecordatorio, setCitaRecordatorio] = useState('1 día antes');
  const [cambioFecha, setCambioFecha] = useState('');
  const [cambioHora, setCambioHora] = useState('');
  const [cambioNumero, setCambioNumero] = useState('');
  
  const renderModalEvento = () => {
    if (!modalEvento) return null;

    const cerrarModal = () => {
      setModalEvento(null);
      // NO resetear los valores para que persistan
      setTimeout(() => {
        setNotaTexto('');
      }, 500);
    };
    
    const fechaHoy = new Date().toISOString().split('T')[0];
    const horaActual = new Date().toTimeString().slice(0, 5);
    
    // Inicializar fecha de nota si está vacía
    if (modalEvento === 'nota' && !notaFecha) {
      setNotaFecha(fechaHoy);
    }
    
    // Inicializar cita
    if (modalEvento === 'cita' && !citaFecha) {
      setCitaFecha(fechaHoy);
      setCitaHora(horaActual);
    }
    
    // Inicializar cambio de alineador con el siguiente número
    if (modalEvento === 'cambio' && !cambioFecha) {
      setCambioFecha(fechaHoy);
      setCambioHora(horaActual);
      // Calcular siguiente alineador
      if (config.patron === 'todos-iguales') {
        setCambioNumero(`${config.alineadorNumero + 1}`);
      } else {
        const siguienteTipo = config.alineadorTipo === 'A' ? 'B' : 'A';
        const siguienteNumero = siguienteTipo === 'A' ? config.alineadorNumero + 1 : config.alineadorNumero;
        setCambioNumero(`${siguienteNumero}-${siguienteTipo}`);
      }
    }

    if (modalEvento === 'tiempo') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Añadir tiempo</h2>
              <button onClick={cerrarModal}><X size={24} /></button>
            </div>
            <p className="text-gray-600 mb-4">Registra cuando te quitaste los alineadores</p>
            <div className="space-y-3">
              <button className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold">
                Quitar alineadores
              </button>
              <button className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold">
                Poner alineadores
              </button>
              <button onClick={cerrarModal} className="w-full py-3 bg-gray-200 rounded-xl font-semibold">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (modalEvento === 'cambio') {
      const guardarCambio = () => {
        if (cambioNumero.trim()) {
          const nuevoCambio = {
            id: Date.now(),
            tipo: 'cambio',
            fecha: cambioFecha,
            hora: cambioHora,
            numeroAlineador: cambioNumero,
            timestamp: new Date().toISOString()
          };
          setEventos([...eventos, nuevoCambio]);
          alert('✅ Cambio de alineador guardado');
          cerrarModal();
        }
      };
      
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Cambio de alineador</h2>
              <button onClick={cerrarModal}><X size={24} /></button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">¿Cuándo?</label>
              <div className="flex gap-2">
                <input 
                  type="date" 
                  value={cambioFecha}
                  onChange={(e) => setCambioFecha(e.target.value)}
                  className="flex-1 px-4 py-2 border-2 rounded-xl" 
                />
                <input 
                  type="time" 
                  value={cambioHora}
                  onChange={(e) => setCambioHora(e.target.value)}
                  className="px-4 py-2 border-2 rounded-xl" 
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">A qué número cambiaste</label>
              <input 
                type="text" 
                value={cambioNumero}
                onChange={(e) => setCambioNumero(e.target.value)}
                placeholder="Alineador N.º 33-B" 
                className="w-full px-4 py-2 border-2 rounded-xl" 
              />
            </div>
            <div className="flex gap-2">
              <button onClick={cerrarModal} className="flex-1 py-3 bg-gray-200 rounded-xl font-semibold">
                Cancelar
              </button>
              <button onClick={guardarCambio} className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-semibold">
                Guardar
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (modalEvento === 'cita') {
      const guardarCita = () => {
        if (citaFecha && citaHora) {
          const nuevaCita = {
            id: Date.now(),
            tipo: 'cita',
            fecha: citaFecha,
            hora: citaHora,
            recordatorio: citaRecordatorio,
            timestamp: new Date().toISOString()
          };
          setEventos([...eventos, nuevaCita]);
          alert('✅ Cita guardada');
          cerrarModal();
        } else {
          alert('Por favor completa la fecha y hora');
        }
      };
      
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Añadir cita</h2>
              <button onClick={cerrarModal}><X size={24} /></button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">¿Cuándo?</label>
              <div className="flex gap-2">
                <input 
                  type="date" 
                  value={citaFecha}
                  onChange={(e) => setCitaFecha(e.target.value)}
                  className="flex-1 px-4 py-2 border-2 rounded-xl" 
                />
                <input 
                  type="time" 
                  value={citaHora}
                  onChange={(e) => setCitaHora(e.target.value)}
                  className="px-4 py-2 border-2 rounded-xl" 
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Recordatorio</label>
              <select 
                value={citaRecordatorio}
                onChange={(e) => setCitaRecordatorio(e.target.value)}
                className="w-full px-4 py-2 border-2 rounded-xl"
              >
                <option>1 día antes</option>
                <option>2 días antes</option>
                <option>1 semana antes</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={cerrarModal} className="flex-1 py-3 bg-gray-200 rounded-xl font-semibold">
                Cancelar
              </button>
              <button onClick={guardarCita} className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-semibold">
                Guardar
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (modalEvento === 'nota') {
      const guardarNota = () => {
        const fechaActual = notaFecha || new Date().toISOString().split('T')[0];
        console.log('=== GUARDANDO NOTA ===');
        console.log('Texto:', notaTexto);
        console.log('Fecha:', fechaActual);
        
        if (notaTexto.trim()) {
          const nuevaNota = {
            id: Date.now(),
            tipo: 'nota',
            fecha: fechaActual,
            texto: notaTexto.trim(),
            timestamp: new Date().toISOString()
          };
          
          console.log('Nueva nota objeto:', nuevaNota);
          
          const eventosNuevos = [...eventos, nuevaNota];
          console.log('Eventos totales después:', eventosNuevos.length);
          
          setEventos(eventosNuevos);
          
          // Forzar guardado inmediato
          localStorage.setItem('alitrack-datos', JSON.stringify({
            ...JSON.parse(localStorage.getItem('alitrack-datos') || '{}'),
            eventos: eventosNuevos
          }));
          
          alert(`✅ Nota guardada para ${fechaActual}\n"${notaTexto}"`);
          setNotaTexto('');
          cerrarModal();
        } else {
          alert('Por favor escribe una nota');
        }
      };
      
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Añadir notas</h2>
              <button onClick={cerrarModal}><X size={24} /></button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Fecha</label>
              <input 
                type="date" 
                value={notaFecha}
                onChange={(e) => setNotaFecha(e.target.value)}
                className="w-full px-4 py-2 border-2 rounded-xl" 
              />
            </div>
            <div className="mb-4">
              <textarea 
                value={notaTexto}
                onChange={(e) => setNotaTexto(e.target.value)}
                placeholder="Ejemplos: opresión, incomodidad, circunstancias especiales..."
                className="w-full px-4 py-2 border-2 rounded-xl h-32 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={cerrarModal} className="flex-1 py-3 bg-gray-200 rounded-xl font-semibold">
                Cancelar
              </button>
              <button onClick={guardarNota} className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-semibold">
                Guardar
              </button>
            </div>
          </div>
        </div>
      );
    }
  };

  // Modal temporizador
  const renderTemporizador = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full">
        <h3 className="text-2xl font-bold text-center mb-4">
          ¿Cuánto tiempo sin alineadores?
        </h3>
        
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[5, 15, 30, 45, 60, 120].map(mins => (
            <button
              key={mins}
              onClick={() => setTiempoTemporizador(mins)}
              className={`py-4 rounded-xl font-semibold text-lg ${
                tiempoTemporizador === mins
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {mins < 60 ? `${mins} min` : `${mins/60} h`}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">O personaliza (minutos):</label>
          <input
            type="number"
            value={tiempoTemporizador}
            onChange={(e) => setTiempoTemporizador(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 border-2 rounded-xl text-center text-2xl font-mono"
            placeholder="0"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setMostrarTemporizador(false);
              setTiempoTemporizador(0);
            }}
            className="flex-1 py-3 bg-gray-300 rounded-xl font-semibold hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={confirmarTiempoSin}
            className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );

  // Modal alarma
  const renderAlarma = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⏰</div>
          <h2 className="text-3xl font-bold mb-4">¡Hora de ponértelos!</h2>
          <p className="text-lg text-gray-600 mb-6">
            Ya pasó el tiempo programado
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                setAlarmaActiva(false);
                setEstado('CON');
                setUltimoCambio(Date.now());
              }}
              className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold text-lg hover:bg-green-700"
            >
              Sí, me los pongo
            </button>
            <button
              onClick={() => {
                setAlarmaActiva(false);
                setTemporizadorRestante(5 * 60);
                setTemporizadorActivo(true);
              }}
              className="w-full py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600"
            >
              +5 minutos más
            </button>
            <button
              onClick={() => {
                setAlarmaActiva(false);
                setTemporizadorRestante(10 * 60);
                setTemporizadorActivo(true);
              }}
              className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600"
            >
              +10 minutos más
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Menú lateral
  const renderMenu = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setMenuAbierto(false)}>
      <div 
        className="absolute left-0 top-0 bottom-0 w-80 bg-white overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">☰ Menú</h2>
            <button onClick={() => setMenuAbierto(false)}>
              <X size={28} />
            </button>
          </div>

          <div className="space-y-1">
            <div className="border-b pb-4 mb-4">
              <p className="text-sm text-gray-600">Nombre: {config.nombre || 'Sin definir'}</p>
              <p className="text-sm text-gray-600">Nick: {config.nick || 'Sin definir'}</p>
            </div>

            <button 
              onClick={() => {setMenuAbierto(false); setPantallaConfig('ajustar-tratamiento');}}
              className="w-full text-left p-3 hover:bg-gray-100 rounded"
            >
              ⚙️ Ajustar tratamiento
            </button>
            <button 
              onClick={() => {setMenuAbierto(false); setPantallaConfig('objetivo-diario');}}
              className="w-full text-left p-3 hover:bg-gray-100 rounded"
            >
              🎯 Establecer objetivo diario
            </button>
            
            <div className="border-t border-b py-2 my-2">
              <button 
                onClick={() => {setMenuAbierto(false); setPantallaConfig('exportar-datos');}}
                className="w-full text-left p-3 hover:bg-gray-100 rounded"
              >
                📤 Exportar datos
              </button>
              <button 
                onClick={() => {setMenuAbierto(false); setPantallaConfig('importar-datos');}}
                className="w-full text-left p-3 hover:bg-gray-100 rounded"
              >
                📥 Importar datos
              </button>
            </div>

            <button 
              onClick={() => {
                setMisionesActivadas(!misionesActivadas);
                setMenuAbierto(false);
              }}
              className="w-full text-left p-3 hover:bg-gray-100 rounded flex justify-between items-center"
            >
              <span>🎮 Activar misiones</span>
              <span className={`px-3 py-1 rounded-full text-sm ${misionesActivadas ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                {misionesActivadas ? 'ON' : 'OFF'}
              </span>
            </button>

            <button className="w-full text-left p-3 hover:bg-gray-100 rounded">
              🔔 Notificaciones
            </button>
            <button className="w-full text-left p-3 hover:bg-gray-100 rounded">
              ❓ Ayuda (YouTube)
            </button>
            <button className="w-full text-left p-3 hover:bg-gray-100 rounded">
              ℹ️ Acerca de
            </button>
            
            <button 
              onClick={() => {setMenuAbierto(false); setPantallaConfig('resetear-todo');}}
              className="w-full text-left p-3 hover:bg-red-100 rounded text-red-600"
            >
              🗑️ Resetear todo
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Navegación inferior
  const NavegacionInferior = () => {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 flex justify-around py-3 shadow-lg" style={{zIndex: 9999, pointerEvents: 'auto'}}>
        <div 
          onMouseDown={() => {
            setPantallaActual('principal');
            setMostrarMenuFlotante(false);
            setModalEvento(null);
          }}
          className="flex flex-col items-center p-2 cursor-pointer"
        >
          <Clock size={24} className={pantallaActual === 'principal' ? 'text-blue-600' : 'text-gray-600'} />
          <span className={`text-xs mt-1 ${pantallaActual === 'principal' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>
            Inicio
          </span>
        </div>
        <div 
          onMouseDown={() => {
            setPantallaActual('calendario');
            setMostrarMenuFlotante(false);
            setModalEvento(null);
          }}
          className="flex flex-col items-center p-2 cursor-pointer"
        >
          <Calendar size={24} className={pantallaActual === 'calendario' ? 'text-blue-600' : 'text-gray-600'} />
          <span className={`text-xs mt-1 ${pantallaActual === 'calendario' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>
            Calendario
          </span>
        </div>
        <div 
          onMouseDown={() => {
            setPantallaActual('fotos');
            setMostrarMenuFlotante(false);
            setModalEvento(null);
          }}
          className="flex flex-col items-center p-2 cursor-pointer"
        >
          <Camera size={24} className={pantallaActual === 'fotos' ? 'text-blue-600' : 'text-gray-600'} />
          <span className={`text-xs mt-1 ${pantallaActual === 'fotos' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>
            Fotos
          </span>
        </div>
        <div 
          onMouseDown={() => {
            setPantallaActual('estadisticas');
            setMostrarMenuFlotante(false);
            setModalEvento(null);
          }}
          className="flex flex-col items-center p-2 cursor-pointer"
        >
          <BarChart3 size={24} className={pantallaActual === 'estadisticas' ? 'text-blue-600' : 'text-gray-600'} />
          <span className={`text-xs mt-1 ${pantallaActual === 'estadisticas' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>
            Stats
          </span>
        </div>
        <div 
          onMouseDown={() => {
            setPantallaActual('foro');
            setMostrarMenuFlotante(false);
            setModalEvento(null);
          }}
          className="flex flex-col items-center p-2 cursor-pointer"
        >
          <MessageSquare size={24} className={pantallaActual === 'foro' ? 'text-blue-600' : 'text-gray-600'} />
          <span className={`text-xs mt-1 ${pantallaActual === 'foro' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>
            Foro
          </span>
        </div>
      </div>
    );
  };

  // Placeholder
  const renderPlaceholder = (titulo) => (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => setMenuAbierto(true)}>
          <Menu size={28} />
        </button>
        <h1 className="text-2xl font-bold">{titulo}</h1>
        <div className="w-10" />
      </div>
      <div className="flex flex-col items-center justify-center mt-20">
        <p className="text-xl font-semibold text-gray-600">Próximamente</p>
        <button 
          onClick={() => setPantallaActual('principal')}
          className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-xl"
        >
          Volver
        </button>
      </div>
    </div>
  );

  // Pantalla: Ajustar tratamiento
  const renderAjustarTratamiento = () => (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => setPantallaConfig(null)}>
          <X size={28} />
        </button>
        <h1 className="text-2xl font-bold">Ajustar tratamiento</h1>
        <div className="w-10" />
      </div>

      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Nombre</label>
          <input
            type="text"
            value={config.nombre}
            onChange={(e) => setConfig({...config, nombre: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Nick para foro</label>
          <input
            type="text"
            value={config.nick}
            onChange={(e) => setConfig({...config, nick: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="nickname123"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Alineador actual</label>
          <input
            type="number"
            value={config.alineadorNumero}
            onChange={(e) => setConfig({...config, alineadorNumero: parseInt(e.target.value) || 1})}
            className="w-full px-4 py-2 border rounded-lg"
            min="1"
          />
        </div>

        {config.patron === 'A-B' && (
          <div>
            <label className="block text-sm font-medium mb-2">Tipo (A o B)</label>
            <div className="flex gap-2">
              <button
                onClick={() => setConfig({...config, alineadorTipo: 'A'})}
                className={`flex-1 py-2 rounded-lg font-semibold ${config.alineadorTipo === 'A' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
              >
                A
              </button>
              <button
                onClick={() => setConfig({...config, alineadorTipo: 'B'})}
                className={`flex-1 py-2 rounded-lg font-semibold ${config.alineadorTipo === 'B' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
              >
                B
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Total de alineadores</label>
          <input
            type="number"
            value={config.totalAlineadores}
            onChange={(e) => setConfig({...config, totalAlineadores: parseInt(e.target.value) || 0})}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Patrón de uso de alineadores</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={config.patron === 'todos-iguales'}
                onChange={() => setConfig({...config, patron: 'todos-iguales'})}
              />
              <span>Todos iguales</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={config.patron === 'A-B'}
                onChange={() => setConfig({...config, patron: 'A-B'})}
              />
              <span>Alternado A-B</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {config.patron === 'todos-iguales' ? 'Días por alineador' : 'Días tipo A'}
          </label>
          <input
            type="number"
            value={config.diasTipoA}
            onChange={(e) => setConfig({...config, diasTipoA: parseInt(e.target.value) || 0})}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {config.patron === 'A-B' && (
          <div>
            <label className="block text-sm font-medium mb-2">Días tipo B</label>
            <input
              type="number"
              value={config.diasTipoB}
              onChange={(e) => setConfig({...config, diasTipoB: parseInt(e.target.value) || 0})}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        )}

        <button
          onClick={() => setPantallaConfig(null)}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  );

  // Pantalla: Objetivo diario
  const renderObjetivoDiario = () => (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => setPantallaConfig(null)}>
          <X size={28} />
        </button>
        <h1 className="text-2xl font-bold">Objetivo diario</h1>
        <div className="w-10" />
      </div>

      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-lg p-6">
        <p className="text-sm text-gray-600 mb-6 text-center">
          Recomendado: llevar los alineadores entre 20 y 22 horas al día
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Objetivo de horas diarias</label>
          <input
            type="number"
            value={config.objetivoHoras}
            onChange={(e) => setConfig({...config, objetivoHoras: parseInt(e.target.value) || 20})}
            className="w-full px-4 py-3 border-2 rounded-xl text-center text-3xl font-bold"
            min="20"
            max="24"
          />
          <p className="text-xs text-gray-500 text-center mt-2">Horas con alineadores (20-24)</p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Vista previa de colores en calendario:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-lg"></div>
                <span className="text-sm">≥{config.objetivoHoras}h - Excelente</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg"></div>
                <span className="text-sm">{config.objetivoHoras - 1}h - Regular</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-500 rounded-lg"></div>
                <span className="text-sm">&lt;{config.objetivoHoras - 1}h - Insuficiente</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setPantallaConfig(null)}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 mt-6"
        >
          Guardar objetivo
        </button>
      </div>
    </div>
  );

  // Pantalla: Exportar datos
  const renderExportarDatos = () => {
    const datos = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      config,
      tiempoCon,
      tiempoSin,
      estado,
      misiones,
      misionesActivadas
    };
    
    const dataStr = JSON.stringify(datos, null, 2);

    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-24">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setPantallaConfig(null)}>
            <X size={28} />
          </button>
          <h1 className="text-2xl font-bold">Exportar datos</h1>
          <div className="w-10" />
        </div>

        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold mb-2">Backup de datos</h3>
            <p className="text-sm text-gray-600">
              Copia este texto y guárdalo en un archivo .json
            </p>
          </div>

          <div className="mb-4">
            <textarea
              value={dataStr}
              readOnly
              className="w-full h-64 p-3 border-2 rounded-xl text-xs font-mono"
              onClick={(e) => e.target.select()}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Cómo guardar:</strong><br/>
              1. Toca el texto para seleccionar todo<br/>
              2. Copia (Ctrl+C o mantén pulsado)<br/>
              3. Pega en un archivo de texto<br/>
              4. Guárdalo como backup.json
            </p>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(dataStr)
                .then(() => alert('✅ Copiado al portapapeles'))
                .catch(() => alert('Selecciona el texto manualmente y copia'));
            }}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold mb-3 hover:bg-green-700"
          >
            📋 Copiar al portapapeles
          </button>

          <button
            onClick={() => setPantallaConfig(null)}
            className="w-full bg-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  };

  // Pantalla: Importar datos
  const renderImportarDatos = () => {
    const importar = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const datos = JSON.parse(event.target.result);
          if (datos.config) setConfig(datos.config);
          if (datos.tiempoCon !== undefined) setTiempoCon(datos.tiempoCon);
          if (datos.tiempoSin !== undefined) setTiempoSin(datos.tiempoSin);
          if (datos.estado) setEstado(datos.estado);
          if (datos.misiones) setMisiones(datos.misiones);
          if (datos.misionesActivadas !== undefined) setMisionesActivadas(datos.misionesActivadas);
          
          alert('✅ Datos importados correctamente');
          setPantallaConfig(null);
        } catch (error) {
          alert('❌ Error al importar: archivo inválido');
        }
      };
      reader.readAsText(file);
    };

    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-24">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setPantallaConfig(null)}>
            <X size={28} />
          </button>
          <h1 className="text-2xl font-bold">Importar datos</h1>
          <div className="w-10" />
        </div>

        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-xl font-bold mb-2">Restaurar backup</h3>
            <p className="text-sm text-gray-600">
              Selecciona tu archivo de backup (.json)
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Atención:</strong> Esto reemplazará todos tus datos actuales.
            </p>
          </div>

          <label className="block w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg text-center cursor-pointer hover:bg-blue-700 mb-3">
            📤 Seleccionar archivo
            <input
              type="file"
              accept=".json"
              onChange={importar}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setPantallaConfig(null)}
            className="w-full bg-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  };

  // Pantalla: Resetear todo
  const renderResetearTodo = () => {
    const resetear = () => {
      localStorage.clear();
      
      setConfig({
        nombre: '',
        nick: '',
        alineadorNumero: 1,
        alineadorTipo: 'A',
        patron: 'A-B',
        totalAlineadores: 45,
        diasTipoA: 7,
        diasTipoB: 3,
        diaInicio: new Date().toISOString().split('T')[0],
        diaActual: 1,
        objetivoHoras: 22
      });
      setTiempoCon(0);
      setTiempoSin(0);
      setEstado('CON');
      setMisiones([false, false, false, false, false, false, false]);
      setMisionesActivadas(true);
      setUltimoCambio(Date.now());
      
      setPantallaConfig(null);
      
      alert('✅ Datos reseteados. La app ha vuelto al estado inicial.');
    };

    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-24">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setPantallaConfig(null)}>
            <X size={28} />
          </button>
          <h1 className="text-2xl font-bold">Resetear todo</h1>
          <div className="w-10" />
        </div>

        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold mb-2 text-red-600">¡Cuidado!</h3>
            <p className="text-sm text-gray-600">
              Estás a punto de borrar TODOS tus datos
            </p>
          </div>

          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-800 font-semibold mb-2">
              Se borrarán:
            </p>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Todos los tiempos registrados</li>
              <li>• Configuración del tratamiento</li>
              <li>• Historial de misiones</li>
              <li>• Todos los ajustes</li>
            </ul>
            <p className="text-sm text-red-800 font-bold mt-3">
              ⚠️ Esta acción NO se puede deshacer
            </p>
          </div>

          <button
            onClick={resetear}
            className="w-full bg-red-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-red-700 mb-3"
          >
            🗑️ SÍ, borrar todo
          </button>

          <button
            onClick={() => setPantallaConfig(null)}
            className="w-full bg-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-300"
          >
            No, cancelar
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {pantallaConfig === 'ajustar-tratamiento' && renderAjustarTratamiento()}
      {pantallaConfig === 'objetivo-diario' && renderObjetivoDiario()}
      {pantallaConfig === 'exportar-datos' && renderExportarDatos()}
      {pantallaConfig === 'importar-datos' && renderImportarDatos()}
      {pantallaConfig === 'resetear-todo' && renderResetearTodo()}
      {!pantallaConfig && pantallaActual === 'principal' && renderPantallaPrincipal()}
      {!pantallaConfig && pantallaActual === 'calendario' && renderCalendario()}
      {!pantallaConfig && pantallaActual === 'fotos' && renderPlaceholder('Fotos')}
      {!pantallaConfig && pantallaActual === 'estadisticas' && renderPlaceholder('Estadísticas')}
      {!pantallaConfig && pantallaActual === 'foro' && renderPlaceholder('Foro')}
      {menuAbierto && renderMenu()}
      {mostrarTemporizador && renderTemporizador()}
      {alarmaActiva && renderAlarma()}
      {!pantallaConfig && renderModalEvento()}
      {!pantallaConfig && <NavegacionInferior />}
    </>
  );
}