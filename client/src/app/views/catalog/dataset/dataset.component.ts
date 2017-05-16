import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { Dataset } from '../../../model2/dataset';
import { DatasetService } from '../../../services2/dataset.service';

@Component({
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.css']
})
export class DatasetComponent implements OnInit {

  dataset: Dataset;

  constructor(private datasetService: DatasetService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.getDataSet();
  }

  private getDataSet() {
    const datasetId = this.route.snapshot.params['id'];
    this.datasetService.getDataset(datasetId)
      .subscribe(dataset => this.dataset = dataset)
  }

}
