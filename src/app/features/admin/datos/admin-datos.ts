import { Component, signal, computed, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { Voluntario } from '../../../core/models/data.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-datos',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-datos.html'
})
export class AdminDatosComponent {
  private readonly dataService = inject(DataService);
  private readonly fb = inject(FormBuilder);

  // Search & Filter State
  protected readonly searchQuery = signal('');
  protected readonly filterStatus = signal<'all' | 'Activo' | 'Pendiente' | 'Inactivo'>('all');

  // Modal State
  protected readonly isModalOpen = signal(false);
  protected readonly isBankModalOpen = signal(false);

  // Form Group
  protected readonly volunteerForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    ciudad: ['', [Validators.required]],
    programaAsignado: ['', [Validators.required]]
  });

  protected readonly bankForm = this.fb.group({
    banco: ['', [Validators.required]],
    cuenta: ['', [Validators.required]],
    numero: ['', [Validators.required]],
    titular: ['', [Validators.required]],
    ruc: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]]
  });

  // Expose reactive metrics from DataService
  protected readonly totalDonado = this.dataService.totalDonationsAmount;
  protected readonly growthPercentage = this.dataService.donationsGrowthPercentage;
  protected readonly volunteersCount = this.dataService.volunteers;
  protected readonly activeVolunteersCount = this.dataService.totalVolunteersCount;
  protected readonly programsCount = this.dataService.totalProgramsCount;
  protected readonly datosBancarios = this.dataService.datosBancarios;

  // Filtered Volunteers list
  protected readonly filteredVolunteers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.filterStatus();
    const list = this.dataService.volunteers();

    return list.filter(v => {
      const nombre = (v.nombre || '').toLowerCase();
      const email = (v.email || '').toLowerCase();
      const ciudad = (v.ciudad || '').toLowerCase();
      const programa = (v.programaAsignado || '').toLowerCase();

      const matchesQuery = nombre.includes(query) || 
                           email.includes(query) ||
                           ciudad.includes(query) ||
                           programa.includes(query);
      const matchesStatus = status === 'all' || v.estado === status;
      return matchesQuery && matchesStatus;
    });
  });

  protected onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  protected onStatusFilterChange(status: 'all' | 'Activo' | 'Pendiente' | 'Inactivo'): void {
    this.filterStatus.set(status);
  }

  protected openModal(): void {
    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
    this.volunteerForm.reset();
  }

  protected onSubmitVolunteer(): void {
    if (this.volunteerForm.valid) {
      const val = this.volunteerForm.value;
      this.dataService.addVolunteer({
        nombre: val.nombre || '',
        email: val.email || '',
        ciudad: val.ciudad || '',
        programaAsignado: val.programaAsignado || ''
      });
      this.closeModal();
    }
  }

  protected openBankModal(): void {
    const current = this.datosBancarios();
    this.bankForm.patchValue(current);
    this.isBankModalOpen.set(true);
  }

  protected closeBankModal(): void {
    this.isBankModalOpen.set(false);
    this.bankForm.reset();
  }

  protected onSubmitBankDetails(): void {
    if (this.bankForm.valid) {
      const val = this.bankForm.value;
      this.dataService.updateDatosBancarios({
        banco: val.banco || '',
        cuenta: val.cuenta || '',
        numero: val.numero || '',
        titular: val.titular || '',
        ruc: val.ruc || '',
        email: val.email || ''
      });
      this.closeBankModal();
    }
  }

  protected toggleVolunteerStatus(v: Voluntario): void {
    const nextStatus = v.estado === 'Activo' ? 'Inactivo' : v.estado === 'Pendiente' ? 'Activo' : 'Activo';
    this.dataService.updateVolunteerStatus(v.id, nextStatus);
  }

  protected deleteVolunteer(id: string): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'No podrá revertir esta acción. El voluntario será eliminado permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#D32F2F',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataService.deleteVolunteer(id);
        Swal.fire(
          '¡Eliminado!',
          'El registro de voluntario ha sido eliminado.',
          'success'
        );
      }
    });
  }
}
