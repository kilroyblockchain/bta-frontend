import { NEBULAR_MODULE } from 'src/app/@core/constants/nebular-import-modules.constant';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

export const COMMON_SHARED_MODULE = [CommonModule, NgxPaginationModule, FormsModule, ReactiveFormsModule, ...NEBULAR_MODULE];
