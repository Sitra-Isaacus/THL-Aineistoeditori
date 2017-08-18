import {ActivatedRoute, Router} from '@angular/router';
import {
  Component, OnInit, ViewChild,
  AfterContentChecked
} from '@angular/core'
import {NgForm} from '@angular/forms'
import {Observable, Subscription} from 'rxjs';
import {SelectItem} from 'primeng/components/common/api'
import {Title} from '@angular/platform-browser'
import {TranslateService} from '@ngx-translate/core';
import {TruncateCharactersPipe} from 'ng2-truncate/dist/truncate-characters.pipe'

import {Concept} from '../../../model2/concept';
import {ConceptService} from '../../../services2/concept.service';
import {Dataset} from '../../../model2/dataset';
import {DatasetService} from '../../../services2/dataset.service';
import {DatasetType} from '../../../model2/dataset-type'
import {DatasetTypeItem} from '../../../model2/dataset-type-item'
import {DatasetTypeService} from '../../../services2/dataset-type.service'
import {DateUtils} from '../../../utils/date-utils'
import {GrowlMessageService} from '../../../services2/growl-message.service'
import {LangPipe} from '../../../utils/lang.pipe'
import {LifecyclePhase} from "../../../model2/lifecycle-phase";
import {LifecyclePhaseService} from "../../../services2/lifecycle-phase.service";
import {NodeUtils} from '../../../utils/node-utils';
import {Organization} from "../../../model2/organization";
import {OrganizationService} from "../../../services2/organization.service";
import {OrganizationUnit} from "../../../model2/organization-unit";
import {OrganizationUnitService} from "../../../services2/organization-unit.service";
import {PopulationService} from '../../../services2/population.service'
import {SidebarActiveSection} from './sidebar/sidebar-active-section'
import {StringUtils} from '../../../utils/string-utils'
import {UnitType} from "../../../model2/unit-type";
import {UnitTypeService} from "../../../services2/unit-type.service";
import {Universe} from '../../../model2/universe'
import {UniverseService} from '../../../services2/universe.service'
import {UsageCondition} from "../../../model2/usage-condition";
import {UsageConditionService} from "../../../services2/usage-condition.service";

@Component({
    templateUrl: './data-set-edit.component.html',
    providers: [LangPipe]
})
export class DataSetEditComponent implements OnInit, AfterContentChecked {

    dataset: Dataset;
    ownerOrganizationUnit: OrganizationUnit;

    @ViewChild('datasetForm') datasetForm: NgForm
    currentForm: NgForm
    formErrors: any = {
      'prefLabel': [],
      'referencePeriodStart': [],
      'referencePeriodEnd': []
    }

    yearRangeForReferencePeriodFields: string =  ('1900:' + (new Date().getFullYear() + 20))
    referencePeriodStart: Date
    referencePeriodEnd: Date

    allLifecyclePhases: LifecyclePhase[];
    allOrganizations: Organization[];
    allOrganizationUnits: OrganizationUnit[];
    allUsageConditions: UsageCondition[];
    language: string;
    lifecyclePhase: LifecyclePhase;
    conceptSearchSubscription: Subscription;
    conceptSearchResults: Concept[] = [];
    freeConcepts: string[] = [];

    allUnitTypes: UnitType[] = []
    newUnitType: UnitType

    allUniverseItems: SelectItem[] = []
    newUniverse: Universe

    // separate type labels and values for multiselect, id of datasetType as value for select
    datasetTypeItems: DatasetTypeItem[] = [];
    selectedDatasetTypeItems: string[] = [];
    datasetTypesById: {[datasetTypeId: string]: DatasetType} = {};

    savingInProgress: boolean = false
    savingHasFailed: boolean = false

    sidebarActiveSection = SidebarActiveSection.DATASET

    constructor(
        private datasetService: DatasetService,
        private lifecyclePhaseService: LifecyclePhaseService,
        private nodeUtils: NodeUtils,
        private organizationService: OrganizationService,
        private organizationUnitService: OrganizationUnitService,
        private growlMessageService: GrowlMessageService,
        private route: ActivatedRoute,
        private router: Router,
        private translateService: TranslateService,
        private unitTypeService: UnitTypeService,
        private usageConditionService: UsageConditionService,
        private datasetTypeService: DatasetTypeService,
        private conceptService: ConceptService,
        private langPipe: LangPipe,
        private truncatePipe: TruncateCharactersPipe,
        private titleService: Title,
        private populationService: PopulationService,
        private universeService: UniverseService,
        private dateUtils: DateUtils
    ) {
        this.language = this.translateService.currentLang
    }


    ngOnInit() {
        this.getDataset();
    }

