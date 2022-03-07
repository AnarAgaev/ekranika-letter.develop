// Package connection
const {src, dest, watch, series, parallel}  = require('gulp');
const del                                   = require('del');
const plumber                               = require('gulp-plumber');
const notify                                = require('gulp-notify');
const sass                                  = require('gulp-sass');
const autoprefixer                          = require('gulp-autoprefixer');
const cssbeautify                           = require('gulp-cssbeautify');
const pug                                   = require('gulp-pug');
const rename                                = require('gulp-rename');
const browserSync                           = require('browser-sync').create();

// Tasks
const clean = () => {
 return del('./build');
}

const buildCss = () => {
    return src('src/**/main.scss')
        .pipe(plumber({
            errorHandler: notify.onError( function(err){
                return {
                    title: 'Sass Styles Error',
                    message: err.message
                };
            })
        }))
        .pipe(sass())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 2 versions'],
            cascade: false,
        }))
        .pipe(cssbeautify({
            indent: '    ',
            openbrace: 'end-of-line',
            autosemicolon: true
        }))
        .pipe(rename({
            dirname: '',
            basename: 'style',
            extname: '.css'
        }))
        .pipe(dest('build'))
        .pipe(plumber.stop())
        .pipe(browserSync.stream());
}

const buildHtml = () => {
    return src(['src/pages/**/index.pug'])
        .pipe(plumber({
            errorHandler: notify.onError( function(err){
                return {
                    title: 'Pug Error',
                    message: err.message
                };
            })
        }))
        .pipe(pug({
            pretty: true
        }))
        .pipe(rename(fileObj => {
            fileObj.basename = fileObj.dirname;
            fileObj.dirname = '';
        }))
        .pipe(dest('build'))
        .pipe(plumber.stop())
        .pipe(browserSync.stream());
}

const server = () => {
    browserSync.init({
        server: {
            baseDir: "./build"
        }
    });
}

// Watchers
watch('src/**/*.scss', buildCss);
watch('src/**/*.pug', buildHtml);

// Build project
exports.default = series(
    clean,
    parallel(
        buildCss,
        buildHtml
    ),
    server
);