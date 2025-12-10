import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService, SearchResult, ImageResult, VideoResult, NewsResult, EventResult } from './search.service';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface QuickCard {
  label: string;
  icon: string;
  query: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Oxide';
  searchResults: SearchResult[] = [];
  imageResults: ImageResult[] = [];
  allImageResults: ImageResult[] = [];
  videoResults: VideoResult[] = [];
  
  // Pagination
  currentImagePage = 1;
  imagesPerPage = 20;
  totalImagePages = 1;
  newsResults: NewsResult[] = [];
  eventResults: EventResult[] = [];
  searchQuery = '';
  searchPerformed = false;
  isLoading = false;
  searchFocused = false;
  aiMode = false;
  aiResponse = '';
  aiLoading = false;
  activeTab = 'all';

  tabs: Tab[] = [
    { id: 'all', label: 'All', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>' },
    { id: 'images', label: 'Images', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' },
    { id: 'videos', label: 'Videos', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>' },
    { id: 'news', label: 'News', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>' },
    { id: 'events', label: 'Events', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' }
  ];

  quickCards: QuickCard[] = [
    { label: 'Images', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>', query: 'beautiful landscapes' },
    { label: 'News', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>', query: 'latest news' },
    { label: 'Videos', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>', query: 'trending videos' },
    { label: 'Events', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>', query: 'events near me' }
  ];

  trendingItems = [
    'Artificial Intelligence',
    'Climate Change',
    'Space Exploration',
    'Cryptocurrency',
    'Electric Vehicles',
    'Quantum Computing'
  ];

  relatedSearches: string[] = [];

  constructor(
    private searchService: SearchService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const query = params['p'];
      const tab = params['tab'];
      if (query) {
        this.searchQuery = query;
        if (tab) this.activeTab = tab;
        this.performSearch();
      }
    });
  }

  goHome() {
    this.searchPerformed = false;
    this.searchQuery = '';
    this.searchResults = [];
    this.imageResults = [];
    this.videoResults = [];
    this.newsResults = [];
    this.eventResults = [];
    this.activeTab = 'all';
    this.aiResponse = '';
    this.router.navigate([]);
  }

  toggleAiMode() {
    this.aiMode = !this.aiMode;
    if (this.aiMode && this.searchPerformed && this.searchQuery) {
      this.getAiResponse();
    }
  }

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
    this.router.navigate([], {
      queryParams: { p: this.searchQuery, tab: tabId },
      queryParamsHandling: 'merge'
    });
    this.loadTabContent();
  }

  onSearch() {
    if (!this.searchQuery.trim()) return;
    this.router.navigate([], {
      queryParams: { p: this.searchQuery, tab: this.activeTab },
      queryParamsHandling: 'merge'
    });
    this.performSearch();
  }

  quickSearch(query: string) {
    this.searchQuery = query;
    this.onSearch();
  }


  private performSearch() {
    if (!this.searchQuery.trim()) return;
    this.searchPerformed = true;
    this.isLoading = true;
    this.generateRelatedSearches();
    this.loadTabContent();

    if (this.aiMode) {
      this.getAiResponse();
    }
  }

  private loadTabContent() {
    switch (this.activeTab) {
      case 'all':
        this.loadAllResults();
        break;
      case 'images':
        this.loadImages();
        break;
      case 'videos':
        this.loadVideos();
        break;
      case 'news':
        this.loadNews();
        break;
      case 'events':
        this.loadEvents();
        break;
    }
  }

  private loadAllResults() {
    this.searchService.search(this.searchQuery).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.isLoading = false;
      },
      error: () => {
        this.searchResults = [];
        this.isLoading = false;
      }
    });
  }

  private loadImages() {
    this.searchService.searchImages(this.searchQuery).subscribe({
      next: (results) => {
        this.allImageResults = results;
        this.totalImagePages = Math.ceil(results.length / this.imagesPerPage);
        this.currentImagePage = 1;
        this.updateDisplayedImages();
        this.isLoading = false;
      },
      error: () => {
        this.imageResults = [];
        this.allImageResults = [];
        this.isLoading = false;
      }
    });
  }

  private updateDisplayedImages() {
    const start = (this.currentImagePage - 1) * this.imagesPerPage;
    const end = start + this.imagesPerPage;
    this.imageResults = this.allImageResults.slice(start, end);
  }

  nextImagePage() {
    if (this.currentImagePage < this.totalImagePages) {
      this.currentImagePage++;
      this.updateDisplayedImages();
    }
  }

  prevImagePage() {
    if (this.currentImagePage > 1) {
      this.currentImagePage--;
      this.updateDisplayedImages();
    }
  }

  goToImagePage(page: number) {
    if (page >= 1 && page <= this.totalImagePages) {
      this.currentImagePage = page;
      this.updateDisplayedImages();
    }
  }

  getImagePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentImagePage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalImagePages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getImageSize(index: number): string {
    // Create varied sizes for masonry effect
    const sizes = ['small', 'medium', 'large', 'tall', 'wide'];
    const pattern = [0, 1, 2, 0, 3, 1, 4, 0, 1, 2, 3, 0];
    return sizes[pattern[index % pattern.length]];
  }

  private loadVideos() {
    this.searchService.searchVideos(this.searchQuery).subscribe({
      next: (results) => {
        this.videoResults = results;
        this.isLoading = false;
      },
      error: () => {
        this.videoResults = [];
        this.isLoading = false;
      }
    });
  }

  private loadNews() {
    this.searchService.searchNews(this.searchQuery).subscribe({
      next: (results) => {
        this.newsResults = results;
        this.isLoading = false;
      },
      error: () => {
        this.newsResults = [];
        this.isLoading = false;
      }
    });
  }

  private loadEvents() {
    this.searchService.searchEvents(this.searchQuery).subscribe({
      next: (results) => {
        this.eventResults = results;
        this.isLoading = false;
      },
      error: () => {
        this.eventResults = [];
        this.isLoading = false;
      }
    });
  }

  private getAiResponse() {
    this.aiLoading = true;
    this.aiResponse = '';
    this.searchService.getAiResponse(this.searchQuery).subscribe({
      next: (response) => {
        this.aiResponse = response.response;
        this.aiLoading = false;
      },
      error: () => {
        this.aiResponse = 'Unable to generate AI response at this time.';
        this.aiLoading = false;
      }
    });
  }

  private generateRelatedSearches() {
    const words = this.searchQuery.split(' ');
    this.relatedSearches = [
      `${this.searchQuery} tutorial`,
      `${this.searchQuery} examples`,
      `best ${this.searchQuery}`,
      `${this.searchQuery} 2024`,
      `how to ${this.searchQuery}`
    ];
  }

  getFavicon(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return 'assets/icon.ico';
    }
  }

  getDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  onFaviconError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/icon.ico';
  }

  openImage(img: ImageResult) {
    window.open(img.url, '_blank');
  }
}
