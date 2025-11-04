import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrganizationService } from '../../../services/organization.service';
import { Organization } from '../../../models/organization.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  currentOrganization: Organization | null = null;
  userMenuOpen = false;

  constructor(private organizationService: OrganizationService) {}

  ngOnInit(): void {
    this.organizationService.currentOrganization$.subscribe(org => {
      this.currentOrganization = org;
    });
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }
}

