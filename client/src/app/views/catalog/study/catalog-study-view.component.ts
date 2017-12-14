import { ActivatedRoute } from '@angular/router'
import { Component } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'

import { BreadcrumbService } from '../../../services-common/breadcrumb.service'
import { LangPipe } from '../../../utils/lang.pipe'
import { PublicStudyService } from '../../../services-public/public-study.service'
import { Study } from '../../../model2/study'
import { StudyDetailHighlight } from './study-detail-highlight'
import { StringUtils } from '../../../utils/string-utils'
import { Title } from '@angular/platform-browser'

@Component({
  templateUrl: './catalog-study-view.component.html',
  styleUrls: ['./catalog-study-view.component.css']
})
export class CatalogStudyViewComponent {

  study: Study
  loadingStudy: boolean
  language: string

  Math: Math
  readonly datasetLabelTruncateLength: number = 50
  readonly datasetLabelTruncateFromEndLength: number = -20

  StudyDetailHighlight = StudyDetailHighlight
  highlights: StudyDetailHighlight[] = []

  constructor(
    private studyService: PublicStudyService,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private titleService: Title,
    private langPipe: LangPipe) {
    this.language = this.translateService.currentLang
    this.Math = Math
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.loadingStudy = true
      this.study = null

      this.studyService.getStudy(params['id']).subscribe(study => {
        this.study = study
        this.updatePageTitle()
        this.breadcrumbService.updateCatalogBreadcrumbsForStudyDatasetAndInstanceVariable(study)
        this.pickHighlightedDetails()
        this.loadingStudy = false
      })
    })
  }

  private updatePageTitle(): void {
    if (this.study.prefLabel) {
      let translatedLabel: string = this.langPipe.transform(this.study.prefLabel)
      let bareTitle: string = this.titleService.getTitle();
      this.titleService.setTitle(translatedLabel + " - " + bareTitle)
    }
  }

  pickHighlightedDetails() {
    if (this.study.universe) {
      this.highlights.push(StudyDetailHighlight.UNIVERSE)
    }

    if (this.study.referencePeriodStart || this.study.referencePeriodEnd) {
      this.highlights.push(StudyDetailHighlight.REFERENCE_PERIOD)
    }

    if (this.study.population && this.study.population.geographicalCoverage) {
      let coverageInCurrentLang: string = this.langPipe.transform(this.study.population.geographicalCoverage)
      if (StringUtils.isNotEmpty(coverageInCurrentLang)) {
        this.highlights.push(StudyDetailHighlight.GEOGRAPHICAL_COVERAGE)
      }
    }
  }

}