    private getDataset() {
        const datasetId = this.route.snapshot.params['id'];
        if (datasetId) {
            Observable.forkJoin(
                this.datasetService.getDataset(datasetId)
            ).subscribe(
                data => {
                    this.dataset = this.initializeDatasetProperties(data[0])
                    this.selectedDatasetTypeItems = this.initializeSelectedDatasetTypes(this.dataset);
                    this.updatePageTitle()
                })
        } else {
            this.dataset = this.initializeDatasetProperties({
                id: null,
                prefLabel: null,
                altLabel: null,
                abbreviation: null,
                description: null,
                registryPolicy: null,
                usageConditionAdditionalInformation: null,
                published: null,
                referencePeriodStart: null,
                referencePeriodEnd: null,
                owner: null,
                ownerOrganizationUnit: [],
                usageCondition: null,
                lifecyclePhase: null,
                population: null,
                instanceVariables: [],
                numberOfObservationUnits: null,
                comment: null,
                conceptsFromScheme: [],
                links: [],
                freeConcepts: null,
                datasetTypes: [],
                unitType: null,
                universe: null
            });
        }

        this.organizationService.getAllOrganizations()
            .subscribe(organizations => this.allOrganizations = organizations)
        this.lifecyclePhaseService.getAllLifecyclePhases()
            .subscribe(lifecyclePhases => this.allLifecyclePhases = lifecyclePhases)
        this.usageConditionService.getAllUsageConditions()
            .subscribe(usageConditions => this.allUsageConditions = usageConditions)
        this.organizationUnitService.getAllOrganizationUnits()
            .subscribe(organizationUnits => this.allOrganizationUnits = organizationUnits)
        this.getAllUnitTypes()
        this.getAllUniverses()

        this.datasetTypeService.getDatasetTypes()
            .subscribe(datasetTypes => {

                let unsortedDatasetTypeItems: Array<DatasetTypeItem> = []

                datasetTypes.forEach(datasetType => {
                    let translatedTypeLabel = this.langPipe.transform(datasetType.prefLabel);
                    unsortedDatasetTypeItems.push(new DatasetTypeItem(translatedTypeLabel, datasetType.id));

                    this.datasetTypesById[datasetType.id] = datasetType;
                }
                );

                this.datasetTypeItems = unsortedDatasetTypeItems.sort(DatasetTypeItem.compare);
            })
    }

    private initializeDatasetProperties(dataset: Dataset): Dataset {
        this.initProperties(dataset, [
          'prefLabel',
          'abbreviation',
          'altLabel',
          'description',
          'researchProjectURL',
          'registryPolicy',
          'usageConditionAdditionalInformation',
          'freeConcepts'
        ])

        if (dataset.referencePeriodStart) {
          this.referencePeriodStart = new Date(dataset.referencePeriodStart)
        }
        if (dataset.referencePeriodEnd) {
          this.referencePeriodEnd = new Date(dataset.referencePeriodEnd)
        }

        if (!dataset.population) {
          dataset.population = this.populationService.initNew()
        }

        if (dataset.ownerOrganizationUnit.length > 0) {
            this.ownerOrganizationUnit = dataset.ownerOrganizationUnit[0];
        }

        if (dataset.freeConcepts && dataset.freeConcepts[this.language]) {
            this.freeConcepts = dataset.freeConcepts[this.language].split(';')
        }

        return dataset;
    }

    private initializeSelectedDatasetTypes(dataset: Dataset): string[] {
        let storedDatasetTypeItems = []
        dataset.datasetTypes.forEach(datasetType => {storedDatasetTypeItems.push(datasetType.id)});
        return storedDatasetTypeItems;
    }

    private initProperties(node: any, properties: string[]): void {
      this.nodeUtils.initLangValuesProperties(node, properties, [ this.language ])
    }

    private updatePageTitle():void {
        if(this.dataset.prefLabel) {
            let translatedLabel:string = this.langPipe.transform(this.dataset.prefLabel)
            let bareTitle:string = this.titleService.getTitle();
            this.titleService.setTitle(translatedLabel + " - " + bareTitle)
        }
    }

    private getAllUnitTypes() {
      this.unitTypeService.getAllUnitTypes()
        .subscribe(allUnitTypes => this.allUnitTypes = allUnitTypes)
    }

    private getAllUniverses() {
      this.allUniverseItems = []

      Observable.forkJoin(
        this.translateService.get('noUniverse'),
        this.universeService.getAllUniverses()
      ).subscribe(data => {
        this.allUniverseItems.push({
          label: data[0],
          value: null
        })

        data[1].forEach(universe => this.allUniverseItems.push(this.convertToUniverseItem(universe)))
      })
    }

    private convertToUniverseItem(universe: Universe): SelectItem {
      let label = this.langPipe.transform(universe.prefLabel);

      let description = this.langPipe.transform(universe.description)
      if (StringUtils.isNotBlank(description)) {
        label += (' - ' + this.truncatePipe.transform(description, 50))
      }

      return {
        label: label,
        value: universe
      }
    }

