import { Component, Renderer2, ElementRef, AfterContentInit, AfterViewInit } from '@angular/core';
import { OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';


import { Score, ScoreInterface } from '../interface';

// Declare custom service here
import { ReadJsonFileService } from '../services';
import { Broadcaster } from '../services/broadcaster.service';
import { IframeGeneratorService } from '../services/iframe.generator.service';

@Component({
    selector: 'app-front-page',
    templateUrl: './front.page.html',
    styleUrls: ['./front.page.scss']
})

export class FrontPageComponent implements OnInit {

    data: Array<ScoreInterface> = [];
    searchResults: Array<ScoreInterface> = [];
    scoresList: Array<ScoreInterface> = [];

    openIn: boolean;
    iframeUrl: string;

    constructor(private title: Title,
                private reader: ReadJsonFileService,
                private _broadcaster: Broadcaster,
                private _r2: Renderer2,
                private _elem: ElementRef,
                private _iframeGenerator: IframeGeneratorService
    ) {
        this.title.setTitle('Rhumato Scores');
        this.openIn = false;

        this.getScoresList();
    }

    ngOnInit() {
        this._broadcaster.on('filter.on.scores.category', (data) => {
            this.filterScoreListOnCategory(data.category);
        });

        this._broadcaster.on('open.score.in.iframe', (data) => {
            this.openIn = true;
            this._iframeGenerator.setUrl(data.url).setRenderer2(this._r2).createWithRenderer2();
        });

        this._broadcaster.on('close.score.iframe', (data) => {
            this.openIn = false;
            this.scoresList = this.data;
            document.querySelector('iframe').remove();
        });
    }

    /**
     * flat score list : affects correct pathology to each score entry
     */
    getScoresList() {
        this.reader.getJsonData('assets/data.json')
            .then((res: Array<ScoreInterface>) => {
                this.data = res;
                this.scoresList = this.data;
                this.sortScores();
            });

    }

    filterScoresListe(e: any) {
        if (e.needle !== null && e.needle.length > 0) {
            this.scoresList = this.data
                .filter((score: ScoreInterface) => this.match(score, e.needle))
        }
    }

    filterScoreListOnCategory(category: string) {
        if (null === category) {
            this.scoresList = this.data;
        } else {

            this.scoresList = this.data.filter((score: ScoreInterface) => {
                if (score.category !== undefined && null !== score.category) {
                    return score.category.toLocaleLowerCase().includes(category.toLocaleLowerCase())
                }

                return false;
            });
        }
    }

    private match(score: ScoreInterface, term: string) {
        const subtitle = score.subtitle.toLocaleLowerCase();
        const title = score.title.toLocaleLowerCase();
        term = term.toLocaleLowerCase();

        if (subtitle.includes(term) || title.includes(term)) {
            return true;
        }

        return false;
    }

    private sortScores() {
        this.scoresList.sort((a, b) => a.title.toLocaleLowerCase().localeCompare(b.title.toLocaleLowerCase()));
    }
}
