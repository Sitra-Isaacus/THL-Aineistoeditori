import { ActivatedRoute } from '@angular/router'
import { Component, Input} from '@angular/core'
import { Observable } from 'rxjs'
import { TranslateService } from '@ngx-translate/core'

import { Dataset } from '../../../model2/dataset'
import { DatasetService } from '../../../services2/dataset.service'
import { Variable } from '../../../model2/variable'
import { VariableService } from '../../../services2/variable.service'
import { LangPipe } from '../../../utils/lang.pipe';

@Component({
  templateUrl: './variable-search-result.component.html',
  selector: 'variable-search-result',
  styleUrls: ['./variable-search-result.component.css']
})
export class VariableSearchResultComponent {

  language: string

  @Input() variable: Variable
  editVariable : boolean

  constructor(private route: ActivatedRoute,
              private translateService: TranslateService,
              private variableService: VariableService) {
    this.language = this.translateService.currentLang
  }

  showVariableModal(variable): void {
    this.editVariable = true
    }

  saveVariable(variable): void {
    this.variableService.saveVariable(variable)
      .subscribe(savedVariable => {
        this.closeVariableModal()
    })
  }

  closeVariableModal(): void {
    this.editVariable = false
  }

}
