import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService, SearchResult } from './search.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Oxide';
  searchResults: SearchResult[] = [];
  searchQuery: string = '';
  searchPerformed = false;

  constructor(private searchService: SearchService) {}

  onSearch() {
    if (!this.searchQuery.trim()) {
      return;
    }
    this.searchPerformed = true;
    this.searchService.search(this.searchQuery).subscribe(results => {
      this.searchResults = results;
    });
  }
}
