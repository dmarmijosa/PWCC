import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-programs',
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './programs.html'
})
export class ProgramsComponent {}
