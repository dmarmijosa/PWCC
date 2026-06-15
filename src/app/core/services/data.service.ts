import { Injectable, signal, computed, inject } from '@angular/core';
import { Programa, Voluntario, Donacion, DatosBancarios } from '../models/data.models';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly supabase = inject(SupabaseService);

  // --- STATE ---
  private readonly programsSignal = signal<Programa[]>([]);
  private readonly volunteersSignal = signal<Voluntario[]>([]);
  private readonly donationsSignal = signal<Donacion[]>([]);

  private readonly defaultDatosBancarios: DatosBancarios = {
    banco: 'Banco Pichincha',
    cuenta: 'Corriente',
    numero: '2100XXXXXX',
    titular: 'Fund. Confraternidad Carcelaria',
    ruc: '179XXXXXXX001',
    email: 'donaciones@confraternidad.org.ec'
  };

  private readonly datosBancariosSignal = signal<DatosBancarios>(this.defaultDatosBancarios);

  // --- GETTERS (READ-ONLY) ---
  readonly programs = computed(() => this.programsSignal());
  readonly volunteers = computed(() => this.volunteersSignal());
  readonly donations = computed(() => this.donationsSignal());
  readonly datosBancarios = computed(() => this.datosBancariosSignal());

  // --- DERIVED METRICS ---
  readonly totalDonationsAmount = computed(() => 
    this.donationsSignal()
      .filter(d => d.estado === 'Confirmado')
      .reduce((sum, d) => sum + d.monto, 0)
  );

  readonly totalVolunteersCount = computed(() => 
    this.volunteersSignal().filter(v => v.estado === 'Activo').length
  );

  readonly totalProgramsCount = computed(() => 
    this.programsSignal().length
  );

  readonly donationsGrowthPercentage = computed(() => {
    const list = this.donationsSignal().filter(d => d.estado === 'Confirmado');
    if (list.length === 0) return 0;

    const parseMockDate = (dateStr: string): { year: number; month: number } => {
      const parts = dateStr.split(' ');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const monthStr = parts[1].toLowerCase();
        const year = parseInt(parts[2], 10);
        
        const months: Record<string, number> = {
          ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5,
          jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11
        };
        const month = months[monthStr.substring(0, 3)] ?? 0;
        return { year, month };
      }
      const parsed = new Date(dateStr);
      return isNaN(parsed.getTime()) 
        ? { year: new Date().getFullYear(), month: new Date().getMonth() }
        : { year: parsed.getFullYear(), month: parsed.getMonth() };
    };

    // Group by year-month key: "YYYY-MM"
    const groups: Record<string, number> = {};
    list.forEach(d => {
      const { year, month } = parseMockDate(d.fecha);
      const key = `${year}-${String(month + 1).padStart(2, '0')}`;
      groups[key] = (groups[key] || 0) + d.monto;
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    if (sortedKeys.length === 0) return 0;

    const currentMonthTotal = groups[sortedKeys[0]] || 0;
    if (sortedKeys.length === 1) {
      return 100;
    }
    const previousMonthTotal = groups[sortedKeys[1]] || 0;
    if (previousMonthTotal === 0) return 100;

    return Math.round(((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100);
  });

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    // Load Programs
    this.supabase.client.from('programas').select('*')
      .then(({ data, error }) => {
        if (error) {
          console.error('Error loading programs:', error);
        } else if (data) {
          this.programsSignal.set(data.map(p => ({
            id: p.id,
            nombre: p.nombre,
            descripcion: p.descripcion,
            responsable: p.responsable,
            beneficiarios: p.beneficiarios || 0,
            ultimaActividad: p.ultima_actividad || '',
            estado: p.estado
          })));
        }
      });

    // Load Volunteers
    this.supabase.client.from('voluntarios').select('*')
      .then(({ data, error }) => {
        if (error) {
          console.error('Error loading volunteers:', error);
        } else if (data) {
          this.volunteersSignal.set(data.map(v => ({
            id: v.id,
            nombre: v.nombre,
            email: v.email,
            ciudad: v.ciudad || '',
            programaAsignado: v.programa_asignado || '',
            estado: v.estado,
            avatarUrl: v.avatar_url || ''
          })));
        }
      });

    // Load Donations
    this.supabase.client.from('donaciones').select('*')
      .then(({ data, error }) => {
        if (error) {
          console.error('Error loading donations:', error);
        } else if (data) {
          this.donationsSignal.set(data.map(d => ({
            id: d.id,
            donante: d.donante,
            email: d.email,
            fecha: d.fecha,
            monto: Number(d.monto) || 0,
            metodo: d.metodo,
            estado: d.estado
          })));
        }
      });

    // Load Bank Details
    this.supabase.client.from('datos_bancarios').select('*').eq('id', 'default').maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error('Error loading bank details:', error);
        } else if (data) {
          this.datosBancariosSignal.set({
            banco: data.banco,
            cuenta: data.cuenta,
            numero: data.numero,
            titular: data.titular,
            ruc: data.ruc,
            email: data.email || 'donaciones@confraternidad.org.ec'
          });
        }
      });
  }

  private formatAsSeedDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  // --- ACTIONS ---
  addProgram(p: Omit<Programa, 'id' | 'beneficiarios' | 'ultimaActividad'>): void {
    const newProgram: Programa = {
      ...p,
      id: 'p_' + Math.random().toString(36).substring(2, 9),
      beneficiarios: 0,
      ultimaActividad: this.formatAsSeedDate(new Date())
    };
    this.programsSignal.update(list => [newProgram, ...list]);
    
    this.supabase.client.from('programas').insert({
      id: newProgram.id,
      nombre: newProgram.nombre,
      descripcion: newProgram.descripcion,
      responsable: newProgram.responsable,
      beneficiarios: newProgram.beneficiarios,
      ultima_actividad: newProgram.ultimaActividad,
      estado: newProgram.estado
    }).then(({ error }) => {
      if (error) console.error('Error adding program to Supabase:', error);
    });
  }

  addVolunteer(v: Omit<Voluntario, 'id' | 'avatarUrl' | 'estado'>): void {
    const newVolunteer: Voluntario = {
      ...v,
      id: 'v_' + Math.random().toString(36).substring(2, 9),
      estado: 'Pendiente',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3rtdwC8_CaNMRYe2tS2rysIBxug9BvXFO4M2SsSzDgWDnEBvrJRRt6Zc9Q9-Us08VU9rft154P3TYRHTkDGF3SkjtYeuagSm4BWftRDKWeOWlvJVMPZ6aaP4nQp5aCEzwotuXOJHqLVP0ceiCMUo-3ESnFAFj3UUTuzXmp6WiBvx7FU2dA2hHPMibnmU8fjstAwoQQG0LD3jQb1LGhlbyPgn9apMratOj3LjQjdfBtTjjJARe2VQUGq3WzmffonK64PNu0vdVZAA'
    };
    this.volunteersSignal.update(list => [newVolunteer, ...list]);

    this.supabase.client.from('voluntarios').insert({
      id: newVolunteer.id,
      nombre: newVolunteer.nombre,
      email: newVolunteer.email,
      ciudad: newVolunteer.ciudad,
      programa_asignado: newVolunteer.programaAsignado,
      estado: newVolunteer.estado,
      avatar_url: newVolunteer.avatarUrl
    }).then(({ error }) => {
      if (error) console.error('Error adding volunteer to Supabase:', error);
    });
  }

  addDonation(d: Omit<Donacion, 'id' | 'fecha' | 'estado'>): void {
    const newDonation: Donacion = {
      ...d,
      id: 'd_' + Math.random().toString(36).substring(2, 9),
      fecha: this.formatAsSeedDate(new Date()),
      estado: 'Confirmado'
    };
    this.donationsSignal.update(list => [newDonation, ...list]);

    this.supabase.client.from('donaciones').insert({
      id: newDonation.id,
      donante: newDonation.donante,
      email: newDonation.email,
      fecha: newDonation.fecha,
      monto: newDonation.monto,
      metodo: newDonation.metodo,
      estado: newDonation.estado
    }).then(({ error }) => {
      if (error) console.error('Error adding donation to Supabase:', error);
    });
  }

  updateDatosBancarios(datos: DatosBancarios): void {
    this.datosBancariosSignal.set(datos);
    
    this.supabase.client.from('datos_bancarios').upsert({
      id: 'default',
      banco: datos.banco,
      cuenta: datos.cuenta,
      numero: datos.numero,
      titular: datos.titular,
      ruc: datos.ruc,
      email: datos.email
    }).then(({ error }) => {
      if (error) console.error('Error updating bank details in Supabase:', error);
    });
  }

  updateProgramStatus(id: string, estado: 'Activo' | 'Planificación' | 'Inactivo'): void {
    this.programsSignal.update(list => list.map(p => p.id === id ? { ...p, estado } : p));
    this.supabase.client.from('programas').update({ estado }).eq('id', id)
      .then(({ error }) => {
        if (error) console.error('Error updating program status in Supabase:', error);
      });
  }

  deleteProgram(id: string): void {
    this.programsSignal.update(list => list.filter(p => p.id !== id));
    this.supabase.client.from('programas').delete().eq('id', id)
      .then(({ error }) => {
        if (error) console.error('Error deleting program in Supabase:', error);
      });
  }

  updateVolunteerStatus(id: string, estado: 'Activo' | 'Pendiente' | 'Inactivo'): void {
    this.volunteersSignal.update(list => list.map(v => v.id === id ? { ...v, estado } : v));
    this.supabase.client.from('voluntarios').update({ estado }).eq('id', id)
      .then(({ error }) => {
        if (error) console.error('Error updating volunteer status in Supabase:', error);
      });
  }

  deleteVolunteer(id: string): void {
    this.volunteersSignal.update(list => list.filter(v => v.id !== id));
    this.supabase.client.from('voluntarios').delete().eq('id', id)
      .then(({ error }) => {
        if (error) console.error('Error deleting volunteer in Supabase:', error);
      });
  }

  updateDonationStatus(id: string, estado: 'Confirmado' | 'Pendiente' | 'Rechazado'): void {
    this.donationsSignal.update(list => list.map(d => d.id === id ? { ...d, estado } : d));
    this.supabase.client.from('donaciones').update({ estado }).eq('id', id)
      .then(({ error }) => {
        if (error) console.error('Error updating donation status in Supabase:', error);
      });
  }

  deleteDonation(id: string): void {
    this.donationsSignal.update(list => list.filter(d => d.id !== id));
    this.supabase.client.from('donaciones').delete().eq('id', id)
      .then(({ error }) => {
        if (error) console.error('Error deleting donation in Supabase:', error);
      });
  }
}
