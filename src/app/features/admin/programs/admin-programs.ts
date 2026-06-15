import { Component, signal, computed, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { Programa } from '../../../core/models/data.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-programs',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-programs.html'
})
export class AdminProgramsComponent {
  private readonly dataService = inject(DataService);
  private readonly fb = inject(FormBuilder);

  // Search & Filter State
  protected readonly searchQuery = signal('');
  protected readonly filterStatus = signal<'all' | 'Activo' | 'Planificación' | 'Inactivo'>('all');

  // Modal State
  protected readonly isModalOpen = signal(false);

  // Form Group
  protected readonly programForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    responsable: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: ['', [Validators.required]],
    estado: ['Activo' as const, [Validators.required]]
  });

  // Filtered Programs list
  protected readonly filteredPrograms = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.filterStatus();
    const list = this.dataService.programs();

    return list.filter(p => {
      const nombre = (p.nombre || '').toLowerCase();
      const responsable = (p.responsable || '').toLowerCase();
      const descripcion = (p.descripcion || '').toLowerCase();

      const matchesQuery = nombre.includes(query) || 
                           responsable.includes(query) ||
                           descripcion.includes(query);
      const matchesStatus = status === 'all' || p.estado === status;
      return matchesQuery && matchesStatus;
    });
  });

  protected onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  protected onStatusFilterChange(status: 'all' | 'Activo' | 'Planificación' | 'Inactivo'): void {
    this.filterStatus.set(status);
  }

  protected openModal(): void {
    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
    this.programForm.reset({ estado: 'Activo' });
  }

  protected onSubmitProgram(): void {
    if (this.programForm.valid) {
      const val = this.programForm.value;
      this.dataService.addProgram({
        nombre: val.nombre || '',
        responsable: val.responsable || '',
        descripcion: val.descripcion || '',
        estado: (val.estado as Programa['estado']) || 'Activo'
      });
      this.closeModal();
    }
  }

  protected getProgramIcon(nombre: string): string {
    const n = nombre.toLowerCase();
    if (n.includes('evangelismo') || n.includes('discipulado') || n.includes('bíblico')) return 'menu_book';
    if (n.includes('médica') || n.includes('salud') || n.includes('medicina')) return 'medical_services';
    if (n.includes('psicológico') || n.includes('terapia') || n.includes('psicología')) return 'psychology';
    if (n.includes('oficio') || n.includes('carpintería') || n.includes('costura') || n.includes('panadería') || n.includes('taller')) return 'build';
    return 'assignment';
  }

  protected toggleProgramStatus(p: Programa): void {
    const nextStatus = p.estado === 'Activo' ? 'Inactivo' : p.estado === 'Inactivo' ? 'Planificación' : 'Activo';
    this.dataService.updateProgramStatus(p.id, nextStatus);
  }

  protected deleteProgram(id: string): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'No podrá revertir esta acción. El programa será eliminado permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#D32F2F',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataService.deleteProgram(id);
        Swal.fire(
          '¡Eliminado!',
          'El programa ha sido eliminado.',
          'success'
        );
      }
    });
  }
}
