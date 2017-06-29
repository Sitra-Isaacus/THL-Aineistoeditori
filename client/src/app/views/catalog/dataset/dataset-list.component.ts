import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/toPromise';

import { Dataset } from "../../../model2/dataset";
import { Organization } from "../../../model2/organization";
import { DatasetService } from "../../../services2/dataset.service";
import { OrganizationService } from "../../../services2/organization.service";

@Component({
  templateUrl: './dataset-list.component.html'
})
export class DatasetListComponent implements OnInit {
  
  organizations: Organization[]
  datasets: Dataset[]

  datasetQuery = ""
  selectedOrganizationId = ""

  constructor(
    private organizationService: OrganizationService,
    private datasetService: DatasetService
  ) { }

  ngOnInit(): void {
    this.organizationService.getAllOrganizations()
      .subscribe(organizations => {
        this.organizations = organizations
      })
    this.datasetService.getAllDatasets()
      .subscribe(datasets => {
        this.datasets = datasets.filter(dataset => dataset.published == true)
      })
  }

  selectOrganization(organizationId: string) {
    this.selectedOrganizationId = organizationId
    this.datasetService.getDatasets(organizationId, this.datasetQuery)
      .subscribe(datasets => {
        this.datasets = datasets.filter(dataset => dataset.published == true)
      })
  }

  search(query: string) {
    this.datasetQuery = query;
    this.datasetService.getDatasets(this.selectedOrganizationId, query)
      .subscribe(datasets => {
        this.datasets = datasets.filter(dataset => dataset.published == true)
      })
  }

}
