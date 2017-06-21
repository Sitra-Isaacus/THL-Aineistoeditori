import { Http, Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'

import { environment as env} from '../../environments/environment'

import { CodeList } from '../model2/code-list'

@Injectable()
export class CodeListService {

  constructor(
    private _http: Http
  ) { }

  search(query: string): Observable<CodeList[]> {
    return this._http.get(env.contextPath + '/api/v2/codeLists?query=' + query)
      .map(response => response.json() as CodeList[])
  }

  getAll(): Observable<CodeList[]> {
    return this.search("")
  }

  getById(id: string): Observable<CodeList> {
    return this._http.get(env.contextPath + '/api/v2/codeLists/' + id)
      .map(response => response.json() as CodeList)
  }

  save(codeList: CodeList): Observable<CodeList> {
    const path: string = env.contextPath + '/api/v2/codeLists/'
    const headers = new Headers({ 'Content-Type': 'application/json;charset=UTF-8' })
    const options = new RequestOptions({ headers: headers })

    if ('external' == codeList.codeListType) {
      codeList.codeItems = []
    }
    else if ('internal' == codeList.codeListType) {
      codeList.referenceId = null
    }

    return this._http.post(path, codeList, options)
      .map(response => response.json() as CodeList)
  }

}
