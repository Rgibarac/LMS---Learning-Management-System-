import { Injectable } from '@angular/core';
import { parseStringPromise } from 'xml2js';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class XmlService {
  constructor(private apiService: ApiService) {}

  async validateXml(xmlData: string): Promise<boolean> {
    try {
      await parseStringPromise(xmlData);
      return true;
    } catch (error) {
      console.error('XML Validation Error:', error);
      return false;
    }
  }

 // uploadEvaluationXml(xmlData: string): Promise<any> {
  //return this.apiService.uploadEvaluationXml(xmlData).toPromise();
  //}
}