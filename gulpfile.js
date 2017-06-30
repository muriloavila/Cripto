var gulp = require('gulp');
// var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var convertEncoding = require('gulp-convert-encoding');




// // //jshint
// gulp.task('jshint', function() {
//     return gulp.src('*.js')
//     		.pipe(jshint())
//     		.pipe(jshint.reporter('default', {verbose: true}))
//     		.pipe(jshint('.jshintrc'));
// });


//compressor
gulp.task('uglify', function() {
    gulp.src('*.js')
    .pipe(convertEncoding({from: 'ISO-8859-1', to: 'UTF-8'}))
    .pipe(uglify())
    .pipe(convertEncoding({from: 'UTF-8', to: 'ISO-8859-1'}))
    .pipe(gulp.dest('dist'));
});


gulp.task('default',['uglify'], function() {
    console.log('Deu Certo');
});

