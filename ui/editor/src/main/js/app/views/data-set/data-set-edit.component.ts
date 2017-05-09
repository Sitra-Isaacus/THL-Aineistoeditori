import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Observable } from "rxjs";
import { DatePipe } from '@angular/common';

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

  // selected dates from the date picker
  selectedReferencePeriodStartDate: string;
  selectedReferencePeriodEndDate: string;

  // toggling visibility of date picker
  showReferencePeriodStartCalendar: boolean;
  showReferencePeriodEndCalendar: boolean;

  // the used short ISO date format for storing dates 
  static readonly DATE_FORMAT_SIMPLIFIED = "yyyy-MM-dd";

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
    private router: Router,
    private datePipe: DatePipe
  ) {
      this.showReferencePeriodStartCalendar = false;
      this.showReferencePeriodEndCalendar = false;
   }

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
        this.nodeUtils.initProperties(this.dataSet, [
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
        this.lifecyclePhase = this.initializeLifecyclePhaseFields(data[5][0]),
        this.populateReferencePeriodDates();
      }
    );
  }

private initializeLifecyclePhaseFields(lifecyclePhase: LifecyclePhase): LifecyclePhase {
    if (!lifecyclePhase) {
      lifecyclePhase = this.nodeUtils.createNode();
    }

    this.nodeUtils.initProperties(lifecyclePhase, ['prefLabel']);

    return lifecyclePhase;
  }

  private initializePopulationFields(population: Population): Population {
    if (!population) {
      population = this.nodeUtils.createNode();
    }

    this.nodeUtils.initProperties(population, ['prefLabel', 'geographicalCoverage', 'sampleSize', 'loss']);

    return population;
  }

  save() {

    this.simplifyReferencePeriodDates();

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


  // Fill in the date picker dates when initalizing the view
  private populateReferencePeriodDates() {
    
    // check whether reference period dates have been set for the dataset or if they are empty
    let referencePeriodStartDateExists =  !!this.dataSet.properties.referencePeriodStart;
    let referencePeriodEndDateExists = !!this.dataSet.properties.referencePeriodEnd;

    // populate selected dates for date picker from dataset
    // don't try to read null values for dates, default to undefined if no dates defined yet
    this.selectedReferencePeriodStartDate = referencePeriodStartDateExists ? this.dataSet.properties.referencePeriodStart[0].value : undefined ;  
    this.selectedReferencePeriodEndDate = referencePeriodEndDateExists ? this.dataSet.properties.referencePeriodEnd[0].value : undefined;  
}


  // Convert and assign long dates from the date picker to shorter ones used in the data model. 
  // Example conversion: "Thu May 04 2017 00:00:00 GMT+0300 (EEST)" -> 2017-05-04  
  
  private simplifyReferencePeriodDates() {

    // check if user input for reference period dates

    let referencePeriodStartDateSelected = !!this.selectedReferencePeriodStartDate;
    let referencePeriodEndDateSelected = !!this.selectedReferencePeriodEndDate;

    // check if insertion is possible at all and reference dates have been generally defined for the data set
    // TODO: what to do if properties do not yet exist at all in Termed? Need to insert new nodes? Now it's an error.  
    
    let referencePeriodStartExistInModel = !!this.dataSet.properties.referencePeriodStart;
    let referencePeriodEndExistInModel = !!this.dataSet.properties.referencePeriodEnd;

    // only update reference period values if a date has been selected
    // also, convert long date formats to simplified date string

    if(referencePeriodStartDateSelected && referencePeriodStartExistInModel) {
      let simplifiedReferencePeriodStartDate = this.simplifyDate(this.selectedReferencePeriodStartDate);
      this.dataSet.properties.referencePeriodStart[0].value = simplifiedReferencePeriodStartDate;
    }

    if(referencePeriodEndDateSelected && referencePeriodEndExistInModel) {
      let simplifiedReferencePeriodEndDate = this.simplifyDate(this.selectedReferencePeriodEndDate);
      this.dataSet.properties.referencePeriodEnd[0].value = simplifiedReferencePeriodEndDate; 
    }

  }

  // Convert a single long date to short ISO format
  // Example conversion: "Thu May 04 2017 00:00:00 GMT+0300 (EEST)" -> 2017-05-04    
  private simplifyDate(fullDate) {
    let simplifiedDate = this.datePipe.transform(fullDate, DataSetEditComponent.DATE_FORMAT_SIMPLIFIED);
    return simplifiedDate;
  }

  // Toggle the visibility of the reference start period, showing or hiding the date picker
  public toggleReferenceStartPeriodCalendar() {
      this.showReferencePeriodStartCalendar = !this.showReferencePeriodStartCalendar;
  }


  // Toggle the visibility of the reference end period, showing or hiding the date picker
  public toggleReferenceEndPeriodCalendar() {
      this.showReferencePeriodEndCalendar = !this.showReferencePeriodEndCalendar;
  }

  goBack() {
    this.router.navigate(['/datasets', this.dataSet.id]);
  }
}
