import { Component, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ReactiveFormsModule, NgOptimizedImage],
  templateUrl: './home.html'
})
export class HomeComponent {
  protected readonly dataService = inject(DataService);
  private readonly fb = inject(FormBuilder);

  // Volunteer registration form
  protected readonly volunteerForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    ciudad: ['', [Validators.required]],
    programa: ['', [Validators.required]]
  });

  // Success alert signal
  protected readonly formSubmitted = signal(false);

  // List of gallery image URLs directly from the design
  protected readonly galleryImages = signal<string[]>([
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC8OgMw0bhiTIPQ_8g9x1N890OGLGIOsJkpaTITrI0KwxfelcRgDwtlk2g509L7QtYY7fK_NOgT7PhWeD2K8Sw8PVii8_yhlO5eBsad1vL9piVK3ciRGwzLket00xe_CR28KxPGVmoZXPXNt7cQJQ52JBWN3TB0FpLHzGaLwIFJYtDjFrCjiFmfT9gjVeDXp6BXJqL57xAg3HdAWdVmDJl4IQTlYIdJ-jIBd5DHE7dXk3moj22OL0l3MB6PxyM4VuU_ZmChd4P5IR4',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBWHmuferIivJg3L9U4ngRpEDYAPSTDpB_IQEPMMLesLaP3eImQdzm1NrzzeeGiCV-tOCPzq7-XKbGzpOPqNDACgXUkAnb0H4-xjBg4olestVOq0AwzT0cuvZJdvLr8Zf2T1ohWQ2XXps6oZyaJvy35eZ3lWnwM9bANPNqiebrNFMcZoVicG9widw7Tyi_vCmTWQJNRn8zg14pmspFjYE5z8NdRbrgX-vN3MogyDZuPrmjwO58Mf3gNeCbeGii00ussD8gXu2qFg5s',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBHb1ug5kjnkjx7pxP5zASt9LZpekTEDHqUtkDUJmLzia9OX1xOhxaFnkwAR2uG2UqZQHJR5H_Y9Q_2PcZ9-qH1qwjm2SooqtqxFiztiqe7969evZC2UpB1kSschWHPTg7PtAxgnVbFO5bDqWnQWfD2O1z3RtmaVXDhCd7_Vv1xHya5svFxEICAte_Q1KN3fGtaHv5ga1Zg9Wupq9cluhthlkOXE4tD0iDHkast_2NriaXh9I1wnOHbH7OTdV3F9N09oMix6BizSBY',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBmUb5-uV5r-uJQVedxjuQMTvDTaVvmsc1Tf0Wyc8lS6xkkHS4PZv_sUI1rWshoneORYQNzpl99RTqs3CozYuANusyXYlAfZehzCAS3URc6IN-o6k8VfHw0uOx2UESgnIqobORiju58ogNubFbkUMkFYh_vOpcyM0HrW-Aw5NN1N2_fG17J1IQUXRRsPUvXm54XxUQA9Ji0gL3rFwN0G2snCpCJgrWTUGpD4pKZ88R7YNN4n7YP1rcJZWO5vYN7tea_StSW2rxPPkY',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCQcyRaxQksJw0bw0s0PXrAF5dop-JSMV9_TMBS5h-87PpPEhfi6cPPCfPHlY58vddMzHomnUf-KRfL0PnwYviYM19cs_V6P6SAUZAsckIS-zCgJ1iFvaYfpKhv153wcCJrTZeus2_UhsFCUbdod6048l5vt26pmEjBNfXwx4noU_Wvb-qHtbqHIg_OPI2V5TbiVJk4zWF0OTIISza4pOhggw_7NSKzRIDxFOtRd2uCSsgJbXYjVz5atg0B5-54ei5Qph5g1jEDxFY',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDVaVPKyApd6cNZHs8XBOZ3qomfb846CThL8EtuOVm-P-swqlSks5INLXIIvYVHsDgO_2hWwFML9HnpMznRJ1LmW-l7E4h2C8CI8hStEgUJsqZGHgracCAKMyH8iimlR9acZVfOLbpNF0KXpJ48eSzuQ5MH0smztDvoZynSgxNA2kPd59yG24AY6PrpkLUzQWFOPQB2CpmxJjT1QVZhq2ffDmvkJua1Wgp2hsIjBvjKQ0WcX4ydfjqJVwlO0rjtToN40j2f7wN4NME',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuASkWLBOT3Uy3Djtuvqn0a-2CDvrAkMSJ4ZYRRmv8f1i6u_aNH8vdlcDISN0oBfpsQvt64MW34AvmweVewsDBK8CxVvCUVofrMXvdomxjSLZCwhlQIr5bcrIyG0NU264HPjlnNfDHA7SEoEAJUZT6oE455Gc2VIxlKTKaU_0JWrakiaXdkQ_YaTBwgs1XZSJkrxVhAo5xLIvwVMJ6WzKTQGsccOL47xRAOXwxd08bKJzvCKgE3HvS9oW1RK1SS_FaNlNO9oyayetyw',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAdmMNem6gOFIWKOCHViJDoCfvapnz44CoFh3Sqj6N0qHh7QWdtPBVbk86GoVk7IfyHRLG93uVU6-UT-AV22pAwjATNZK0Up8oa4yGWp5Acr0why7HAXk_4VJyo2B8kvuMw5jll7yeIbp8yTwx0Ff56BmxIiJyQU0XvNxbF9x8PTetEC2ixjBZ9peaJ3x0RE4su87F50dh0pPtl2amms8MfLkTdc3o1qBFM2ruNc72QlvrVm7q52u0Xb48M5xbs-9HPhES2fPjXYdE',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD8UowurmywZoKFGpMH8I-ZZ99LtN4nZHJy2g_kbrFcpzHawAubkSHjQsd-kcfnimlQsr3inR6zliaW_IJaFgXWzgDcgEuPsYAuvmHVvYaQdFsMyqJVsGMh1rlaDjXVtHvFfQI63CWEFTmteq_h20SmFG--E35oPuMTdndTEfQGzXstUhjUjngfCs_yVJlx5OPRHrrChMxx2MFvneJej3xsJk85ivljWqOBgobcrfiRe_KgniBY5V13vfI1rGghUgj8VhFzKrPvf2E',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBr9WpQYvf8UKoBszFxuY-UeU2nFvKqX26wFXyMedHbsbzTlWVsKRMyuywvQh2BULY1zGf6Bsu3B1A3n1hEEp5hhERyZCSe0Ow8rDwA2K7d15rwWszMIMWlGhjdDdvHZMPiVSonTTqRts2y9YavrrhuuTawPw3qG4PJaKA8YI0Zltsz9YL8FSPSQgJHrv7nyDF35pMKNuvdWHPt2obG_TAx8NK_GmRfN7-ibp19lTq3t_jNeeq4hkdZg6I-nq0pSTe4lASmOolwNNA',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCc01aWT3DUTgNpv8p2i4T7KHbRTx5xakrCJMSU2MKLCzm4me3cICLlrYrLfgHB7BR2IFA7YfnFgqT-v_XR4iCT5-MyMw-l3hout4Aw_Gexprn6zAWdDonwiyZOdme_21dqYUH4tEEqgef7mdaww5-30qT1JwWItmQxGMljQOZab1o8VaKHzTBY8L15K7JerM-zoXrPFDQl3s9oUGHsV2w5Wlxa9rUp1xCD_Mnax7VhAscUbXpXFV08BvkBD2QuEl2VWuL8CE4GaAg'
  ]);

  onSubmitVoluntario(): void {
    if (this.volunteerForm.valid) {
      const rawValue = this.volunteerForm.value;
      
      this.dataService.addVolunteer({
        nombre: rawValue.nombre || '',
        email: rawValue.email || '',
        ciudad: rawValue.ciudad || '',
        programaAsignado: rawValue.programa || ''
      });

      this.formSubmitted.set(true);
      this.volunteerForm.reset();

      // Clear alert after 5 seconds
      setTimeout(() => {
        this.formSubmitted.set(false);
      }, 5000);
    }
  }
}
