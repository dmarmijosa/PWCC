import { Component, signal, computed, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { Donacion } from '../../../core/models/data.models';
import Swal from 'sweetalert2';

function parseDateString(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const monthStr = parts[1].toLowerCase().substring(0, 3);
  const year = parseInt(parts[2], 10);
  const months: Record<string, number> = {
    ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5,
    jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11
  };
  const month = months[monthStr];
  if (month === undefined || isNaN(day) || isNaN(year)) return null;
  return new Date(year, month, day);
}

@Component({
  selector: 'app-admin-donaciones',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-donaciones.html'
})
export class AdminDonacionesComponent {
  private readonly dataService = inject(DataService);
  private readonly fb = inject(FormBuilder);

  // Filter State
  protected readonly searchQuery = signal('');
  protected readonly filterMethod = signal<string>('all');
  protected readonly filterDate = signal<string>('');

  // Modal State
  protected readonly isModalOpen = signal(false);

  // Form Group
  protected readonly donationForm = this.fb.group({
    donante: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    monto: [0, [Validators.required, Validators.min(0.01)]],
    metodo: ['Banco Pichincha', [Validators.required]]
  });

  // Filtered Donations list
  protected readonly filteredDonations = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const method = this.filterMethod();
    const date = this.filterDate();
    const list = this.dataService.donations();

    return list.filter(d => {
      // 1. Search Query (Donante/Email)
      const donante = (d.donante || '').toLowerCase();
      const email = (d.email || '').toLowerCase();
      const matchesQuery = donante.includes(query) || email.includes(query);

      // 2. Method Filter
      const matchesMethod = method === 'all' || d.metodo === method;

      // 3. Date Filter (Exact date matching)
      let matchesDate = true;
      if (date) {
        const rowDate = parseDateString(d.fecha);
        if (rowDate) {
          const rowYear = rowDate.getFullYear();
          const rowMonth = String(rowDate.getMonth() + 1).padStart(2, '0');
          const rowDay = String(rowDate.getDate()).padStart(2, '0');
          const rowDateStr = `${rowYear}-${rowMonth}-${rowDay}`;
          matchesDate = rowDateStr === date;
        } else {
          matchesDate = false;
        }
      }

      return matchesQuery && matchesMethod && matchesDate;
    });
  });

  protected onSearchChange(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected onMethodFilterChange(event: Event): void {
    this.filterMethod.set((event.target as HTMLSelectElement).value);
  }

  protected onDateFilterChange(event: Event): void {
    this.filterDate.set((event.target as HTMLInputElement).value);
  }

  protected clearFilters(): void {
    this.searchQuery.set('');
    this.filterMethod.set('all');
    this.filterDate.set('');
  }

  protected openModal(): void {
    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
    this.donationForm.reset({ metodo: 'Banco Pichincha', monto: 0 });
  }

  protected onSubmitDonation(): void {
    if (this.donationForm.valid) {
      const val = this.donationForm.value;
      this.dataService.addDonation({
        donante: val.donante || '',
        email: val.email || '',
        monto: val.monto || 0,
        metodo: val.metodo || 'Banco Pichincha'
      });
      this.closeModal();
    }
  }

  protected toggleDonationStatus(d: Donacion): void {
    const nextStatus = d.estado === 'Confirmado' ? 'Pendiente' : d.estado === 'Pendiente' ? 'Confirmado' : 'Confirmado';
    this.dataService.updateDonationStatus(d.id, nextStatus);
  }

  protected deleteDonation(id: string): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'No podrá revertir esta acción. El registro de donación será eliminado permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#D32F2F',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataService.deleteDonation(id);
        Swal.fire(
          '¡Eliminado!',
          'El registro de donación ha sido eliminado.',
          'success'
        );
      }
    });
  }
}
