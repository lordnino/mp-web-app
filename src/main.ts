import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from 'app/app.component';
import { appConfig } from 'app/app.config';
import { register as reisterSwiperElements } from 'swiper/element/bundle';

reisterSwiperElements();
bootstrapApplication(AppComponent, appConfig).catch((err) =>
    console.error(err)
);
