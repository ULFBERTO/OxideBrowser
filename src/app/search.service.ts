import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface SearchResult {
  id: number;
  url: string;
  title: string;
  content: string;
}

export interface ImageResult {
  id: number;
  url: string;
  thumbnailUrl: string;
  title: string;
  source: string;
  width: number;
  height: number;
}

export interface VideoResult {
  id: number;
  url: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  channel: string;
  duration: string;
  views: string;
  publishedAt: string;
}

export interface NewsResult {
  id: number;
  url: string;
  title: string;
  description: string;
  source: string;
  imageUrl: string;
  publishedAt: string;
}

export interface EventResult {
  id: number;
  title: string;
  description: string;
  location: string;
  day: string;
  month: string;
  time: string;
  url: string;
}

export interface AiResponse {
  response: string;
  sources: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = 'https://www.OxideBrowserBack.somee.com/api';

  constructor(private http: HttpClient) { }

  search(query: string): Observable<SearchResult[]> {
    return this.http.post<{ query: string; results: SearchResult[] }>(`${this.apiUrl}/search`, { query }).pipe(
      map(response => response.results || []),
      catchError(() => of([]))
    );
  }

  searchImages(query: string): Observable<ImageResult[]> {
    return this.http.get<ImageResult[]>(`${this.apiUrl}/images`, { params: { q: query } }).pipe(
      catchError(() => of([]))
    );
  }

  searchVideos(query: string): Observable<VideoResult[]> {
    return this.http.get<VideoResult[]>(`${this.apiUrl}/videos`, { params: { q: query } }).pipe(
      catchError(() => of([]))
    );
  }

  searchNews(query: string): Observable<NewsResult[]> {
    return this.http.get<NewsResult[]>(`${this.apiUrl}/news`, { params: { q: query } }).pipe(
      catchError(() => of([]))
    );
  }

  searchEvents(query: string): Observable<EventResult[]> {
    return this.http.get<EventResult[]>(`${this.apiUrl}/events`, { params: { q: query } }).pipe(
      catchError(() => of([]))
    );
  }

  getAiResponse(query: string): Observable<AiResponse> {
    return this.http.post<AiResponse>(`${this.apiUrl}/ai/ask`, { query }).pipe(
      catchError(() => of({ response: 'Unable to process your request.', sources: [] }))
    );
  }
}
