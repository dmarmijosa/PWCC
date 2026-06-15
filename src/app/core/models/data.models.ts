export interface Programa {
  id: string;
  nombre: string;
  descripcion: string;
  responsable: string;
  beneficiarios: number;
  ultimaActividad: string;
  estado: 'Activo' | 'Planificación' | 'Inactivo';
}

export interface Voluntario {
  id: string;
  nombre: string;
  email: string;
  ciudad: string;
  programaAsignado: string;
  estado: 'Activo' | 'Pendiente' | 'Inactivo';
  avatarUrl: string;
}

export interface Donacion {
  id: string;
  donante: string;
  email: string;
  fecha: string;
  monto: number;
  metodo: string;
  estado: 'Confirmado' | 'Pendiente' | 'Rechazado';
}

export interface DatosBancarios {
  banco: string;
  cuenta: string;
  numero: string;
  titular: string;
  ruc: string;
}