    ngAfterContentChecked(): void {
      if (this.datasetForm) {
        if (this.datasetForm !== this.currentForm) {
          this.currentForm = this.datasetForm
          this.currentForm.valueChanges.subscribe(data => this.validate(data))
        }
      }
    }

    private validate(data?: any): void {
      for (const field in this.formErrors) {
        this.formErrors[field] = []
        const control = this.currentForm.form.get(field)
        if (control && control.invalid && (this.savingInProgress || this.savingHasFailed)) {
          for (const key in control.errors) {
            this.formErrors[field] = [ ...this.formErrors[field], 'errors.form.' + key ]
          }
        }
      }
    }

    searchConcept(event: any): void {
        const searchText: string = event.query
        if (this.conceptSearchSubscription) {
            // Cancel possible on-going search
            this.conceptSearchSubscription.unsubscribe()
        }
        this.conceptSearchSubscription = this.conceptService.searchConcept(searchText)
            .subscribe(concepts => this.conceptSearchResults = concepts)
    }

    getConceptLanguages(concept: Concept): any {
        const languages = []
        for (let lang in concept.prefLabel) {
            if (concept.prefLabel.hasOwnProperty(lang) && lang != this.language) {
                languages.push(lang)
            }
        }
        return languages
    }

    addLink() {
      if (!this.dataset.links) {
          this.dataset.links = []
      }
      const link = {
        prefLabel: null,
        linkUrl: null
      }
      this.initProperties(link, [ 'prefLabel', 'linkUrl' ])
      this.dataset.links = [ ...this.dataset.links, link ]
    }

    removeLink(link) {
        let index: number = this.dataset.links.indexOf(link);
        if (index !== -1) {
            this.dataset.links.splice(index, 1);
        }
    }

    private resolveSelectedDatasetTypes(): DatasetType[] {

        let selectedDatasetTypes: Array<DatasetType> = [];

        if (this.selectedDatasetTypeItems) {
            this.selectedDatasetTypeItems.forEach(datasetTypeId => {
                let datasetType: DatasetType = this.datasetTypesById[datasetTypeId];
                selectedDatasetTypes.push(datasetType);
            });
        }

        return selectedDatasetTypes;
    }

    importXml(event) {
        this.datasetService.importDataset(event).subscribe(
            data => {
                this.dataset = this.initializeDatasetProperties(data);
            }, error => {
                console.log(error);
            });
    }

    showAddUnitTypeModal(): void {
      this.initNewUnitType()
    }

    private initNewUnitType(): void {
      this.newUnitType = this.unitTypeService.initNew()
    }

    saveUnitType(): void {
      this.unitTypeService.save(this.newUnitType)
        .subscribe(savedUnitType => {
          this.getAllUnitTypes()
          this.dataset.unitType = savedUnitType
          this.closeAddUnitTypeModal()
        })
    }

    closeAddUnitTypeModal() {
      this.newUnitType = null
    }

    showAddUniverseModal(): void {
      this.initNewUniverse()
    }

    private initNewUniverse(): void {
      this.newUniverse = this.universeService.initNew()
    }

    saveUniverse(): void {
      this.universeService.save(this.newUniverse)
        .subscribe(savedUniverse => {
          this.getAllUniverses()
          this.dataset.universe = savedUniverse
          this.closeAddUniverseModal()
        })
    }

    closeAddUniverseModal() {
      this.newUniverse = null
    }

    save() {
        this.savingInProgress = true

        this.validate()

        if (this.currentForm.invalid) {
          this.growlMessageService.buildAndShowMessage('error',
            'operations.common.save.result.fail.summary',
            'operations.common.save.result.fail.detail')
          this.savingInProgress = false
          this.savingHasFailed = true
          return
        }

        this.dataset.referencePeriodStart = this.referencePeriodStart ?
          this.dateUtils.convertToIsoDate(this.referencePeriodStart) : null
        this.dataset.referencePeriodEnd = this.referencePeriodEnd ?
          this.dateUtils.convertToIsoDate(this.referencePeriodEnd) : null

        if (this.ownerOrganizationUnit) {
            this.dataset.ownerOrganizationUnit = [];
            this.dataset.ownerOrganizationUnit.push(this.ownerOrganizationUnit);
        }

        this.dataset.freeConcepts[this.language] = this.freeConcepts.join(';')

        this.dataset.datasetTypes = this.resolveSelectedDatasetTypes();

        this.datasetService.saveDataset(this.dataset)
            .finally(() => {
              this.savingInProgress = false
            })
            .subscribe(savedDataset => {
                this.dataset = savedDataset;
                this.goBack();
            });
    }

    goBack() {
        if (this.dataset.id) {
            this.router.navigate(['/editor/datasets', this.dataset.id]);
        } else {
            this.router.navigate(['/editor/datasets']);
        }
    }
}
