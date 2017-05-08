import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Observable } from "rxjs";

import { DataSet } from '../../model/data-set';
import { DataSetService } from '../../services/data-set.service';
import { Node } from "../../model/node";
import { Organization } from "../../model/organization";
import { OrganizationService } from "../../services/organization.service";
import { Population } from "../../model/population";
import { PopulationService } from "../../services/population.service";
import { UsageCondition } from "../../model/usage-condition";
import { UsageConditionService } from "../../services/usage-condition.service";
import { NodeUtils } from "../../utils/node-utils";
import { LifecyclePhase } from "../../model/lifecycle-phase";
import { LifecyclePhaseService } from "../../services/lifecycle-phase.service";

@Component({
  templateUrl: './data-set-edit.component.html'
})
export class DataSetEditComponent implements OnInit {

  dataSet: DataSet;
  population: Population;
  usageCondition: UsageCondition;
  allOrganizations: Organization[];
  allUsageConditions: UsageCondition[];
  lifecyclePhase : LifecyclePhase;

  constructor(
    private dataSetService: DataSetService,
    private nodeUtils: NodeUtils,
    private populationService: PopulationService,
    private organizationService: OrganizationService,
    private usageConditionService: UsageConditionService,
    private lifecyclePhaseService: LifecyclePhaseService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.getDataSet();
  }

  private getDataSet() {
    const datasetId = this.route.snapshot.params['id'];
    Observable.forkJoin(
      this.dataSetService.getDataSet(datasetId),
      this.dataSetService.getDataSetPopulations(datasetId),
      this.dataSetService.getDataSetUsageCondition(datasetId),
      this.organizationService.getAllOrganizations(),
      this.usageConditionService.getAllUsageConditions(),
      this.dataSetService.getLifecyclePhases(datasetId)
    ).subscribe(
      data => {
        this.dataSet = data[0],
        this.initProperties(this.dataSet, [
          'abbreviation',
          'abstract',
          'altLabel',
          'description',
          'researchProjectURL',
          'registryPolicy',
          'usageConditionAdditionalInformation'
        ]);
        this.population = this.initializePopulationFields(data[1][0]);
        this.usageCondition = data[2][0];
        this.allOrganizations = data[3];
        this.allUsageConditions = data[4];
        this.lifecyclePhase = this.initializeLifecyclePhaseFields(data[5][0])
      }
    );
  }

private initializeLifecyclePhaseFields(lifecyclePhase: LifecyclePhase): LifecyclePhase {
    if (!lifecyclePhase) {
      lifecyclePhase = {
        id: null,
        type: {
          id: null,
          graph: {
            id: null
          }
        },
        properties: {},
        references: {}
      };
    }

    this.initProperties(lifecyclePhase, ['prefLabel']);

    return lifecyclePhase;
  }
  
  private initializePopulationFields(population: Population): Population {
    if (!population) {
      population = {
        id: null,
        type: {
          id: null,
          graph: {
            id: null
          }
        },
        properties: {},
        references: {}
      };
    }

    this.initProperties(population, ['prefLabel', 'geographicalCoverage', 'sampleSize', 'loss']);

    return population;
  }

  private initProperties(node: Node, properties: string[]) {
    for (let property of properties) {
      if (!node.properties[property] || !node.properties[property][0]) {
        node.properties[property] = [
          {
            lang: 'fi',
            value: null
          }
        ];
      }
    }
  }

  save() {
    this.populationService.savePopulation(this.population)
      .subscribe(savedPopulation => {
        this.population = this.initializePopulationFields(savedPopulation);

        this.dataSet.references['population'] = [ savedPopulation ];
        this.dataSet.references['usageCondition'] = [ this.usageCondition ];

        this.lifecyclePhaseService.saveLifecyclePhase(this.lifecyclePhase)
          .subscribe(savedLifecyclePhase => {
            this.lifecyclePhase = this.initializeLifecyclePhaseFields(savedLifecyclePhase);
        
            this.dataSet.references['lifecyclePhase'] = [ savedLifecyclePhase ];
        
            this.dataSetService.saveDataSet(this.dataSet)
              .subscribe(savedDataSet => {
                this.dataSet = savedDataSet;
                this.goBack();
              });
            });
        });
  }

  goBack() {
    this.router.navigate(['/datasets', this.dataSet.id]);
  }
}
