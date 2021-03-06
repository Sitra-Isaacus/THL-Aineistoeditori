import { Http } from '@angular/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/map'

import { environment as env} from '../../environments/environment'

import { InstanceVariable } from '../model2/instance-variable'

@Injectable()
export class PublicInstanceVariableService {

  constructor(
    private http: Http
  ) { }

  getInstanceVariable(studyId:string, datasetId: string, instanceVariableId: string): Observable<InstanceVariable> {
    const url = env.contextPath
      + env.apiPath
      + '/public/studies/'
      + studyId
      +'/datasets/'
      + datasetId
      + '/instanceVariables/'
      + instanceVariableId
    return this.http.get(url).map(response => response.json() as InstanceVariable)
  }

  search(searchText = '', max = 100): Observable<InstanceVariable[]> {
    const url = env.contextPath
      + env.apiPath
      + '/public/instanceVariables?query='
      + searchText
      + '&max='
      + max
    return this.http.get(url).map(response => response.json() as InstanceVariable[])
  }

  getInstanceVariableAsCsvExportPath(studyId: string, datasetId: string, encoding = 'ISO-8859-15'): string {
    return env.contextPath
      + env.apiPath
      + '/public/studies/'
      + studyId
      + '/datasets/'
      + datasetId
      + '/instanceVariables.csv?'
      + 'encoding=' + encoding
  }

  getNextInstanceVariableId(studyId: string, datasetId: string, instanceVariableId: string): Observable<string> {
    const path: string = env.contextPath
      + env.apiPath
      + '/public/studies/'
      + studyId
      + '/datasets/'
      + datasetId
      + '/instanceVariables/'
      + instanceVariableId
      + '/next'

    return this.http.get(path)
      .map(response => response.json() as string)
  }
}
