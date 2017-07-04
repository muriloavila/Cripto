var gulp = require('gulp');
var convertEncoding = require('gulp-convert-encoding');
var minify = require('gulp-minify');
var chmod = require('gulp-chmod');
var debug = require('gulp-debug');


var path = ['ICARUS/**/**/*.js', '!ICARUS/base/**/*.js', '!ICARUS/component/**/', '!ICARUS/api/**/**/*', '!ICARUS/api/**/**/*'];

gulp.task('teste', function() {
    gulp.src(path)
      .pipe(debug());
});

gulp.task('compress', function() {
    gulp.src(path, {base: './'})
        .pipe(debug())
        .pipe(convertEncoding({from: 'ISO-8859-1', to: 'UTF-8'}))
        .pipe(minify({
            ext:{
                src:'.exclude.js',
                min:'.js'
            },
            exclude: ['tasks'],
            ignoreFiles: ['.combo.js', '.min.js', 'jquery.min.js'],
            noSource: true
        }))
        .pipe(convertEncoding({from: 'UTF-8', to: 'ISO-8859-1'}))
        .pipe(chmod(0777))
        .pipe(gulp.dest('./'));
});

gulp.task('default',['compress'], function() {
    console.log('Deu Certo!');
});